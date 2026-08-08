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
