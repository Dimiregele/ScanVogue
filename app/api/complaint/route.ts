import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import { analyzeComplaint } from "@/lib/complaint-ai";
import {
  wrapEmailHtml,
  restaurantHeaderHtml,
  paragraphHtml,
  mutedTextHtml,
  warningBoxHtml,
  quoteBoxHtml,
  aiReplyBoxHtml,
  ctaButtonHtml,
} from "@/lib/email-html";

export async function POST(req: Request) {
  try {
    const { restaurantId, message, contactName, contactEmail } = await req.json();

    if (!restaurantId || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
    }

    const { data: complaint, error: dbError } = await supabaseAdmin
      .from("complaints")
      .insert({
        restaurant_id: restaurantId,
        message: message.trim(),
        contact_name: contactName?.trim() || null,
        contact_email: contactEmail?.trim() || null,
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    // Analiza AI -- rezumat + sugestie de raspuns pentru proprietar. Nu se
    // trimite nimic automat catre client; doar populeaza campurile pe care
    // proprietarul le vede si le aproba/editeaza in panou. Daca esueaza
    // (cheie lipsa, eroare API), reclamatia tot s-a salvat normal mai sus.
    const analysis = await analyzeComplaint(message.trim());
    if (analysis) {
      await supabaseAdmin
        .from("complaints")
        .update({
          ai_summary: analysis.summary,
          ai_suggested_reply: analysis.suggestedReply,
          ai_sensitive: analysis.sensitive,
          theme: analysis.theme,
        })
        .eq("id", complaint.id);
    }

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
      const emailLines = [
        `Ai primit o reclamație nouă prin formularul de feedback.`,
        ``,
        `Mesaj client:`,
        message.trim(),
        ``,
        `Contact lăsat de client: ${contactName?.trim() || "(nume nespecificat)"}${contactEmail?.trim() ? `, ${contactEmail.trim()}` : " (fără email)"}`,
      ];

      if (analysis?.sensitive) {
        emailLines.push(
          ``,
          `⚠️ ATENȚIE — acest mesaj a fost marcat ca posibil sensibil (sănătate, amenințare legală, discriminare sau altceva ce depășește o scuză simplă). Citește cu atenție înainte să folosești sugestia de mai jos.`
        );
      }

      if (analysis?.suggestedReply) {
        emailLines.push(
          ``,
          `— — —`,
          `Răspuns sugerat de AI (verifică înainte să-l trimiți, poate fi editat):`,
          ``,
          analysis.suggestedReply
        );
      }

      emailLines.push(
        ``,
        `Pentru a trimite efectiv acest răspuns către client, a marca reclamația ca rezolvată, sau a vedea teme recurente din ultimele luni: /gest-x4p7`
      );

      const contactLine = `Contact lăsat de client: ${contactName?.trim() || "(nume nespecificat)"}${contactEmail?.trim() ? `, ${contactEmail.trim()}` : " (fără email)"}`;

      const htmlSections = [
        restaurantHeaderHtml(restaurant.name),
        mutedTextHtml("Ai primit o reclamație nouă prin formularul de feedback."),
      ];

      if (analysis?.sensitive) {
        htmlSections.push(
          warningBoxHtml(
            "ATENȚIE — acest mesaj a fost marcat ca posibil sensibil (sănătate, amenințare legală, discriminare sau altceva ce depășește o scuză simplă). Citește cu atenție înainte să folosești sugestia de mai jos."
          )
        );
      }

      htmlSections.push(quoteBoxHtml(message.trim()), mutedTextHtml(contactLine));

      if (analysis?.suggestedReply) {
        htmlSections.push(aiReplyBoxHtml(analysis.suggestedReply));
      }

      htmlSections.push(ctaButtonHtml("Deschide panoul", "https://scanvogue.ro/gest-x4p7"));

      const html = wrapEmailHtml(htmlSections.join("\n"));

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "feedback@resend.dev",
        to: restaurant.alert_email,
        subject: `Reclamație nouă — ${restaurant.name}${analysis ? `: ${analysis.summary}` : ""}`,
        text: emailLines.join("\n"),
        html,
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
