// CSP construit sa functioneze cu ce foloseste efectiv aplicatia:
//   - script-src 'unsafe-inline': Next.js (App Router) injecteaza scripturi
//     inline pentru hidratare (self.__next_f.push). Fara asta, paginile nu se
//     hidrateaza si formularele de login nu functioneaza. O varianta mai
//     stricta (CSP cu nonce, generat in proxy.ts) se poate face ulterior.
//   - 'unsafe-eval' DOAR in development (Next dev are nevoie de el).
//   - connect-src: login-ul (signInWithPassword / signInWithOtp / verifyOtp)
//     ruleaza in browser si apeleaza Supabase direct. Fara domeniul Supabase
//     aici, browserul blocheaza cererea si apare eroarea "Email sau parola
//     incorecta", chiar daca datele sunt corecte.
//   - style-src 'unsafe-inline': scan-client.tsx foloseste <style> inline.
//   - fonts.googleapis.com / fonts.gstatic.com: Cormorant Garamond + Inter.

const isDev = process.env.NODE_ENV !== "production";

// Domeniul exact al proiectului Supabase, luat din variabila de mediu,
// plus wildcard ca plasa de siguranta.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";

const connectSrc = [
  "'self'",
  supabaseHost ? `https://${supabaseHost}` : null,
  supabaseHost ? `wss://${supabaseHost}` : null,
  "https://*.supabase.co",
  "wss://*.supabase.co",
]
  .filter(Boolean)
  .join(" ");

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: CSP },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Se aplica pe toate rutele -- pagina publica de scanare si API-urile
        // proceseaza date personale, deci merita aceleasi headere peste tot.
        // Panourile /admin-x7k2 si /gest-x4p7 au in plus protectia de
        // autentificare din proxy.ts.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
