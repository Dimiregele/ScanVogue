"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase-server";

export async function signOutOwner() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/gest-x4p7/login");
}

// RLS ("owner updates own complaints status") verifica automat ca
// reclamatia apartine restaurantului legat de emailul contului logat --
// nu trecem noi restaurantId explicit, ca sa nu fie nevoie sa avem
// incredere in ce trimite clientul din formular.
export async function updateComplaintStatus(complaintId: string, status: "new" | "read" | "resolved") {
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("complaints")
    .update({ status })
    .eq("id", complaintId);

  if (error) throw error;
  revalidatePath("/gest-x4p7");
}

// Trimite raspunsul (scris de AI si aprobat/editat de proprietar) catre
// clientul care a lasat reclamatia. NU se trimite nimic automat -- e
// apelata doar cand proprietarul apasa explicit butonul de trimitere.
export async function sendComplaintReply(complaintId: string, replyText: string) {
  const trimmed = replyText.trim();
  if (!trimmed) throw new Error("Raspunsul nu poate fi gol.");

  const supabase = await getServerClient();

  // RLS limiteaza automat la reclamatiile restaurantului contului logat.
  const { data: complaint, error: fetchError } = await supabase
    .from("complaints")
    .select("id, contact_email, contact_name, restaurant_id")
    .eq("id", complaintId)
    .single();

  if (fetchError || !complaint) throw new Error("Reclamația nu a fost găsită.");
  if (!complaint.contact_email) {
    throw new Error("Acest client nu a lăsat un email — nu poți trimite automat, doar ai putea să-l suni dacă a lăsat telefon.");
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, alert_email")
    .eq("id", complaint.restaurant_id)
    .single();

  const { resend } = await import("@/lib/resend");
  const { wrapEmailHtml, paragraphHtml, signatureHtml } = await import("@/lib/email-html");

  // Nume cu litera mare la inceput -- daca proprietarul/clientul l-a scris
  // cu litere mici (ex. la testare), tot arata ingrijit in email.
  const displayName = complaint.contact_name
    ? complaint.contact_name.trim().replace(/^\p{L}/u, (c: string) => c.toLocaleUpperCase("ro-RO"))
    : null;

  const restaurantName = restaurant?.name ?? "restaurant";

  // Extragem doar adresa (fara nume) din RESEND_FROM_EMAIL, ca sa punem
  // numele restaurantului in loc de "ScanVogue" -- clientul vede numele
  // restaurantului in inbox, nu al platformei. Adresa tehnica ramane
  // aceeasi (singura verificata la Resend), doar eticheta se schimba.
  const fromAddressMatch = (process.env.RESEND_FROM_EMAIL || "feedback@resend.dev").match(/<(.+)>/);
  const fromAddress = fromAddressMatch ? fromAddressMatch[1] : (process.env.RESEND_FROM_EMAIL || "feedback@resend.dev");

  const html = wrapEmailHtml(
    [
      paragraphHtml(displayName ? `Bună ${displayName},` : "Bună,"),
      paragraphHtml(trimmed),
      signatureHtml(restaurantName),
    ].join("\n")
  );

  const { error: emailError } = await resend.emails.send({
    from: `${restaurantName} <${fromAddress}>`,
    to: complaint.contact_email,
    replyTo: restaurant?.alert_email || undefined,
    subject: `Am citit mesajul tău — ${restaurantName}`,
    text: [
      displayName ? `Bună ${displayName},` : "Bună,",
      "",
      trimmed,
      "",
      `— ${restaurantName}`,
    ].join("\n"),
    html,
  });

  if (emailError) throw new Error("Trimiterea a eșuat: " + emailError.message);

  const { error: updateError } = await supabase
    .from("complaints")
    .update({ reply_sent_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (updateError) throw updateError;
  revalidatePath("/gest-x4p7");
}

// Temele recurente nu se mai calculeaza la cerere (risc de suprasolicitare a
// AI-ului daca cineva apasa butonul repetat) -- se calculeaza automat,
// saptamanal, de un job programat (vezi app/api/weekly-themes/route.ts) si
// se citesc direct din tabela theme_snapshots in app/gest-x4p7/page.tsx.

// Proprietarul marcheaza o tema ca "rezolvata", cu o nota optionala despre
// ce a facut. RLS (has_restaurant_access) verifica automat ca restaurantId
// chiar apartine contului logat -- nu ne bazam doar pe ce trimite clientul.
export async function markThemeResolved(restaurantId: string, theme: string, note: string) {
  const trimmedTheme = theme.trim();
  if (!trimmedTheme) throw new Error("Tema lipsește.");

  const supabase = await getServerClient();
  const { error } = await supabase.from("theme_resolutions").insert({
    restaurant_id: restaurantId,
    theme: trimmedTheme,
    note: note.trim() || null,
  });

  if (error) throw error;
  revalidatePath("/gest-x4p7");
}

// Doar linkul Google Reviews e editabil de proprietar. Adresa de alerta
// (alert_email) nu e expusa aici -- RLS ar respinge oricum orice
// incercare de schimbare a ei (owner-ul si-ar pierde accesul din proprie
// initiativa), asa ca ramane modificabila doar din super-admin.
export async function updateGoogleReviewUrl(restaurantId: string, googleReviewUrl: string) {
  const trimmed = googleReviewUrl.trim();
  if (!trimmed) throw new Error("Linkul nu poate fi gol.");

  const supabase = await getServerClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ google_review_url: trimmed })
    .eq("id", restaurantId);

  if (error) throw error;
  revalidatePath("/gest-x4p7");
}
