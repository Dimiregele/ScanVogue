import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerClient } from "@/lib/supabase-server";
import { createRestaurant, signOut } from "./actions";
import ToggleActiveButton from "./toggle-active-button";

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
        <p style={{ color: "#9C9382" }}>
          Acest cont ({user.email}) nu are drepturi de super-admin.
        </p>
        <form action={signOut}>
          <button style={linkButtonStyle}>Delogare</button>
        </form>
      </div>
    );
  }

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, is_active, alert_email, created_at")
    .order("created_at", { ascending: false });

  const host = (await headers()).get("host");
  const ownerLoginUrl = `https://${host}/gest-x4p7/login`;

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ color: "#F5F0E6", fontSize: 20, fontWeight: 600, margin: 0 }}>
          Panou Super-Admin
        </h1>
        <form action={signOut}>
          <button style={linkButtonStyle}>Delogare</button>
        </form>
      </div>

      <section style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={sectionTitleStyle}>Link panou proprietari</h2>
        <p style={{ color: "#9C9382", fontSize: 13, lineHeight: 1.6, margin: "0 0 10px" }}>
          Același link pentru toate restaurantele — trimite-l fiecărei firme noi.
          Se loghează cu adresa de email pusă mai jos la &quot;Email pentru alerte
          reclamații&quot;, fără parolă (primesc un cod pe email).
        </p>
        <code style={ownerLinkStyle}>{ownerLoginUrl}</code>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Adaugă restaurant nou</h2>
        <form action={createRestaurant} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input name="name" placeholder="Nume restaurant *" required style={inputStyle} />
          <input name="subtitle" placeholder="Subtitlu (ex: Restaurant & Lounge)" style={inputStyle} />
          <input name="googleReviewUrl" placeholder="Link Google Reviews *" required style={inputStyle} />
          <input name="alertEmail" type="email" placeholder="Email pentru alerte reclamații *" required style={inputStyle} />
          <button type="submit" style={primaryButtonStyle}>Adaugă restaurant</button>
        </form>
        <p style={{ color: "#9C9382", fontSize: 12, marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>
          La salvare, contul de proprietar pentru acest email se creează automat —
          nu mai e nevoie de niciun pas separat.
        </p>
      </section>

      <section style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={sectionTitleStyle}>Restaurante ({restaurants?.length ?? 0})</h2>
        {!restaurants || restaurants.length === 0 ? (
          <p style={{ color: "#9C9382", fontSize: 14 }}>Niciun restaurant încă.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {restaurants.map((r) => (
              <div key={r.id} style={restaurantRowStyle}>
                <div>
                  <div style={{ color: "#F5F0E6", fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                  <div style={{ color: "#9C9382", fontSize: 12, marginTop: 2 }}>
                    /r/{r.slug} · {r.alert_email}
                  </div>
                </div>
                <ToggleActiveButton
                  restaurantId={r.id}
                  name={r.name}
                  isActive={r.is_active}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: "#0B0A08",
  fontFamily: "system-ui, sans-serif",
  padding: "40px 20px",
  maxWidth: 640,
  margin: "0 auto",
};

const cardStyle: React.CSSProperties = {
  background: "#151310",
  border: "1px solid rgba(198,161,91,0.16)",
  borderRadius: 16,
  padding: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#F5F0E6",
  fontSize: 15,
  fontWeight: 600,
  marginTop: 0,
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  padding: 11,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: "#F5F0E6",
  fontSize: 14,
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "#C6A15B",
  color: "#100F0D",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#9C9382",
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "underline",
};

const restaurantRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 12px",
  background: "rgba(255,255,255,0.02)",
  borderRadius: 10,
};

const ownerLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#C6A15B",
  fontSize: 12.5,
  wordBreak: "break-all",
};
