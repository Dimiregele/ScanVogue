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
    .select("name")
    .eq("id", complaint.restaurant_id)
    .single();

  const { resend } = await import("@/lib/resend");
  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "feedback@resend.dev",
    to: complaint.contact_email,
    subject: `Răspuns de la ${restaurant?.name ?? "restaurant"}`,
    text: [
      complaint.contact_name ? `Bună, ${complaint.contact_name},` : "Bună,",
      "",
      trimmed,
      "",
      `— ${restaurant?.name ?? "Echipa"}`,
    ].join("\n"),
  });

  if (emailError) throw new Error("Trimiterea a eșuat: " + emailError.message);

  const { error: updateError } = await supabase
    .from("complaints")
    .update({ reply_sent_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (updateError) throw updateError;
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
