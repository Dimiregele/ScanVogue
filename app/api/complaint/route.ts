import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import { analyzeComplaint } from "@/lib/complaint-ai";
import { getClientIp, hashIp } from "@/lib/request-meta";
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 2000;
// O reclamatie trebuie sa fie legata de o scanare reala si recenta a
// aceluiasi restaurant -- dovedeste ca cererea a urmat un flux normal
// (cineva a incarcat /r/[slug]), nu a fost trimisa direct catre API.
const SCAN_LINK_WINDOW_MINUTES = 30;
// Cate reclamatii acceptam de la aceeasi sursa (IP), pentru acelasi
// restaurant, intr-o fereastra scurta -- peste asta, respingem (429).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, scanId, message, contactName, contactEmail, contactPhone, company } = body ?? {};

    // Honeypot: camp invizibil pentru oameni, completat aproape mereu de
    // boti. Raspundem cu "succes" fals -- nu semnalam botului ca a fost prins,
    // ca sa nu-si ajusteze scriptul.
    if (typeof company === "string" && company.trim()) {
      return NextResponse.json({ success: true, complaintId: null });
    }

    if (!restaurantId || typeof restaurantId !== "string" || !UUID_RE.test(restaurantId)) {
      return NextResponse.json({ error: "Restaurant invalid" }, { status: 400 });
    }
    if (!scanId || typeof scanId !== "string" || !UUID_RE.test(scanId)) {
      return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
    }
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
    }
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Mesajul e prea lung (maxim ${MAX_MESSAGE_LENGTH} de caractere).` },
        { status: 400 }
      );
    }

    // Restaurantul trebuie sa fie activ -- verificat implicit prin cerinta de
    // mai jos (scanarea se creeaza doar pentru restaurante active in
    // app/r/[slug]/page.tsx), dar verificam si explicit, ca aparare suplimentara.
    const { data: restaurantActive } = await supabaseAdmin
      .from("restaurants")
      .select("is_active")
      .eq("id", restaurantId)
      .maybeSingle();
    if (!restaurantActive?.is_active) {
      return NextResponse.json({ error: "Restaurant indisponibil" }, { status: 400 });
    }

    // Scanarea trebuie sa existe, sa apartina acestui restaurant, si sa fie
    // recenta. Fara asta, oricine ar putea trimite reclamatii cu un
    // restaurantId ghicit/copiat, fara sa fi trecut vreodata prin pagina.
    const { data: linkedScan } = await supabaseAdmin
      .from("scans")
      .select("id, created_at")
      .eq("id", scanId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (!linkedScan) {
      return NextResponse.json({ error: "Sesiune invalida" }, { status: 400 });
    }
    const scanAgeMinutes = (Date.now() - new Date(linkedScan.created_at).getTime()) / 60000;
    if (scanAgeMinutes > SCAN_LINK_WINDOW_MINUTES) {
      return NextResponse.json({ error: "Sesiune expirata, reincarcă pagina." }, { status: 409 });
    }

    const clientIp = getClientIp(req.headers);
    const ipHash = clientIp ? hashIp(clientIp) : null;

    // Rate limit pe IP: cate reclamatii a trimis aceasta sursa recent, la
    // acest restaurant. Fara IP (header lipsa) nu putem limita -- lasam
    // cererea sa treaca, protectia de mai sus (scanId recent) tot se aplica.
    if (ipHash) {
      const rateLimitWindowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
      const { count: recentCount } = await supabaseAdmin
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("ip_hash", ipHash)
        .gte("created_at", rateLimitWindowStart);

      if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: "Prea multe mesaje. Încearcă din nou mai târziu." }, { status: 429 });
      }
    }

    const { data: complaint, error: dbError } = await supabaseAdmin
      .from("complaints")
      .insert({
        restaurant_id: restaurantId,
        message: trimmedMessage,
        contact_name: typeof contactName === "string" ? contactName.trim().slice(0, 120) || null : null,
        contact_email: typeof contactEmail === "string" ? contactEmail.trim().slice(0, 200) || null : null,
        contact_phone: typeof contactPhone === "string" ? contactPhone.trim().slice(0, 40) || null : null,
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    // Analiza AI -- rezumat + sugestie de raspuns pentru proprietar. Nu se
    // trimite nimic automat catre client; doar populeaza campurile pe care
    // proprietarul le vede si le aproba/editeaza in panou. Daca esueaza
    // (cheie lipsa, eroare API), reclamatia tot s-a salvat normal mai sus.
    const analysis = await analyzeComplaint(trimmedMessage);
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
        trimmedMessage,
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

      htmlSections.push(quoteBoxHtml(trimmedMessage), mutedTextHtml(contactLine));

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
