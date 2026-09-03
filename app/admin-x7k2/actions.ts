"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // scoate diacriticele
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Creeaza automat contul Supabase Auth pentru adresa de alerta a
// restaurantului, fara parola -- accesul in /gest-x4p7 se face doar prin
// cod trimis pe email. Daca exista deja un cont cu acest email (acelasi
// proprietar la mai multe locatii, sau reincercare), nu tratam ca eroare.
async function ensureOwnerAccount(email: string) {
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (error && !/already been registered|already exists/i.test(error.message)) {
    console.error("Nu am putut crea contul proprietarului:", error);
  }
}

export async function createRestaurant(formData: FormData) {
  const supabase = await getServerClient();

  const name = (formData.get("name") as string)?.trim();
  const googleReviewUrl = (formData.get("googleReviewUrl") as string)?.trim();
  const alertEmail = (formData.get("alertEmail") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || null;

  if (!name || !googleReviewUrl || !alertEmail) {
    throw new Error("Nume, link Google Reviews si email de alerta sunt obligatorii.");
  }

  const baseSlug = slugify(name);
  // daca slug-ul exista deja, adaugam un sufix scurt ca sa evitam conflictul
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("restaurants").insert({
    name,
    subtitle,
    slug: baseSlug, // incercam intai slug-ul curat
    google_review_url: googleReviewUrl,
    alert_email: alertEmail,
  });

  if (error) {
    if (error.code === "23505") {
      // slug deja folosit -> reincercam cu sufix
      const { error: retryError } = await supabase.from("restaurants").insert({
        name,
        subtitle,
        slug,
        google_review_url: googleReviewUrl,
        alert_email: alertEmail,
      });
      if (retryError) throw retryError;
    } else {
      throw error;
    }
  }

  await ensureOwnerAccount(alertEmail);

  redirect("/admin-x7k2");
}

export async function toggleRestaurantActive(restaurantId: string, newValue: boolean) {
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ is_active: newValue })
    .eq("id", restaurantId);

  if (error) throw error;
  revalidatePath("/admin-x7k2");
}

// Sterge definitiv toate scanarile unui restaurant (util pentru curatarea
// datelor de test inainte de lansarea reala cu un client). RLS ("admin
// full access scans") permite asta doar contului de super-admin -- nu e
// nevoie de client cu service_role. Reclamatiile NU sunt atinse aici,
// doar scanarile.
export async function clearRestaurantScans(restaurantId: string) {
  const supabase = await getServerClient();
  const { error } = await supabase.from("scans").delete().eq("restaurant_id", restaurantId);

  if (error) throw error;
  revalidatePath("/admin-x7k2");
}

// Reseteaza COMPLET un restaurant la starea "cont nou" -- sterge atat
// scanarile cat si reclamatiile. Folosit inainte sa predai un cont unui
// client real, ca sa nu vada date de test/demo. Ireversibil.
export async function clearRestaurantEverything(restaurantId: string) {
  const supabase = await getServerClient();

  const { error: scansError } = await supabase.from("scans").delete().eq("restaurant_id", restaurantId);
  if (scansError) throw scansError;

  const { error: complaintsError } = await supabase.from("complaints").delete().eq("restaurant_id", restaurantId);
  if (complaintsError) throw complaintsError;

  revalidatePath("/admin-x7k2");
}

// Sterge DEFINITIV restaurantul insusi -- nu doar datele lui. Toate tabelele
// legate (scans, complaints, theme_snapshots, theme_resolutions,
// restaurant_users) au ON DELETE CASCADE pe restaurant_id, deci un singur
// delete pe restaurants sterge automat tot ce tine de el. Nu sterge insa
// contul de Supabase Auth al proprietarului (alert_email) -- acela poate
// fi shared cu alt restaurant al aceluiasi proprietar, deci il lasam intact.
export async function deleteRestaurant(restaurantId: string) {
  const supabase = await getServerClient();
  const { error } = await supabase.from("restaurants").delete().eq("id", restaurantId);

  if (error) throw error;
  revalidatePath("/admin-x7k2");
}

export async function signOut() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/admin-x7k2/login");
}
