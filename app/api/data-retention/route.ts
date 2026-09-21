import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAuthorizedCronRequest } from "@/lib/request-meta";

// Politica de confidențialitate (app/confidentialitate/page.tsx) promite:
// "după acest interval, datele sunt șterse sau anonimizate automat" pentru
// o retenție de 24 de luni. Pana la acest job, nimic nu punea asta in
// practica -- niciunul dintre cele trei cron job-uri existente nu stergea
// date vechi.
//
// Stergem "scans" si "complaints" mai vechi de RETENTION_MONTHS. Nu atingem
// theme_snapshots/theme_resolutions -- sunt date agregate (teme + numar de
// aparitii), nu continut individual al unui client, deci nu intra sub
// aceeasi promisiune de retentie si raman utile pentru rapoarte istorice.
const RETENTION_MONTHS = 24;

export async function POST(req: Request) {
  if (!isAuthorizedCronRequest(req, process.env.DATA_RETENTION_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
  const cutoffIso = cutoff.toISOString();

  const { error: scansError, count: scansDeleted } = await supabaseAdmin
    .from("scans")
    .delete({ count: "exact" })
    .lt("created_at", cutoffIso);

  if (scansError) {
    console.error("Curatarea scanarilor vechi a esuat:", scansError);
    return NextResponse.json({ error: scansError.message }, { status: 500 });
  }

  const { error: complaintsError, count: complaintsDeleted } = await supabaseAdmin
    .from("complaints")
    .delete({ count: "exact" })
    .lt("created_at", cutoffIso);

  if (complaintsError) {
    console.error("Curatarea reclamatiilor vechi a esuat:", complaintsError);
    return NextResponse.json({ error: complaintsError.message }, { status: 500 });
  }

  return NextResponse.json({
    cutoff: cutoffIso,
    scansDeleted: scansDeleted ?? 0,
    complaintsDeleted: complaintsDeleted ?? 0,
  });
}
