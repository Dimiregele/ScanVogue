import { createHmac, timingSafeEqual } from "crypto";

// ============================================================
// IP-ul clientului
// ============================================================
//
// Netlify (si majoritatea platformelor serverless) pun IP-ul real in
// headerul standard "x-forwarded-for" (primul IP din lista, restul sunt
// proxy-uri intermediare) sau, specific Netlify, in "x-nf-client-connection-ip".
// Verificam ambele -- fara niciunul, request-ul poate tot continua (dedup/
// rate-limit devin no-op pentru acel request, dar nu blocam userul din cauza
// unei infrastructuri care nu trimite headerul asteptat).
//
// Acceptam orice obiect cu `.get(name)` -- atat `Request.headers` (in route
// handlers) cat si `ReadonlyHeaders` intors de `headers()` din "next/headers"
// (in Server Components) implementeaza aceasta interfata.
type HeadersLike = { get(name: string): string | null };

export function getClientIp(reqHeaders: HeadersLike): string | null {
  const nfIp = reqHeaders.get("x-nf-client-connection-ip");
  if (nfIp) return nfIp.trim();

  const forwardedFor = reqHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return null;
}

// ============================================================
// Hash-ul IP-ului (nu stocam niciodata IP-ul in clar in baza de date)
// ============================================================
//
// HMAC-SHA256 cu o cheie separata din variabilele de mediu -- suficient ca
// sa putem compara "e aceeasi sursa?" pentru dedup/rate-limit, fara sa
// pastram adresa IP a userului in clar. Fara IP_HASH_SECRET setat, folosim
// un fallback fix -- dedup/rate-limit tot functioneaza (hash-ul e oricum
// doar pentru comparatie internă, nu pentru securitate criptografica), dar
// recomandam setarea lui in productie (vezi .env.local.example).
const FALLBACK_SECRET = "scanvogue-ip-hash-fallback-nu-e-secret-seteaza-IP_HASH_SECRET";

export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SECRET || FALLBACK_SECRET;
  return createHmac("sha256", secret).update(ip).digest("hex");
}

// ============================================================
// Comparatie de secrete in timp constant
// ============================================================
//
// `a !== b` pe stringuri compara caracter cu caracter si iese la prima
// nepotrivire -- timpul de raspuns scurge informatie despre cate caractere
// initiale sunt corecte (timing attack). crypto.timingSafeEqual rezolva
// asta, dar arunca eroare daca buffer-ele au lungimi diferite -- de-asta
// verificam intai lungimea (fara sa scurtcircuitam pe baza rezultatului
// acelei verificari in sine ar re-introduce scurgerea, dar diferenta de
// lungime a doua secrete e oricum publica -- nu e informatie sensibila).
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Comparam tot A cu el insusi ca sa mentinem un timp de executie
    // similar cu cazul "lungimi egale", in loc sa returnam instant.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// Verifica secretul dintr-un request de cron (GitHub Actions), trimis in
// headerul "x-report-secret". Centralizat aici ca sa nu repetam logica de
// comparatie in fiecare ruta -- fiecare ruta isi are propriul nume de
// variabila de mediu pentru secret (WEEKLY_THEMES_SECRET etc.), asa ca
// primim valoarea asteptata ca parametru.
export function isAuthorizedCronRequest(req: Request, expectedSecret: string | undefined): boolean {
  if (!expectedSecret) return false;
  const provided = req.headers.get("x-report-secret");
  if (!provided) return false;
  return safeEqual(provided, expectedSecret);
}

// ============================================================
// Sanitizare pentru headerul "From" al emailurilor
// ============================================================
//
// Numele restaurantului (introdus de admin, dar reflectat public in
// emailuri) ajunge neescapat in `${name} <${address}>`. Doua riscuri:
//   1. Header injection: un "\r\n" in nume ar putea injecta headere noi
//      (CC, BCC etc.) in emailul trimis -- CRITIC, verificat primul.
//   2. Un nume cu <, > sau " strica formatul "Nume <adresa>" asteptat de
//      clientii de email.
// Scoatem orice caracter de control (inclusiv \r\n), <, >, " si limitam
// lungimea, ca headerul sa ramana mereu valid indiferent ce introduce
// admin-ul la crearea restaurantului.
export function sanitizeFromName(name: string): string {
  const cleaned = name
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, "") // orice caracter de control, inclusiv \r si \n
    .replace(/[<>"]/g, "")
    .trim();
  const collapsed = cleaned.replace(/\s+/g, " ");
  return collapsed.slice(0, 150) || "ScanVogue";
}
