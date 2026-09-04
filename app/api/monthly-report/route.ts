import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import { buildMonthlyReport } from "@/lib/monthly-report";
import {
  wrapEmailHtml,
  restaurantHeaderHtml,
  paragraphHtml,
  mutedTextHtml,
  statsRowHtml,
  themeListHtml,
  ctaButtonHtml,
} from "@/lib/email-html";

// Declansata lunar de un GitHub Action (vezi .github/workflows), NU de useri.
// Protejata printr-un secret trimis in header -- fara el, orice apel e refuzat,
// ca sa nu poata cineva sa declanseze trimiterea de emailuri in masa la liber.
export async function POST(req: Request) {
  const secret = req.headers.get("x-report-secret");
  if (!secret || secret !== process.env.MONTHLY_REPORT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: restaurants, error } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, alert_email")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { restaurantId: string; sent: boolean; error?: string }[] = [];

  for (const restaurant of restaurants ?? []) {
    if (!restaurant.alert_email) {
      results.push({ restaurantId: restaurant.id, sent: false, error: "fara alert_email" });
      continue;
    }

    try {
      const report = await buildMonthlyReport(restaurant.id, restaurant.name);

      // Fara scanari deloc in ultimele 30 de zile -- probabil plaquette-a nu
      // a fost inca folosita, nu are sens sa trimitem un raport gol.
      if (report.totalScans === 0) {
        results.push({ restaurantId: restaurant.id, sent: false, error: "fara scanari in perioada" });
        continue;
      }

      const trendLine =
        report.trendDeltaPct === null
          ? null
          : report.trendDeltaPct === 0
            ? "Același număr de reclamații ca luna trecută."
            : report.trendDeltaPct < 0
              ? `Cu ${Math.abs(report.trendDeltaPct)}% mai puține reclamații față de luna trecută.`
              : `Cu ${report.trendDeltaPct}% mai multe reclamații față de luna trecută.`;

      const bodySections = [
        restaurantHeaderHtml(restaurant.name),
        mutedTextHtml(`Raport pentru perioada ${report.periodLabel}.`),
        statsRowHtml([
          { label: "Scanări", value: String(report.totalScans) },
          { label: "Reclamații", value: String(report.totalComplaints) },
          { label: "Rată", value: `${report.complaintRatePct}%` },
        ]),
      ];

      if (trendLine) bodySections.push(mutedTextHtml(trendLine));

      if (report.themes.length > 0) {
        bodySections.push(
          paragraphHtml("Cele mai frecvente teme din reclamațiile primite:"),
          themeListHtml(report.themes)
        );
      } else {
        bodySections.push(mutedTextHtml("Nu au fost destule reclamații în această perioadă ca să identificăm teme clare — semn bun."));
      }

      bodySections.push(ctaButtonHtml("Deschide panoul", "https://scanvogue.ro/gest-x4p7"));

      const html = wrapEmailHtml(bodySections.join("\n"));

      // Extragem doar adresa (fara nume) din RESEND_FROM_EMAIL, la fel ca in
      // app/gest-x4p7/actions.ts -- punem numele restaurantului in loc de
      // "ScanVogue". Calculata separat, NU inline, ca sa evitam un fallback
      // gresit (auto-referential) daca variabila de mediu lipseste complet.
      const fromDefault = "feedback@resend.dev";
      const fromEnv = process.env.RESEND_FROM_EMAIL || fromDefault;
      const fromAddressMatch = fromEnv.match(/<(.+)>/);
      const fromAddress = fromAddressMatch ? fromAddressMatch[1] : fromEnv;

      const { error: sendError } = await resend.emails.send({
        from: `${restaurant.name} <${fromAddress}>`,
        to: restaurant.alert_email,
        subject: `Raport lunar — ${restaurant.name}`,
        text: `Raport pentru ${report.periodLabel}: ${report.totalScans} scanari, ${report.totalComplaints} reclamatii (${report.complaintRatePct}%). Deschide panoul: https://scanvogue.ro/gest-x4p7`,
        html,
      });

      if (sendError) throw sendError;
      results.push({ restaurantId: restaurant.id, sent: true });
    } catch (err) {
      console.error(`Raport lunar esuat pentru ${restaurant.id}:`, err);
      results.push({ restaurantId: restaurant.id, sent: false, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
