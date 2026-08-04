import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client folosit in Server Components si Server Actions din panoul de admin.
 * Spre deosebire de lib/supabase.ts (service_role, acces total), acest client
 * respecta sesiunea reala a userului logat -- deci RLS se aplica normal.
 * Un proprietar de restaurant logat va vedea, prin acest client, DOAR
 * restaurantul lui, exact cum ne dorim.
 */
export async function getServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Poate esua daca e apelat dintr-un Server Component (nu Server Action) --
            // middleware.ts se ocupa de refresh-ul sesiunii in acel caz.
          }
        },
      },
    }
  );
}
