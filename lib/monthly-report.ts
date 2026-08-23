import { supabaseAdmin } from "@/lib/supabase";
import { computeThemeStats, type ThemeStat } from "@/lib/theme-analysis";

export type { ThemeStat };

export type MonthlyReport = {
  restaurantId: string;
  restaurantName: string;
  periodLabel: string;
  totalScans: number;
  totalComplaints: number;
  complaintRatePct: number;
  prevTotalComplaints: number;
  trendDeltaPct: number | null; // null daca nu exista date in perioada anterioara (comparatie imposibila)
  themes: ThemeStat[];
};

export async function buildMonthlyReport(
  restaurantId: string,
  restaurantName: string
): Promise<MonthlyReport> {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 30);
  const prevPeriodStart = new Date(periodStart);
  prevPeriodStart.setDate(prevPeriodStart.getDate() - 30);

  const [{ count: totalScans }, { data: complaints }, { count: prevTotalComplaints }] = await Promise.all([
    supabaseAdmin
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("created_at", periodStart.toISOString()),
    supabaseAdmin
      .from("complaints")
      .select("theme, created_at")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", periodStart.toISOString()),
    supabaseAdmin
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("created_at", prevPeriodStart.toISOString())
      .lt("created_at", periodStart.toISOString()),
  ]);

  const totalComplaints = complaints?.length ?? 0;

  const themes = computeThemeStats(complaints ?? [], 5);

  const complaintRatePct = totalScans && totalScans > 0 ? Math.round((totalComplaints / totalScans) * 1000) / 10 : 0;

  let trendDeltaPct: number | null = null;
  if (prevTotalComplaints && prevTotalComplaints > 0) {
    trendDeltaPct = Math.round(((totalComplaints - prevTotalComplaints) / prevTotalComplaints) * 100);
  }

  const periodLabel = `${periodStart.toLocaleDateString("ro-RO", { day: "numeric", month: "long" })} – ${now.toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}`;

  return {
    restaurantId,
    restaurantName,
    periodLabel,
    totalScans: totalScans ?? 0,
    totalComplaints,
    complaintRatePct,
    prevTotalComplaints: prevTotalComplaints ?? 0,
    trendDeltaPct,
    themes,
  };
}
