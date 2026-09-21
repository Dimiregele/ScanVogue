// CSP construit sa functioneze cu ce foloseste efectiv aplicatia:
//   - style-src 'unsafe-inline': scan-client.tsx foloseste <style> inline
//     (GLOBAL_CSS) -- fara nonce/hash configurat, un CSP strict pe style-src
//     ar rupe pagina de scanare. 'unsafe-inline' pe style e mult mai putin
//     riscant decat pe script (nu poate executa cod), acceptabil aici.
//   - fonts.googleapis.com / fonts.gstatic.com: fontul Cormorant Garamond +
//     Inter, incarcat via @import in acelasi <style>.
//   - script-src 'self': Next.js serveste JS-ul din chunk-uri same-origin,
//     nu inline -- nu are nevoie de 'unsafe-inline'/'unsafe-eval'.
// next build + testarea paginii /r/[slug] dupa activare e recomandata
// inainte de a stringe CSP-ul si mai mult.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self'",
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
        // procesueaza date personale, deci merita aceleasi headere peste tot,
        // nu doar pe panourile /admin-x7k2 si /gest-x4p7 (acelea au deja
        // propria protectie in proxy.ts, care e despre autentificare, nu
        // despre headere HTTP).
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
