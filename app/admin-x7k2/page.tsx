import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerClient } from "@/lib/supabase-server";
import { createRestaurant, signOut } from "./actions";
import ToggleActiveButton from "./toggle-active-button";
import ClearScansButton from "./clear-scans-button";
import { ADMIN_COLORS, ADMIN_GLOBAL_CSS, AdminEmbers, adminSectionTitleStyle } from "../_shared/decor";
import AnimatedNumber from "../_shared/animated-number";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-x7k2/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    return (
      <div style={pageStyle}>
        <style>{ADMIN_GLOBAL_CSS}</style>
        <p style={{ color: ADMIN_COLORS.textMuted, position: "relative", zIndex: 1 }}>
          Acest cont ({user.email}) nu are drepturi de super-admin.
        </p>
        <form action={signOut} style={{ position: "relative", zIndex: 1 }}>
          <button style={linkButtonStyle}>Delogare</button>
        </form>
      </div>
    );
  }

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, is_active, alert_email, created_at")
    .order("created_at", { ascending: false });

  const scanCounts = new Map<string, number>();
  if (restaurants && restaurants.length > 0) {
    await Promise.all(
      restaurants.map(async (r) => {
        const { count } = await supabase
          .from("scans")
          .select("*", { count: "exact", head: true })
          .eq("restaurant_id", r.id);
        scanCounts.set(r.id, count ?? 0);
      })
    );
  }

  const host = (await headers()).get("host");
  const ownerLoginUrl = `https://${host}/gest-x4p7/login`;
  const activeCount = (restaurants ?? []).filter((r) => r.is_active).length;

  return (
    <div style={pageStyle}>
      <style>{ADMIN_GLOBAL_CSS}</style>
      <AdminEmbers />

      <div style={contentStyle}>
        <div className="admin-fade-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
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
              Panou Super-Admin
            </h1>
            <p style={{ color: ADMIN_COLORS.textFaint, fontSize: 12.5, margin: "4px 0 0" }}>
              <AnimatedNumber value={restaurants?.length ?? 0} /> restaurant{(restaurants?.length ?? 0) === 1 ? "" : "e"} · <AnimatedNumber value={activeCount} /> active
            </p>
          </div>
          <form action={signOut}>
            <button className="admin-btn admin-btn-ghost" style={linkButtonStyle}>Delogare</button>
          </form>
        </div>

        <section className="admin-fade-2 admin-card" style={{ ...cardStyle, marginBottom: 20 }}>
          <h2 style={adminSectionTitleStyle}>Link panou proprietari</h2>
          <p style={{ color: ADMIN_COLORS.textMuted, fontSize: 13, lineHeight: 1.6, margin: "0 0 12px" }}>
            Același link pentru toate restaurantele — trimite-l fiecărei firme noi.
            Se loghează cu adresa de email pusă mai jos la &quot;Email pentru alerte
            reclamații&quot;, fără parolă (primesc un cod pe email).
          </p>
          <code style={ownerLinkStyle}>{ownerLoginUrl}</code>
        </section>

        <section className="admin-fade-3 admin-card" style={cardStyle}>
          <h2 style={adminSectionTitleStyle}>Adaugă restaurant nou</h2>
          <form action={createRestaurant} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input name="name" placeholder="Nume restaurant *" required className="admin-input" style={inputStyle} />
            <input name="subtitle" placeholder="Subtitlu (ex: Restaurant & Lounge)" className="admin-input" style={inputStyle} />
            <input name="googleReviewUrl" placeholder="Link Google Reviews *" required className="admin-input" style={inputStyle} />
            <input name="alertEmail" type="email" placeholder="Email pentru alerte reclamații *" required className="admin-input" style={inputStyle} />
            <button type="submit" className="admin-btn admin-btn-primary" style={primaryButtonStyle}>Adaugă restaurant</button>
          </form>
          <p style={{ color: ADMIN_COLORS.textFaint, fontSize: 12, marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>
            La salvare, contul de proprietar pentru acest email se creează automat —
            nu mai e nevoie de niciun pas separat.
          </p>
        </section>

        <section className="admin-fade-4 admin-card" style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={adminSectionTitleStyle}>Restaurante ({restaurants?.length ?? 0})</h2>
          {!restaurants || restaurants.length === 0 ? (
            <p style={{ color: ADMIN_COLORS.textMuted, fontSize: 14 }}>Niciun restaurant încă.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {restaurants.map((r, i) => (
                <div key={r.id} className="admin-row" style={{ ...restaurantRowStyle, animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      className="admin-status-dot"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: r.is_active ? ADMIN_COLORS.emerald : ADMIN_COLORS.textFaint,
                        boxShadow: r.is_active ? `0 0 8px ${ADMIN_COLORS.emerald}` : "none",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ color: ADMIN_COLORS.textPrimary, fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                      <div style={{ color: ADMIN_COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                        /r/{r.slug} · {r.alert_email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <ToggleActiveButton
                      restaurantId={r.id}
                      name={r.name}
                      isActive={r.is_active}
                    />
                    <ClearScansButton
                      restaurantId={r.id}
                      name={r.name}
                      scanCount={scanCounts.get(r.id) ?? 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
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

const inputStyle: React.CSSProperties = {
  padding: 11,
  borderRadius: 10,
  border: `1px solid ${ADMIN_COLORS.inputBorder}`,
  background: ADMIN_COLORS.inputBg,
  color: ADMIN_COLORS.textPrimary,
  fontSize: 14,
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: `linear-gradient(135deg, ${ADMIN_COLORS.goldLight}, ${ADMIN_COLORS.gold} 60%, ${ADMIN_COLORS.goldDeep})`,
  color: "#100F0D",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
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

const restaurantRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.02)",
  borderRadius: 12,
  border: "1px solid transparent",
};

const ownerLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "11px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: ADMIN_COLORS.gold,
  fontSize: 12.5,
  wordBreak: "break-all",
};
