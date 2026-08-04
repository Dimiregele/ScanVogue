import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

    const { error } = await supabaseAdmin.from("scans").update(updates).eq("id", scanId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Eroare /api/scan:", err);
    return NextResponse.json({ error: "Eroare interna" }, { status: 500 });
  }
}
