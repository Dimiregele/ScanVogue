import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { signOutOwner } from "./actions";
import ComplaintStatusButton from "./complaint-status-button";
import GoogleUrlSetting from "./google-url-setting";

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
        <p style={{ color: "#9C9382" }}>
          Acest cont ({user.email}) nu este asociat niciunui restaurant.
          Accesul se dă contului cu adresa de email folosită pentru alertele
          de reclamații. Contactează-ne dacă ar trebui să ai acces.
        </p>
        <form action={signOutOwner}>
          <button style={linkButtonStyle}>Delogare</button>
        </form>
      </div>
    );
  }

  const [{ count: totalScans }, { count: positiveScans }, { count: negativeScans }, { count: newComplaints }, { data: complaints }] =
    await Promise.all([
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id),
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("choice", "positive"),
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("choice", "negative"),
      supabase.from("complaints").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("status", "new"),
      supabase
        .from("complaints")
        .select("id, message, contact_name, contact_phone, contact_email, status, created_at")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ color: "#F5F0E6", fontSize: 20, fontWeight: 600, margin: 0 }}>
          {restaurant?.name ?? "Panoul tău"}
        </h1>
        <form action={signOutOwner}>
          <button style={linkButtonStyle}>Delogare</button>
        </form>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Scanări totale" value={totalScans ?? 0} />
        <StatCard label="Experiențe pozitive" value={positiveScans ?? 0} />
        <StatCard label="Experiențe negative" value={negativeScans ?? 0} />
        <StatCard label="Reclamații necitite" value={newComplaints ?? 0} accent />
      </section>

      <section style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={sectionTitleStyle}>Setări</h2>
        <p style={{ color: "#9C9382", fontSize: 12.5, marginBottom: 8 }}>Link Google Reviews</p>
        <GoogleUrlSetting restaurantId={restaurant.id} initialUrl={restaurant.google_review_url} />
        <p style={{ color: "#9C9382", fontSize: 12.5, marginTop: 16, marginBottom: 4 }}>Email de alertă reclamații</p>
        <p style={{ color: "#C9C2B4", fontSize: 13.5, margin: 0 }}>
          {restaurant.alert_email} <span style={{ color: "#6B6558" }}>— contactează-ne pentru schimbare</span>
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Reclamații ({complaints?.length ?? 0})</h2>
        {!complaints || complaints.length === 0 ? (
          <p style={{ color: "#9C9382", fontSize: 14 }}>Nicio reclamație încă — semn bun.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {complaints.map((c) => (
              <div key={c.id} style={complaintRowStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <p style={{ color: "#F5F0E6", fontSize: 14, lineHeight: 1.5, margin: 0, flex: 1 }}>{c.message}</p>
                  <ComplaintStatusButton complaintId={c.id} status={c.status} />
                </div>
                <div style={{ color: "#9C9382", fontSize: 12, marginTop: 8 }}>
                  {new Date(c.created_at).toLocaleString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {c.contact_name && <> · contact: {c.contact_name}</>}
                  {c.contact_phone && <> · {c.contact_phone}</>}
                  {c.contact_email && <> · {c.contact_email}</>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ ...cardStyle, padding: 18 }}>
      <div style={{ color: accent ? "#C6A15B" : "#F5F0E6", fontSize: 26, fontWeight: 600 }}>{value}</div>
      <div style={{ color: "#9C9382", fontSize: 12, marginTop: 4 }}>{label}</div>
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

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#9C9382",
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "underline",
};

const complaintRowStyle: React.CSSProperties = {
  padding: 14,
  background: "rgba(255,255,255,0.02)",
  borderRadius: 10,
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#F5F0E6",
  fontSize: 15,
  fontWeight: 600,
  marginTop: 0,
  marginBottom: 16,
};
