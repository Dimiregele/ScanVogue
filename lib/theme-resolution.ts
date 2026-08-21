import { supabaseAdmin } from "@/lib/supabase";

// Nu evaluam un remediu prea devreme (zgomot statistic) si nu comparam
// ferestre de lungimi diferite (nu e corect sa compari 60 de zile "inainte"
// cu doar 5 zile "dupa") -- folosim ferestre SIMETRICE, capate la maximum.
const MIN_DAYS_TO_EVALUATE = 7;
const MAX_COMPARISON_WINDOW_DAYS = 60;

// Prag sub care consideram schimbarea "zgomot", nu o imbunatatire/inrautatire reala.
const NOISE_THRESHOLD_PCT = 10;

export type ResolutionStatus = "too_early" | "insufficient_data" | "improved" | "worsened" | "unchanged";

export type ResolutionOutcome = {
  theme: string;
  resolvedAt: string;
  note: string | null;
  daysSinceResolved: number;
  status: ResolutionStatus;
  countBefore: number;
  countAfter: number;
  deltaPct: number | null; // null cand nu exista baza de comparatie (countBefore = 0)
};

export async function getLatestResolutionOutcome(
  restaurantId: string,
  theme: string
): Promise<ResolutionOutcome | null> {
  const { data: resolution, error } = await supabaseAdmin
    .from("theme_resolutions")
    .select("theme, resolved_at, note")
    .eq("restaurant_id", restaurantId)
    .eq("theme", theme)
    .order("resolved_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !resolution) return null;

  const resolvedAt = new Date(resolution.resolved_at);
  const now = new Date();
  const daysSinceResolved = Math.floor((now.getTime() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceResolved < MIN_DAYS_TO_EVALUATE) {
    return {
      theme,
      resolvedAt: resolution.resolved_at,
      note: resolution.note,
      daysSinceResolved,
      status: "too_early",
      countBefore: 0,
      countAfter: 0,
      deltaPct: null,
    };
  }

  const windowDays = Math.min(daysSinceResolved, MAX_COMPARISON_WINDOW_DAYS);

  const beforeStart = new Date(resolvedAt);
  beforeStart.setDate(beforeStart.getDate() - windowDays);

  const afterEndRaw = new Date(resolvedAt);
  afterEndRaw.setDate(afterEndRaw.getDate() + windowDays);
  const afterEnd = afterEndRaw.getTime() > now.getTime() ? now : afterEndRaw;

  const [{ count: countBeforeRaw }, { count: countAfterRaw }] = await Promise.all([
    supabaseAdmin
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("theme", theme)
      .gte("created_at", beforeStart.toISOString())
      .lt("created_at", resolvedAt.toISOString()),
    supabaseAdmin
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("theme", theme)
      .gte("created_at", resolvedAt.toISOString())
      .lt("created_at", afterEnd.toISOString()),
  ]);

  const countBefore = countBeforeRaw ?? 0;
  const countAfter = countAfterRaw ?? 0;

  // Fara cazuri "inainte" in fereastra, un procent ar fi inselator (ex: 0 -> 2
  // ar insemna matematic "infinit%") -- raportam doar cifrele brute in cazul asta.
  if (countBefore === 0) {
    return {
      theme,
      resolvedAt: resolution.resolved_at,
      note: resolution.note,
      daysSinceResolved,
      status: "insufficient_data",
      countBefore,
      countAfter,
      deltaPct: null,
    };
  }

  const deltaPct = Math.round(((countAfter - countBefore) / countBefore) * 100);
  let status: ResolutionStatus;
  if (deltaPct <= -NOISE_THRESHOLD_PCT) status = "improved";
  else if (deltaPct >= NOISE_THRESHOLD_PCT) status = "worsened";
  else status = "unchanged";

  return {
    theme,
    resolvedAt: resolution.resolved_at,
    note: resolution.note,
    daysSinceResolved,
    status,
    countBefore,
    countAfter,
    deltaPct,
  };
}

export function resolutionOutcomeLabel(outcome: ResolutionOutcome): string {
  const dateLabel = new Date(outcome.resolvedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long" });
  switch (outcome.status) {
    case "too_early":
      return `Marcat rezolvat pe ${dateLabel} — prea devreme ca să vedem efectul (verificăm din nou peste câteva zile).`;
    case "insufficient_data":
      return `Marcat rezolvat pe ${dateLabel} — prea puține cazuri anterioare ca să comparăm corect (${outcome.countBefore} înainte, ${outcome.countAfter} după).`;
    case "improved":
      return `Marcat rezolvat pe ${dateLabel} — funcționează: ${Math.abs(outcome.deltaPct ?? 0)}% mai puține cazuri de atunci (${outcome.countBefore} → ${outcome.countAfter}).`;
    case "worsened":
      return `Marcat rezolvat pe ${dateLabel} — nu pare să fi ajutat: ${outcome.deltaPct}% mai multe cazuri de atunci (${outcome.countBefore} → ${outcome.countAfter}).`;
    case "unchanged":
      return `Marcat rezolvat pe ${dateLabel} — fără schimbare clară (${outcome.countBefore} înainte, ${outcome.countAfter} după).`;
  }
}
