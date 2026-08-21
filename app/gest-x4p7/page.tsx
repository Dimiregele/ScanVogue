import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { signOutOwner } from "./actions";
import ComplaintCard from "./complaint-card";
import RecurringThemes from "./recurring-themes";
import GoogleUrlSetting from "./google-url-setting";
import ScanAnalytics from "./scan-analytics";
import ExportComplaintsButton from "./export-complaints-button";
import { ADMIN_COLORS, ADMIN_GLOBAL_CSS, AdminEmbers, AdminCornerFrame, adminSectionTitleStyle } from "../_shared/decor";
import AnimatedNumber from "../_shared/animated-number";

export const dynamic = "force-dynamic";

export default async function OwnerPanel() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/gest-x4p7/login");
  }

  // RLS ("owner reads own restaurant") verifica direct emailul contului
  // logat impotriva restaurants.alert_email -- nu exista pas separat de
  // asociere manuala. Daca emailul contului nu se potriveste cu niciun
  // alert_email, query-ul de mai jos nu intoarce niciun rand (nu eroare).
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug, alert_email, google_review_url")
    .maybeSingle();

  if (!restaurant) {
    return (
      <div style={pageStyle}>
        <style>{ADMIN_GLOBAL_CSS}</style>
        <div style={contentStyle}>
          <p style={{ color: ADMIN_COLORS.textMuted }}>
            Acest cont ({user.email}) nu este asociat niciunui restaurant.
            Accesul se dă contului cu adresa de email folosită pentru alertele
            de reclamații. Contactează-ne dacă ar trebui să ai acces.
          </p>
          <form action={signOutOwner}>
            <button style={linkButtonStyle}>Delogare</button>
          </form>
        </div>
      </div>
    );
  }

  const [{ count: totalScans }, { count: positiveScans }, { count: negativeScans }, { count: newComplaints }, { data: complaints }, { data: scans }, { data: themeSnapshotRow }] =
    await Promise.all([
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id),
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("choice", "positive"),
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("choice", "negative"),
      supabase.from("complaints").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("status", "new"),
      supabase
        .from("complaints")
        .select("id, message, contact_name, contact_phone, contact_email, status, created_at, ai_summary, ai_suggested_reply, ai_sensitive, reply_sent_at")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("scans")
        .select("created_at, choice")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: true })
        .limit(5000),
      supabase
        .from("theme_snapshots")
        .select("computed_at, window_days, themes")
        .eq("restaurant_id", restaurant.id)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  // Temele recurente nu se mai calculeaza la cerere (apel AI la fiecare click) --
  // citim doar ultimul instantaneu calculat automat, saptamanal, de job-ul
  // programat. Pentru fiecare tema din instantaneu, verificam si daca exista
  // un remediu marcat, ca sa aratam daca a functionat.
  // IMPORTANT: formatam textul AICI, pe server, si trimitem catre client doar
  // string-ul gata facut -- lib/theme-resolution.ts importa supabaseAdmin
  // (cheia secreta), deci nu trebuie NICIODATA importat direct intr-o
  // componenta "use client" (ar risca sa bage cheia in bundle-ul de browser).
  const { getLatestResolutionOutcome, resolutionOutcomeLabel } = await import("@/lib/theme-resolution");
  const snapshotThemes = (themeSnapshotRow?.themes as { theme: string; count: number; timePattern: string | null }[]) ?? [];
  const themeOutcomeLabels = await Promise.all(
    snapshotThemes.map(async (t) => {
      const outcome = await getLatestResolutionOutcome(restaurant.id, t.theme);
      return outcome ? resolutionOutcomeLabel(outcome) : null;
    })
  );

  // Rata de satisfactie ignora scanarile abandonate (fara alegere facuta),
  // ca sa nu dilueze artificial procentul cu oameni care n-au raspuns nimic.
  const decided = (positiveScans ?? 0) + (negativeScans ?? 0);
  const satisfactionRate = decided > 0 ? Math.round(((positiveScans ?? 0) / decided) * 100) : null;

  const resolvedComplaints = (complaints ?? []).filter((c) => c.status === "resolved").length;

  // Reclamatiile rezolvate nu mai apar in lista vizibila -- raman doar in
  // statistici (resolvedComplaints, deja calculat mai sus din lista completa)
  // si in exportul CSV, care primeste tot `complaints`, neatins de filtrul asta.
  const visibleComplaints = (complaints ?? []).filter((c) => c.status !== "resolved");

  // Trend saptamanal -- ultimele 7 zile vs cele 7 dinainte, calculat din
  // scanarile deja aduse mai sus, fara alt query.
  const scansList = scans ?? [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const last7 = scansList.filter((s) => now - new Date(s.created_at).getTime() < 7 * day).length;
  const prev7 = scansList.filter((s) => {
    const age = now - new Date(s.created_at).getTime();
    return age >= 7 * day && age < 14 * day;
  }).length;
  let trend: { pct: number; up: boolean } | null = null;
  if (prev7 > 0) trend = { pct: Math.round(Math.abs(((last7 - prev7) / prev7) * 100)), up: last7 >= prev7 };
  else if (last7 > 0) trend = { pct: 100, up: true };

  return (
    <div style={pageStyle}>
      <style>{ADMIN_GLOBAL_CSS}</style>
      <AdminEmbers />

      <div style={contentStyle}>
        <div className="admin-fade-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: ADMIN_COLORS.textPrimary,
              fontSize: 26,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "0.01em",
            }}
          >
            {restaurant?.name ?? "Panoul tău"}
          </h1>
          <form action={signOutOwner}>
            <button className="admin-btn admin-btn-ghost" style={linkButtonStyle}>Delogare</button>
          </form>
        </div>

        {satisfactionRate !== null && (
          <section
            className="admin-fade-2 admin-card"
            style={{ ...cardStyle, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative", overflow: "hidden" }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at 15% 30%, rgba(198,161,91,0.08), transparent 60%)`,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ color: ADMIN_COLORS.textMuted, fontSize: 12.5, marginBottom: 4 }}>Rată satisfacție</div>
              <div className="admin-shimmer-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700 }}>
                <AnimatedNumber value={satisfactionRate} suffix="%" />
              </div>
            </div>
            {trend && (
              <div style={{ textAlign: "right", position: "relative" }}>
                <div style={{ color: trend.up ? ADMIN_COLORS.emerald : ADMIN_COLORS.terracotta, fontSize: 15, fontWeight: 600 }}>
                  {trend.up ? "↑" : "↓"} {trend.pct}%
                </div>
                <div style={{ color: ADMIN_COLORS.textFaint, fontSize: 11.5 }}>scanări față de săptămâna trecută</div>
              </div>
            )}
          </section>
        )}

        <section className="admin-fade-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label="Scanări totale" value={totalScans ?? 0} color={ADMIN_COLORS.sapphire} />
          <StatCard label="Recenzii Google direcționate" value={positiveScans ?? 0} color={ADMIN_COLORS.emerald} />
          <StatCard label="Experiențe negative" value={negativeScans ?? 0} color={ADMIN_COLORS.terracotta} />
          <StatCard label="Reclamații necitite" value={newComplaints ?? 0} color={ADMIN_COLORS.gold} pulse={(newComplaints ?? 0) > 0} />
        </section>

        <div className="admin-fade-4">
          <ScanAnalytics scans={scans ?? []} />
        </div>

        <div style={{ height: 20 }} />

        <section className="admin-fade-4 admin-card" style={{ ...cardStyle, marginBottom: 20 }}>
          <h2 style={adminSectionTitleStyle}>Setări</h2>
          <p style={{ color: ADMIN_COLORS.textMuted, fontSize: 12.5, marginBottom: 8 }}>Link Google Reviews</p>
          <GoogleUrlSetting restaurantId={restaurant.id} initialUrl={restaurant.google_review_url} />
          <p style={{ color: ADMIN_COLORS.textMuted, fontSize: 12.5, marginTop: 16, marginBottom: 4 }}>Email de alertă reclamații</p>
          <p style={{ color: "#C9C2B4", fontSize: 13.5, margin: 0 }}>
            {restaurant.alert_email} <span style={{ color: ADMIN_COLORS.textFaint }}>— contactează-ne pentru schimbare</span>
          </p>
        </section>

        <RecurringThemes
          restaurantId={restaurant.id}
          computedAt={themeSnapshotRow?.computed_at ?? null}
          themes={snapshotThemes}
          outcomeLabels={themeOutcomeLabels}
        />

        <section className="admin-fade-5 admin-card" style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <h2 style={{ ...adminSectionTitleStyle, marginBottom: 0 }}>
              Reclamații ({visibleComplaints.length})
              {resolvedComplaints > 0 && (
                <span style={{ color: ADMIN_COLORS.textMuted, fontSize: 12.5, fontWeight: 400, fontFamily: "'Inter', sans-serif" }}> · {resolvedComplaints} rezolvate, ascunse din listă</span>
              )}
            </h2>
            <ExportComplaintsButton complaints={complaints ?? []} restaurantSlug={restaurant.slug} />
          </div>
          {visibleComplaints.length === 0 ? (
            <p style={{ color: ADMIN_COLORS.textMuted, fontSize: 14 }}>
              {resolvedComplaints > 0 ? "Toate reclamațiile sunt rezolvate — bravo." : "Nicio reclamație încă — semn bun."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleComplaints.map((c) => (
                <ComplaintCard key={c.id} complaint={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, pulse }: { label: string; value: number; color: string; pulse?: boolean }) {
  return (
    <div className="admin-card" style={{ ...cardStyle, padding: 18, borderLeft: `2px solid ${color}55` }}>
      <div style={{ color, fontSize: 26, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
        <AnimatedNumber value={value} />
        {pulse && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animation: "adminCornerGlow 1.6s ease-in-out infinite",
            }}
          />
        )}
      </div>
      <div style={{ color: ADMIN_COLORS.textMuted, fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  position: "relative",
  background: `radial-gradient(ellipse at 50% 0%, ${ADMIN_COLORS.bgRadial} 0%, ${ADMIN_COLORS.bg} 65%)`,
  fontFamily: "'Inter', system-ui, sans-serif",
  padding: "40px 20px",
};

const contentStyle: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const cardStyle: React.CSSProperties = {
  background: ADMIN_COLORS.card,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: `1px solid ${ADMIN_COLORS.cardBorder}`,
  borderRadius: 18,
  padding: 24,
};

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid rgba(255,255,255,0.1)",
  color: ADMIN_COLORS.textMuted,
  fontSize: 12.5,
  padding: "7px 14px",
  borderRadius: 999,
  cursor: "pointer",
};
