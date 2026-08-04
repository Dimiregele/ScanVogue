import { createBrowserClient } from "@supabase/ssr";

// Client folosit DOAR in Client Components (ex: formularul de login).
// Foloseste cheia publica -- e sigur sa fie expusa in browser.
export function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
