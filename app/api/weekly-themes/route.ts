import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import { computeThemeStats } from "@/lib/theme-analysis";
import { getLatestResolutionOutcome, resolutionOutcomeLabel } from "@/lib/theme-resolution";
import {
  wrapEmailHtml,
  restaurantHeaderHtml,
  paragraphHtml,
  mutedTextHtml,
  themeListHtml,
  ctaButtonHtml,
} from "@/lib/email-html";

// Fereastra de analiza e mai lunga decat cadenta de trimitere in mod
// deliberat: trimitem saptamanal (ca sa fie un memento constant, nu doar
// lunar), dar analizam ultimele 30 de zile de fiecare data, ca sa avem
// destule date pentru un tipar real, nu doar 7 zile (prea putin, aproape
// mereu "nicio tema clara").
const ANALYSIS_WINDOW_DAYS = 30;

// Declansata saptamanal de un GitHub Action, NU de useri -- protejata printr-un
// secret dedicat (diferit de cel al raportului lunar), ca sa limitam ce se
// poate face daca unul dintre cele doua secrete ar fi vreodata compromis.
export async function POST(req: Request) {
  const secret = req.headers.get("x-report-secret");
  if (!secret || secret !== process.env.WEEKLY_THEMES_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: restaurants, error } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, alert_email")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - ANALYSIS_WINDOW_DAYS);

  const results: { restaurantId: string; sent: boolean; themesFound: number; error?: string }[] = [];

  for (const restaurant of restaurants ?? []) {
    try {
      const { count: totalScans } = await supabaseAdmin
        .from("scans")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id)
        .gte("created_at", windowStart.toISOString());

      // Fara scanari in fereastra -- probabil plaqueta nu e inca folosita,
      // nu are sens sa calculam sau sa trimitem nimic.
      if (!totalScans || totalScans === 0) {
        results.push({ restaurantId: restaurant.id, sent: false, themesFound: 0, error: "fara scanari in perioada" });
        continue;
      }

      const { data: complaints, error: complaintsError } = await supabaseAdmin
        .from("complaints")
        .select("theme, created_at")
        .eq("restaurant_id", restaurant.id)
        .gte("created_at", windowStart.toISOString());

      if (complaintsError) throw complaintsError;

      const themes = computeThemeStats(complaints ?? [], 5);

      // Salvam instantaneul INDIFERENT daca au iesit teme sau nu (chiar si un
      // instantaneu gol e o informatie utila: "am verificat, nu era nimic clar"),
      // ca sa aiba dashboard-ul mereu o data de "ultima verificare".
      const { error: insertError } = await supabaseAdmin.from("theme_snapshots").insert({
        restaurant_id: restaurant.id,
        window_days: ANALYSIS_WINDOW_DAYS,
        themes,
      });
      if (insertError) throw insertError;

      if (!restaurant.alert_email) {
        results.push({ restaurantId: restaurant.id, sent: false, themesFound: themes.length, error: "fara alert_email" });
        continue;
      }

      // Fara teme clare -- nu trimitem email saptamanal gol, ca sa nu devina
      // zgomot pe care proprietarul invata sa-l ignore. Instantaneul tot s-a
      // salvat mai sus, deci dashboard-ul reflecta oricum starea curenta.
      if (themes.length === 0) {
        results.push({ restaurantId: restaurant.id, sent: false, themesFound: 0, error: "nicio tema clara -- fara email" });
        continue;
      }

      const themesWithOutcomes = await Promise.all(
        themes.map(async (t) => {
          const outcome = await getLatestResolutionOutcome(restaurant.id, t.theme);
          return { ...t, outcomeLabel: outcome ? resolutionOutcomeLabel(outcome) : null };
        })
      );

      const bodySections = [
        restaurantHeaderHtml(restaurant.name),
        mutedTextHtml(`Temele recurente din ultimele ${ANALYSIS_WINDOW_DAYS} de zile.`),
        paragraphHtml("Cele mai frecvente teme din reclamațiile primite:"),
        themeListHtml(themesWithOutcomes),
        ctaButtonHtml("Deschide panoul", "https://scanvogue.ro/gest-x4p7"),
      ];

      const html = wrapEmailHtml(bodySections.join("\n"));

      const fromDefault = "feedback@resend.dev";
      const fromEnv = process.env.RESEND_FROM_EMAIL || fromDefault;
      const fromAddressMatch = fromEnv.match(/<(.+)>/);
      const fromAddress = fromAddressMatch ? fromAddressMatch[1] : fromEnv;

      const { error: sendError } = await resend.emails.send({
        from: `${restaurant.name} <${fromAddress}>`,
        to: restaurant.alert_email,
        subject: `Teme recurente — ${restaurant.name}`,
        text: `Teme recurente din ultimele ${ANALYSIS_WINDOW_DAYS} zile: ${themes.map((t) => `${t.theme} (${t.count}x)`).join(", ")}. Deschide panoul: https://scanvogue.ro/gest-x4p7`,
        html,
      });

      if (sendError) throw sendError;
      results.push({ restaurantId: restaurant.id, sent: true, themesFound: themes.length });
    } catch (err) {
      console.error(`Analiza saptamanala esuata pentru ${restaurant.id}:`, err);
      results.push({ restaurantId: restaurant.id, sent: false, themesFound: 0, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
