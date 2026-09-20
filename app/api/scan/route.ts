import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Scrierea e neautentificata (foloseste service_role, ocoleste RLS) pentru
// ca vine de la un vizitator anonim care a scanat o plachetă fizică -- nu
// are cont, deci nu poate exista un token de sesiune. UUID-urile sunt greu
// de ghicit, dar asta singur nu e o autorizare -- fereastra de mai jos e
// verificarea reala: doar scanari RECENTE si care nu au deja o alegere
// salvata pot fi actualizate.
const UPDATE_WINDOW_MINUTES = 30;

/**
 * PATCH /api/scan
 * Actualizeaza randul de scanare deja creat (la incarcarea paginii) cu
 * alegerea facuta (positive/negative) si/sau rating-ul optional de 1-5 stele.
 *
 * Nu facem INSERT aici -- randul exista deja din Server Component, ca sa
 * avem exact 1 rand per scanare fizica (nu duplicate intre "a scanat" si
 * "a ales").
 */
export async function PATCH(req: Request) {
  try {
    const { scanId, choice, rating } = await req.json();

    if (!scanId || typeof scanId !== "string") {
      return NextResponse.json({ error: "scanId lipsa sau invalid" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (choice !== undefined) {
      if (choice !== "positive" && choice !== "negative") {
        return NextResponse.json({ error: "choice invalid" }, { status: 400 });
      }
      updates.choice = choice;
    }

    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "rating invalid" }, { status: 400 });
      }
      updates.rating = rating;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nimic de actualizat" }, { status: 400 });
    }

    // Verificam randul INAINTE de update: trebuie sa existe, sa fie recent,
    // si campurile pe care incercam sa le scriem trebuie sa fie inca necompletate.
    // Fara asta, orice request cu un scanId (chiar vechi, chiar deja decis)
    // ar putea rescrie datele -- un write neautentificat care ocoleste RLS,
    // fara nicio limita in timp sau stare.
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("scans")
      .select("id, choice, rating, created_at")
      .eq("id", scanId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      return NextResponse.json({ error: "Scanare inexistenta" }, { status: 404 });
    }

    const ageMinutes = (Date.now() - new Date(existing.created_at).getTime()) / 60000;
    if (ageMinutes > UPDATE_WINDOW_MINUTES) {
      return NextResponse.json({ error: "Scanare expirata" }, { status: 409 });
    }

    if (updates.choice !== undefined && existing.choice !== null) {
      return NextResponse.json({ error: "Alegerea a fost deja salvata" }, { status: 409 });
    }
    if (updates.rating !== undefined && existing.rating !== null) {
      return NextResponse.json({ error: "Rating-ul a fost deja salvat" }, { status: 409 });
    }

    const { error } = await supabaseAdmin.from("scans").update(updates).eq("id", scanId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Eroare /api/scan:", err);
    return NextResponse.json({ error: "Eroare interna" }, { status: 500 });
  }
}
