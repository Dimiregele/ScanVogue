import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { restaurantId, message, contact } = await req.json();

    if (!restaurantId || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
    }

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

    const { data: restaurant, error: restError } = await supabaseAdmin
      .from("restaurants")
      .select("name, alert_email")
      .eq("id", restaurantId)
      .single();

    if (restError || !restaurant) {
      console.error("Reclamatia s-a salvat, dar nu am gasit restaurantul pt email:", restError);
      return NextResponse.json({ success: true, complaintId: complaint.id });
    }

    try {
      const keyPreview = process.env.RESEND_API_KEY
        ? `${process.env.RESEND_API_KEY.slice(0, 6)}...${process.env.RESEND_API_KEY.slice(-4)} (lungime: ${process.env.RESEND_API_KEY.length})`
        : "LIPSA / undefined";
      console.log("DIAGNOSTIC - RESEND_API_KEY vazut de functie:", keyPreview);

      console.log("Incerc sa trimit email catre:", restaurant.alert_email);
      const { data: emailData, error: emailError } = await resend.emails.send({
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

      if (emailError) {
        console.error("Resend a raspuns cu o eroare:", JSON.stringify(emailError));
      } else {
        console.log("Email trimis cu succes, id:", emailData?.id);
      }
    } catch (emailException) {
      console.error("Reclamatia s-a salvat, dar emailul a aruncat o exceptie:", emailException);
    }

    return NextResponse.json({ success: true, complaintId: complaint.id });
  } catch (err) {
    console.error("Eroare /api/complaint:", err);
    return NextResponse.json({ error: "Eroare interna" }, { status: 500 });
  }
}
