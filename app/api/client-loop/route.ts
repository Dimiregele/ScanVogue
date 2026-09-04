import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import { computeOutcomeForResolution } from "@/lib/theme-resolution";
import { composeResolutionEmail } from "@/lib/complaint-ai";
import { wrapEmailHtml, paragraphHtml, signatureHtml } from "@/lib/email-html";

// Inchide bucla catre CLIENT, nu doar catre proprietar: daca o tema marcata
// "rezolvata" arata o imbunatatire REALA (confirmata statistic, nu doar
// declarata de restaurant), anuntam automat clientii care s-au plans exact
// de asta, inainte de remediu. Trimitem o singura data per rezolvare
// (coloana customers_notified_at), niciodata daca statusul nu e "improved".
//
// Mesajul catre client e compus de AI (foloseste nota managerului daca
// exista, dar nota ramane optionala -- fara ea, AI-ul ramane general si nu
// inventeaza detalii). Daca AI-ul esueaza din orice motiv, cade inapoi pe
// sablonul fix -- trimiterea nu se opreste niciodata din cauza unei erori AI.
//
// Declansata de un GitHub Action, protejata printr-un secret dedicat.
export async function POST(req: Request) {
  const secret = req.headers.get("x-report-secret");
  if (!secret || secret !== process.env.CLIENT_LOOP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Toate rezolvarile nenotificate inca, cele mai noi primele -- ca sa
  // pastram doar cea mai recenta rezolvare per (restaurant, tema) mai jos,
  // in caz ca aceeasi tema a fost marcata rezolvata de mai multe ori
  // inainte sa apuce vreuna sa fie evaluata.
  const { data: pendingResolutions, error } = await supabaseAdmin
    .from("theme_resolutions")
    .select("id, restaurant_id, theme, resolved_at, note")
    .is("customers_notified_at", null)
    .order("resolved_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Pastram doar cea mai recenta rezolvare nenotificata per (restaurant, tema)
  const seen = new Set<string>();
  const latestPerThemeRestaurant = (pendingResolutions ?? []).filter((r) => {
    const key = `${r.restaurant_id}|${r.theme}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const results: { resolutionId: string; theme: string; status: string; customersNotified: number; error?: string }[] = [];

  for (const resolution of latestPerThemeRestaurant) {
    try {
      const outcome = await computeOutcomeForResolution(
        resolution.restaurant_id,
        resolution.theme,
        resolution.id,
        resolution.resolved_at,
        resolution.note
      );

      // Doar imbunatatire CONFIRMATA statistic declanseaza mesajul catre
      // client -- niciodata "too_early", "insufficient_data", "unchanged"
      // sau "worsened". Randul ramane nenotificat si va fi reevaluat automat
      // la urmatoarea rulare (fara cost, e doar o interogare in baza de date).
      if (outcome.status !== "improved") {
        results.push({ resolutionId: resolution.id, theme: resolution.theme, status: outcome.status, customersNotified: 0 });
        continue;
      }

      const { data: restaurant } = await supabaseAdmin
        .from("restaurants")
        .select("name")
        .eq("id", resolution.restaurant_id)
        .single();

      const restaurantName = restaurant?.name ?? "restaurant";

      // Clientii care s-au plans EXACT de aceasta tema, INAINTE de rezolvare,
      // si care au lasat un email (nu putem contacta pe cineva fara adresa).
      const { data: affectedComplaints, error: complaintsError } = await supabaseAdmin
        .from("complaints")
        .select("contact_name, contact_email")
        .eq("restaurant_id", resolution.restaurant_id)
        .eq("theme", resolution.theme)
        .not("contact_email", "is", null)
        .lt("created_at", resolution.resolved_at);

      if (complaintsError) throw complaintsError;

      // Un client poate aparea de mai multe ori (a reclamat aceeasi tema de
      // cateva ori) -- il notificam o singura data, nu de cate ori a scris.
      const uniqueByEmail = new Map<string, { contact_name: string | null; contact_email: string }>();
      for (const c of affectedComplaints ?? []) {
        if (c.contact_email && !uniqueByEmail.has(c.contact_email)) {
          uniqueByEmail.set(c.contact_email, { contact_name: c.contact_name, contact_email: c.contact_email });
        }
      }

      const fromDefault = "feedback@resend.dev";
      const fromEnv = process.env.RESEND_FROM_EMAIL || fromDefault;
      const fromAddressMatch = fromEnv.match(/<(.+)>/);
      const fromAddress = fromAddressMatch ? fromAddressMatch[1] : fromEnv;

      // Compus o singura data per rezolvare (acelasi mesaj pentru toti
      // clientii afectati de aceasta tema) -- nu per client, ca sa nu
      // multiplicam inutil apelurile catre AI.
      const aiMessage = await composeResolutionEmail({
        theme: resolution.theme,
        deltaPct: outcome.deltaPct ?? 0,
        note: resolution.note,
      });

      const fallbackLine = `Ne-ai scris despre „${resolution.theme}” — între timp am schimbat ceva, și chiar a mers: de atunci avem cu ${Math.abs(outcome.deltaPct ?? 0)}% mai puține cazuri din astea.`;
      const improvementLine = aiMessage ?? fallbackLine;

      let sentCount = 0;
      for (const customer of uniqueByEmail.values()) {
        const displayName = customer.contact_name
          ? customer.contact_name.trim().replace(/^\p{L}/u, (c: string) => c.toLocaleUpperCase("ro-RO"))
          : null;

        const bodyParts = [
          paragraphHtml(displayName ? `Bună ${displayName},` : "Bună,"),
          paragraphHtml(improvementLine),
        ];
        // Nota se afiseaza separat DOAR cand AI-ul nu a reusit sa o integreze
        // deja natural in mesaj (adica atunci cand am cazut pe fallback).
        if (!aiMessage && resolution.note?.trim()) {
          bodyParts.push(paragraphHtml(resolution.note.trim(), "#9C9382"));
        }
        bodyParts.push(paragraphHtml("Mulțumim că ne-ai spus — ne-a ajutat să vedem exact ce trebuia reparat."));
        bodyParts.push(signatureHtml(restaurantName));

        const html = wrapEmailHtml(bodyParts.join("\n"));

        const { error: sendError } = await resend.emails.send({
          from: `${restaurantName} <${fromAddress}>`,
          to: customer.contact_email,
          subject: `Am rezolvat ce ne-ai semnalat — ${restaurantName}`,
          text: [
            displayName ? `Bună ${displayName},` : "Bună,",
            "",
            improvementLine,
            !aiMessage && resolution.note?.trim() ? `\n${resolution.note.trim()}` : "",
            "",
            "Mulțumim că ne-ai spus — ne-a ajutat să vedem exact ce trebuia reparat.",
            "",
            `— ${restaurantName}`,
          ]
            .filter(Boolean)
            .join("\n"),
          html,
        });

        if (!sendError) sentCount++;
      }

      // Marcam "notificat" doar daca n-a fost nimeni de anuntat, sau daca a
      // reusit macar un email -- daca AU EXISTAT clienti de anuntat dar TOATE
      // trimiterile au esuat (ex: o pana de moment la Resend), lasam randul
      // nenotificat ca sa fie reincercat automat la urmatoarea rulare, in loc
      // sa renuntam definitiv la o notificare care nu a ajuns nicaieri.
      if (uniqueByEmail.size === 0 || sentCount > 0) {
        const { error: updateError } = await supabaseAdmin
          .from("theme_resolutions")
          .update({ customers_notified_at: new Date().toISOString() })
          .eq("id", resolution.id);

        if (updateError) throw updateError;
      }

      results.push({ resolutionId: resolution.id, theme: resolution.theme, status: "improved", customersNotified: sentCount });
    } catch (err) {
      console.error(`Bucla catre client esuata pentru rezolvarea ${resolution.id}:`, err);
      results.push({ resolutionId: resolution.id, theme: resolution.theme, status: "error", customersNotified: 0, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
