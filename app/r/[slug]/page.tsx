import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ScanClient from "./scan-client";

// Pagina trebuie sa fie mereu proaspata -- niciodata nu cache-uim starea
// is_active sau datele restaurantului static la build time.
export const dynamic = "force-dynamic";

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

  // Inregistram scanarea imediat, cu choice = null (inseamna "a scanat, nu a
  // ales inca"). Salvam id-ul randului si-l pasam catre client -- cand
  // utilizatorul apasa un buton, facem UPDATE pe acelasi rand (nu insert nou),
  // ca sa avem exact 1 rand per scanare fizica, nu duplicate.
  const { data: scan, error: scanError } = await supabaseAdmin
    .from("scans")
    .insert({ restaurant_id: restaurant.id, choice: null })
    .select("id")
    .single();

  if (scanError) {
    // Nu blocam experienta clientului daca logarea scanarii esueaza --
    // mai bine pierdem un rand de analytics decat sa aratam eroare.
    console.error("Nu am putut inregistra scanarea:", scanError);
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
      scanId={scan?.id ?? null}
    />
  );
}
