import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { restaurantId, message, contact } = await req.json();

    if (!restaurantId || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
    }

    // 1. Salvam reclamatia in baza de date -- asta ramane si daca emailul esueaza mai jos.
    //    Nota: UI-ul foloseste un singur camp liber "Nume / Telefon / Email", deci il
    //    salvam in contact_name. Daca vrei 3 campuri separate in formular, spune-mi si
    //    despartim UI-ul + logica de aici in mod corespunzator.
    const { data: complaint, error: dbError } = await supabaseAdmin
      .from("complaints")
      .insert({
        restaurant_id: restaurantId,
        message: message.trim(),
        contact_name: contact?.trim() || null,
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    // 2. Luam numele si emailul de alerta ale restaurantului
    const { data: restaurant, error: restError } = await supabaseAdmin
      .from("restaurants")
      .select("name, alert_email")
      .eq("id", restaurantId)
      .single();

    if (restError || !restaurant) {
      console.error("Reclamatia s-a salvat, dar nu am gasit restaurantul pt email:", restError);
      return NextResponse.json({ success: true, complaintId: complaint.id });
    }

    // 3. Trimitem emailul. Daca esueaza, NU intoarcem eroare catre client --
    //    reclamatia e deja salvata in baza de date, e mai important sa nu
    //    aratam un ecran de eroare cuiva care tocmai s-a plans.
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "feedback@resend.dev",
        to: restaurant.alert_email,
        subject: `Reclamație nouă — ${restaurant.name}`,
        text: [
          `Ai primit o reclamație nouă prin formularul de feedback.`,
          ``,
          `Mesaj:`,
          message.trim(),
          ``,
          `Contact lăsat de client: ${contact?.trim() || "(nu a lăsat date de contact)"}`,
        ].join("\n"),
      });
    } catch (emailError) {
      console.error("Reclamatia s-a salvat, dar emailul nu a putut fi trimis:", emailError);
    }

    return NextResponse.json({ success: true, complaintId: complaint.id });
  } catch (err) {
    console.error("Eroare /api/complaint:", err);
    return NextResponse.json({ error: "Eroare interna" }, { status: 500 });
  }
}
