import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { signOutOwner } from "./actions";

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

  const [{ count: totalScans }, { count: positiveScans }, { count: negativeScans }, { count: newComplaints }] =
    await Promise.all([
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id),
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("choice", "positive"),
      supabase.from("scans").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("choice", "negative"),
      supabase.from("complaints").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id).eq("status", "new"),
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

      <section style={cardStyle}>
        <p style={{ color: "#9C9382", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          Aici urmează inbox-ul complet de reclamații, distribuția pe ore și
          setările (email de alertă, link Google Reviews) — momentan vezi
          doar statisticile de bază. Restul vine în pasul următor.
        </p>
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
