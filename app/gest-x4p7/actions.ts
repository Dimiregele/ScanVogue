"use server";

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";

export async function signOutOwner() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/gest-x4p7/login");
}
