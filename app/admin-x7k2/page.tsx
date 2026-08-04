import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { createRestaurant, toggleRestaurantActive, signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-x7k2/login");
  }

  // is_admin() e functia SECURITY DEFINER din schema -- verifica daca
  // user-ul curent e in tabela admins, indiferent de RLS pe admins.
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

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Adaugă restaurant nou</h2>
        <form action={createRestaurant} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input name="name" placeholder="Nume restaurant *" required style={inputStyle} />
          <input name="subtitle" placeholder="Subtitlu (ex: Restaurant & Lounge)" style={inputStyle} />
          <input name="googleReviewUrl" placeholder="Link Google Reviews *" required style={inputStyle} />
          <input name="alertEmail" type="email" placeholder="Email pentru alerte reclamații *" required style={inputStyle} />
          <button type="submit" style={primaryButtonStyle}>Adaugă restaurant</button>
        </form>
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
                <form action={toggleRestaurantActive.bind(null, r.id, !r.is_active)}>
                  <button
                    type="submit"
                    style={{
                      ...statusPillStyle,
                      color: r.is_active ? "#8FD3A0" : "#E0A88C",
                      borderColor: r.is_active ? "rgba(143,211,160,0.35)" : "rgba(224,168,140,0.35)",
                    }}
                  >
                    {r.is_active ? "Activ" : "Inactiv"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
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

const statusPillStyle: React.CSSProperties = {
  fontSize: 11,
  padding: "5px 10px",
  borderRadius: 999,
  border: "1px solid",
  background: "transparent",
  cursor: "pointer",
};
