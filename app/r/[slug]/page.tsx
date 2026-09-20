import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { getClientIp, hashIp } from "@/lib/request-meta";
import ScanClient from "./scan-client";

// Pagina trebuie sa fie mereu proaspata -- niciodata nu cache-uim starea
// is_active sau datele restaurantului static la build time.
export const dynamic = "force-dynamic";

// Fereastra de dedup pentru scanari: o reincarcare repetata a paginii (om
// nervos care apasa refresh, sau un script) de la aceeasi sursa (IP + user
// agent), pentru acelasi restaurant, in acest interval, NU mai creeaza un
// rand nou -- reutilizam scanarea existenta. Suficient de scurt cat sa nu
// confunde doua vizite reale din aceeasi zi, suficient de lung cat sa
// absoarba un "for cu curl" sau reincarcari accidentale.
const DEDUP_WINDOW_MINUTES = 5;
// Lungimea maxima pe care o pastram din user-agent -- doar cat sa deosebeasca
// browsere/dispozitive diferite, nu un fingerprint detaliat.
const USER_AGENT_MAX_LENGTH = 300;

export default async function ScanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: restaurant, error } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, subtitle, logo_url, google_review_url, is_active")
    .eq("slug", slug)
    .single();

  // Slug inexistent -> 404 normal (nu exista asa un restaurant)
  if (error || !restaurant) {
    notFound();
  }

  // Abonament neplatit / cont dezactivat de super-admin -> mesaj neutru,
  // NU eroare tehnica. Clientul din restaurant nu trebuie sa vada niciodata
  // un ecran de "eroare" -- pare neprofesionist si ridica intrebari.
  if (!restaurant.is_active) {
    return (
      <>
        {/* fallback 100vh scris primul, pt telefoane fara suport "dvh" */}
        <style>{`.onyx-inactive-vp{min-height:100vh;min-height:100dvh;}`}</style>
        <div
          className="onyx-inactive-vp"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#0B0A08",
            color: "#9C9382",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <p style={{ maxWidth: 320, fontSize: 15, lineHeight: 1.6 }}>
            Acest formular de feedback nu este momentan disponibil.
          </p>
        </div>
      </>
    );
  }

  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);
  const ipHash = clientIp ? hashIp(clientIp) : null;
  const userAgent = requestHeaders.get("user-agent")?.slice(0, USER_AGENT_MAX_LENGTH) ?? null;

  let scanId: string | null = null;

  // Dedup: daca exista deja o scanare recenta de la aceeasi sursa (IP+UA),
  // pentru acelasi restaurant, o refolosim in loc sa inseram alta. Fara IP
  // (header lipsa) nu putem deduplica -- inseram normal, mai bine decat sa
  // blocam pagina.
  if (ipHash && userAgent) {
    const dedupWindowStart = new Date(Date.now() - DEDUP_WINDOW_MINUTES * 60_000).toISOString();
    const { data: recentScan } = await supabaseAdmin
      .from("scans")
      .select("id")
      .eq("restaurant_id", restaurant.id)
      .eq("ip_hash", ipHash)
      .eq("user_agent", userAgent)
      .gte("created_at", dedupWindowStart)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentScan) {
      scanId = recentScan.id;
    }
  }

  // Inregistram scanarea doar daca nu am gasit una recenta de reutilizat.
  // Salvam id-ul randului si-l pasam catre client -- cand utilizatorul
  // apasa un buton, facem UPDATE pe acelasi rand (nu insert nou), ca sa
  // avem exact 1 rand per scanare fizica, nu duplicate.
  if (!scanId) {
    const { data: scan, error: scanError } = await supabaseAdmin
      .from("scans")
      .insert({ restaurant_id: restaurant.id, choice: null, ip_hash: ipHash, user_agent: userAgent })
      .select("id")
      .single();

    if (scanError) {
      // Nu blocam experienta clientului daca logarea scanarii esueaza --
      // mai bine pierdem un rand de analytics decat sa aratam eroare.
      console.error("Nu am putut inregistra scanarea:", scanError);
    } else {
      scanId = scan?.id ?? null;
    }
  }

  return (
    <ScanClient
      restaurant={{
        name: restaurant.name,
        subtitle: restaurant.subtitle,
        logoUrl: restaurant.logo_url,
        googleReviewUrl: restaurant.google_review_url,
        id: restaurant.id,
      }}
      scanId={scanId}
    />
  );
}
