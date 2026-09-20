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
// proprietar la mai multe locatii, sau reincercare), nu tratam ca eroare --
// gasim contul existent si intoarcem id-ul lui in loc.
//
// Intoarce user_id-ul (nou sau existent) -- necesar ca sa legam explicit
// proprietarul de restaurant in restaurant_users (vezi createRestaurant mai
// jos). Fara acest id nu putem popula tabelul, si accesul proprietarului
// ar ramane nefunctional (has_restaurant_access nu mai verifica alert_email,
// vezi migratia harden_restaurant_owner_access).
async function ensureOwnerAccount(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (!error && data.user) return data.user.id;

  if (error && /already been registered|already exists/i.test(error.message)) {
    return await findUserIdByEmail(email);
  }

  console.error("Nu am putut crea contul proprietarului:", error);
  return null;
}

// Cauta un user Supabase Auth existent dupa email (case-insensitive).
// Admin API-ul nu ofera un filtru direct dupa email la listUsers(), deci
// paginam -- suficient de rar apelat (doar la crearea unui restaurant
// pentru un proprietar care are deja alt local) ca sa nu conteze costul.
async function findUserIdByEmail(email: string): Promise<string | null> {
  const perPage = 1000;
  const normalized = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match.id;
    if (data.users.length < perPage) return null; // am ajuns la ultima pagina
  }
  return null;
}

// Leaga explicit un proprietar de un restaurant in restaurant_users --
// sursa de adevar pentru acces, de cand am renuntat la potrivirea pe
// alert_email (vezi migratia harden_restaurant_owner_access). Foloseste
// supabaseAdmin (service_role) ca sa functioneze indiferent de RLS.
async function linkOwnerToRestaurant(userId: string, restaurantId: string) {
  const { error } = await supabaseAdmin
    .from("restaurant_users")
    .upsert({ user_id: userId, restaurant_id: restaurantId, role: "owner" }, { onConflict: "user_id,restaurant_id" });

  if (error) console.error("Nu am putut lega proprietarul de restaurant:", error);
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

  const { data: inserted, error } = await supabase
    .from("restaurants")
    .insert({
      name,
      subtitle,
      slug: baseSlug, // incercam intai slug-ul curat
      google_review_url: googleReviewUrl,
      alert_email: alertEmail,
      trial_started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  let restaurantId = inserted?.id ?? null;

  if (error) {
    // 23505 = unique_violation, dar poate fi si pe alta coloana unica
    // (ex. alert_email), nu neaparat pe slug -- verificam explicit ce
    // coloana a generat conflictul inainte sa reincercam cu un slug nou,
    // ca sa nu ascundem o eroare complet diferita (si irelevanta pentru
    // reincercare) in spatele unui mesaj de succes sau al aceleiasi erori.
    const isSlugConflict =
      error.code === "23505" && /slug/i.test(error.details ?? error.message ?? "");

    if (isSlugConflict) {
      // slug deja folosit -> reincercam cu sufix
      const { data: retryInserted, error: retryError } = await supabase
        .from("restaurants")
        .insert({
          name,
          subtitle,
          slug,
          google_review_url: googleReviewUrl,
          alert_email: alertEmail,
          trial_started_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (retryError) throw retryError;
      restaurantId = retryInserted?.id ?? null;
    } else {
      throw error;
    }
  }

  const ownerId = await ensureOwnerAccount(alertEmail);
  if (ownerId && restaurantId) {
    await linkOwnerToRestaurant(ownerId, restaurantId);
  }

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

// Marcheaza restaurantul ca fiind client platitor (a trecut de luna
// gratuita). Placheta fizica se comanda/trimite DOAR dupa ce e bifat asta --
// vezi PlaqueButton mai jos, care apare doar cand is_paying e true.
export async function togglePayingStatus(restaurantId: string, newValue: boolean) {
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ is_paying: newValue })
    .eq("id", restaurantId);

  if (error) throw error;
  revalidatePath("/admin-x7k2");
}

// Bifat manual dupa ce placheta fizica a fost efectiv trimisa/predata
// restaurantului -- pur informativ, ca sa nu se piarda evidenta cui i-a
// fost deja trimisa si cui nu, pe masura ce cresc numarul de restaurante.
export async function markPlaqueSent(restaurantId: string) {
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ plaque_sent_at: new Date().toISOString() })
    .eq("id", restaurantId);

  if (error) throw error;
  revalidatePath("/admin-x7k2");
}

// Seteaza/corecteaza manual data de start a probei -- necesar mai ales
// pentru restaurante deja existente in sistem dinainte sa existe campul
// asta, dar util oricand daca data reala difera de created_at.
export async function setTrialStartDate(restaurantId: string, isoDate: string) {
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ trial_started_at: isoDate })
    .eq("id", restaurantId);

  if (error) throw error;
  revalidatePath("/admin-x7k2");
}

export async function signOut() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/admin-x7k2/login");
}
