import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Reimprospateaza sesiunea daca tokenul e aproape expirat -- fara asta,
  // userii ar fi delogati brusc dupa un timp, in ciuda unei sesiuni valide.
  await supabase.auth.getUser();

  return response;
}

// Middleware-ul ruleaza DOAR pe rutele de admin -- nu incetineste pagina
// publica de scanare, care ramane cat mai rapida posibil.
export const config = {
  matcher: ["/admin-x7k2/:path*"],
};
