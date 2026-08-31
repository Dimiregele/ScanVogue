"use client";
 
/**
 * ScanVogue — pagina de promovare (single-file, portabil).
 *
 * Fișierul acesta NU depinde de Tailwind, de shadcn sau de altceva.
 * Are nevoie doar de React. Toate stilurile sunt inline sau într-un
 * <style> injectat mai jos.
 *
 * Contact / vânzări: scanvogue@gmail.com
 */
 
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
 
/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
 
const C = {
  bg: "#0B0A08",
  bg2: "#100E0B",
  card: "rgba(22,19,15,0.78)",
  cardSolid: "#16130F",
  border: "rgba(198,161,91,0.16)",
  border2: "rgba(255,255,255,0.08)",
  gold: "#C6A15B",
  goldLight: "#E8D2A0",
  goldDeep: "#8A6B38",
  text: "#F5F0E6",
  muted: "#9C9382",
  green: "#8FD3A0",
  amber: "#E0A88C",
};
 
const SALES_EMAIL = "scanvogue@gmail.com";
 
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, -apple-system, Segoe UI, sans-serif";
 
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
 
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; }
 
.sv-root { background: ${C.bg}; color: ${C.text}; font-family: ${sans}; overflow-x: hidden; }
.sv-root ::selection { background: ${C.gold}; color: #100F0D; }
 
@keyframes sv-fadeUp { from { opacity:0; transform: translateY(26px); } to { opacity:1; transform:none; } }
@keyframes sv-float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-50px) scale(1.12); } }
@keyframes sv-float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-45px,35px) scale(1.08); } }
@keyframes sv-spin { to { transform: rotate(360deg); } }
@keyframes sv-drawCircle { from { stroke-dashoffset: 126; } to { stroke-dashoffset: 0; } }
@keyframes sv-drawCheck { from { stroke-dashoffset: 36; } to { stroke-dashoffset: 0; } }
@keyframes sv-corner { 0%,100% { opacity:.45; } 50% { opacity:1; } }
@keyframes sv-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes sv-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(198,161,91,.45); } 70% { box-shadow: 0 0 0 16px rgba(198,161,91,0); } }
@keyframes sv-shimmer { from { background-position: -220% 0; } to { background-position: 220% 0; } }
@keyframes sv-riseBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
 
.sv-reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); will-change: opacity, transform; }
.sv-reveal.sv-in { opacity: 1; transform: none; }
 
.sv-btn { position: relative; font-family: ${sans}; cursor: pointer; border-radius: 14px; font-weight: 600; font-size: 15px;
  display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 15px 26px; border: 1px solid transparent;
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, background .3s ease, border-color .3s ease, color .3s ease; text-decoration: none; }
.sv-btn:active { transform: scale(.97); }
.sv-btn-primary { background: linear-gradient(135deg, ${C.goldLight}, ${C.gold} 58%, ${C.goldDeep}); color: #100F0D; box-shadow: 0 10px 34px -14px rgba(198,161,91,.8); }
.sv-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 18px 46px -14px rgba(198,161,91,.85); }
.sv-btn-ghost { background: rgba(198,161,91,.05); color: ${C.text}; border-color: rgba(198,161,91,.32); }
.sv-btn-ghost:hover { transform: translateY(-3px); border-color: ${C.gold}; background: rgba(198,161,91,.11); }
.sv-btn-sm { padding: 11px 18px; font-size: 13.5px; border-radius: 12px; }
 
.sv-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 20px; backdrop-filter: blur(10px); }
.sv-lift { transition: transform .35s cubic-bezier(.16,1,.3,1), border-color .35s ease, box-shadow .35s ease; }
.sv-lift:hover { transform: translateY(-6px); border-color: rgba(198,161,91,.42); box-shadow: 0 24px 60px -30px rgba(0,0,0,.9); }
 
.sv-input { width: 100%; background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.09); border-radius: 12px;
  color: ${C.text}; font-family: ${sans}; font-size: 14px; padding: 13px 14px; transition: border-color .2s, box-shadow .2s, background .2s; }
.sv-input:focus { outline: none; border-color: ${C.gold}; box-shadow: 0 0 0 3px rgba(198,161,91,.15); background: rgba(255,255,255,.05); }
.sv-input::placeholder { color: #6E6759; }
 
.sv-corner { position: absolute; width: 20px; height: 20px; animation: sv-corner 3.6s ease-in-out infinite; }
 
.sv-eyebrow { font-size: 10.5px; letter-spacing: .3em; text-transform: uppercase; color: ${C.gold}; font-weight: 600; }
.sv-h2 { font-family: ${serif}; font-weight: 600; font-size: clamp(30px, 4.6vw, 50px); line-height: 1.08; margin: 14px 0 0; letter-spacing: -.01em; }
.sv-lead { color: ${C.muted}; font-size: 16px; line-height: 1.7; margin: 16px 0 0; max-width: 58ch; }
 
.sv-link { color: ${C.muted}; text-decoration: none; transition: color .2s; font-size: 13.5px; }
.sv-link:hover { color: ${C.gold}; }
 
.sv-marquee-track { display: flex; width: max-content; animation: sv-marquee 38s linear infinite; }
.sv-marquee:hover .sv-marquee-track { animation-play-state: paused; }
 
.sv-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
.sv-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; }
.sv-split { display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 46px; align-items: center; }
 
.sv-tab { border: 1px solid transparent; background: transparent; color: ${C.muted}; font-family: ${sans}; font-size: 13.5px; font-weight: 600;
  padding: 10px 18px; border-radius: 999px; cursor: pointer; transition: all .25s ease; }
.sv-tab:hover { color: ${C.text}; }
.sv-tab-on { background: rgba(198,161,91,.12); border-color: rgba(198,161,91,.4); color: ${C.text}; }
 
.sv-phone { width: 360px; max-width: 100%; border-radius: 42px; padding: 12px; background: linear-gradient(160deg, #2A2620, #100E0B 55%);
  border: 1px solid rgba(198,161,91,.22); box-shadow: 0 50px 90px -40px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,.06); }
.sv-phone-screen { position: relative; overflow: hidden; border-radius: 32px; background: radial-gradient(120% 80% at 50% 0%, #18140F 0%, ${C.bg} 62%);
  min-height: 580px; padding: 28px 24px; display: flex; flex-direction: column; }
 
.sv-bar { transform-origin: bottom; animation: sv-riseBar .7s cubic-bezier(.16,1,.3,1) both; }
 
.sv-shimmer { background: linear-gradient(100deg, transparent 20%, rgba(232,210,160,.75) 50%, transparent 80%);
  background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: sv-shimmer 5.5s linear infinite; }
 
@media (max-width: 900px) {
  .sv-split { grid-template-columns: 1fr; gap: 34px; }
  .sv-grid-3 { grid-template-columns: 1fr; }
  .sv-grid-2 { grid-template-columns: 1fr; }
  .sv-hide-sm { display: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  .sv-reveal { opacity: 1 !important; transform: none !important; }
  .sv-root * { animation-duration: .001ms !important; animation-iteration-count: 1 !important; }
}
`;
 
/* ------------------------------------------------------------------ */
/* Utilitare mici                                                      */
/* ------------------------------------------------------------------ */
 
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".sv-reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("sv-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("sv-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}
 
function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!("IntersectionObserver" in window)) return setSeen(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}
 
function Counter({ to, decimals = 0, suffix = "", prefix = "" }: { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const { ref, seen } = useInView<HTMLSpanElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return (
    <span ref={ref}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}
 
/* Iconițe inline (fără dependențe externe) */
const Ic = {
  star: (p: { size?: number; fill?: string; color?: string }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill={p.fill ?? "none"} stroke={p.color ?? C.gold} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z" />
    </svg>
  ),
  qr: (p: { size?: number }) => (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M14 20h6" />
    </svg>
  ),
  shield: (p: { size?: number }) => (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5.5c0 4.4-3 8.2-7 9.5-4-1.3-7-5.1-7-9.5V6z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  spark: (p: { size?: number }) => (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  ),
  chart: (p: { size?: number }) => (
    <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  mail: (p: { size?: number }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 7l9 6 9-6" />
    </svg>
  ),
  arrow: (p: { size?: number }) => (
    <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  ),
  msg: (p: { size?: number }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-6.3A8 8 0 1121 12z" />
    </svg>
  ),
  send: (p: { size?: number }) => (
    <svg width={p.size ?? 17} height={p.size ?? 17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3L10.5 13.5M21 3l-6.8 18-3.7-7.5L3 10z" />
    </svg>
  ),
  cart: (p: { size?: number }) => (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L21 8H6" /><circle cx="10" cy="20" r="1.2" /><circle cx="18" cy="20" r="1.2" />
    </svg>
  ),
};
 
function Corners({ children, inset = -9 }: { children: React.ReactNode; inset?: number }) {
  const s = { borderColor: C.gold } as React.CSSProperties;
  return (
    <div style={{ position: "relative" }}>
      <span className="sv-corner" style={{ ...s, top: inset, left: inset, borderTop: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}`, borderTopLeftRadius: 4 }} />
      <span className="sv-corner" style={{ ...s, top: inset, right: inset, borderTop: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}`, borderTopRightRadius: 4, animationDelay: ".4s" }} />
      <span className="sv-corner" style={{ ...s, bottom: inset, left: inset, borderBottom: `1px solid ${C.gold}`, borderLeft: `1px solid ${C.gold}`, borderBottomLeftRadius: 4, animationDelay: ".8s" }} />
      <span className="sv-corner" style={{ ...s, bottom: inset, right: inset, borderBottom: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}`, borderBottomRightRadius: 4, animationDelay: "1.2s" }} />
      {children}
    </div>
  );
}
 
function Section({ id, children, style }: { id?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section id={id} style={{ position: "relative", padding: "clamp(70px, 9vw, 130px) 22px", ...style }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>{children}</div>
    </section>
  );
}
 
/* mailto helpers (folosite doar ca fallback dacă serverul nu răspunde) */
const mailto = (subject: string, body: string) =>
  `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 
/* ------------------------------------------------------------------ */
/* Formular de contact (trimite email real prin server)                */
/* ------------------------------------------------------------------ */
 
const CONTACT_ENDPOINT = "/api/contact";
 
const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text,
  font: `500 14px ${sans}`,
  padding: "11px 13px",
  outline: "none",
};
 
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: C.muted,
  marginBottom: 6,
};
 
function ContactModal({
  open,
  onClose,
  restaurantName,
}: {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [restaurant, setRestaurant] = useState(restaurantName);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
 
  useEffect(() => {
    if (open) setRestaurant(restaurantName);
  }, [open, restaurantName]);
 
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
 
  if (!open) return null;
 
  const fallbackMailto = mailto(
    `Cerere ofertă ScanVogue — ${restaurant || restaurantName}`,
    `Nume: ${name}\nEmail: ${email}\nLocal: ${restaurant}\n\n${message}`
  );
 
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Te rugăm să completezi numele.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return setError("Adresa de email nu pare validă.");
    if (message.trim().length < 5) return setError("Te rugăm să scrii un mesaj.");
 
    setStatus("sending");
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, restaurant, message, company }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Trimiterea a eșuat. Încearcă din nou.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Nu am reușit să contactăm serverul. Verifică conexiunea.");
    }
  };
 
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Formular de contact ScanVogue"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: "rgba(6,5,4,.76)",
        backdropFilter: "blur(7px)",
        animation: "sv-fadeUp .3s cubic-bezier(.16,1,.3,1) both",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: `linear-gradient(180deg, rgba(24,20,16,.98), rgba(14,12,10,.98))`,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "26px 24px 24px",
          boxShadow: "0 30px 90px rgba(0,0,0,.6)",
          animation: "sv-fadeUp .45s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 600 }}>
              {status === "sent" ? "Mesaj trimis" : "Hai să vorbim"}
            </div>
            <p style={{ color: C.muted, fontSize: 13, margin: "6px 0 0", lineHeight: 1.6 }}>
              {status === "sent"
                ? "Îți răspundem pe email în cel mai scurt timp."
                : "Completează și îți răspundem pe email, de obicei în aceeași zi."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            style={{
              background: "transparent",
              border: `1px solid ${C.border2}`,
              color: C.muted,
              borderRadius: 9,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
 
        {status === "sent" ? (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <div
              style={{
                width: 62,
                height: 62,
                margin: "0 auto",
                borderRadius: "50%",
                border: `1px solid ${C.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(198,161,91,.1)",
                animation: "sv-pulse 2s ease-out infinite",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </div>
            <p style={{ color: C.text, fontSize: 14.5, marginTop: 18, lineHeight: 1.7 }}>
              Mulțumim, {name.split(" ")[0] || "!"} — am primit cererea pentru{" "}
              <span style={{ color: C.gold }}>{restaurant || restaurantName}</span>.
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <button className="sv-btn sv-btn-primary sv-btn-sm" type="button" onClick={onClose}>
                Închide
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle} htmlFor="sv-name">Nume</label>
              <input id="sv-name" style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ion Popescu" maxLength={120} autoComplete="name" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="sv-email">Email</label>
              <input id="sv-email" type="email" style={fieldStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ion@restaurantultau.ro" maxLength={200} autoComplete="email" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="sv-rest">Numele localului</label>
              <input id="sv-rest" style={fieldStyle} value={restaurant} onChange={(e) => setRestaurant(e.target.value)} maxLength={160} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="sv-msg">Mesaj</label>
              <textarea id="sv-msg" style={{ ...fieldStyle, minHeight: 108, resize: "vertical" }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Câte mese aveți, ce vă interesează, când putem porni…" maxLength={4000} />
            </div>
 
            {/* honeypot anti-spam — ascuns pentru oameni */}
            <input
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
 
            {error && (
              <div
                style={{
                  border: `1px solid rgba(224,168,140,.4)`,
                  background: "rgba(224,168,140,.08)",
                  color: C.amber,
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {error}
                {status === "error" && (
                  <div style={{ marginTop: 8 }}>
                    <a className="sv-btn sv-btn-ghost sv-btn-sm" href={fallbackMailto}>
                      <Ic.mail /> Trimite pe email
                    </a>
                  </div>
                )}
              </div>
            )}
 
            <button className="sv-btn sv-btn-primary" type="submit" disabled={status === "sending"} style={{ marginTop: 2, opacity: status === "sending" ? 0.7 : 1 }}>
              {status === "sending" ? (
                <>
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      border: "2px solid rgba(0,0,0,.25)",
                      borderTopColor: "#100F0D",
                      display: "inline-block",
                      animation: "sv-spin .8s linear infinite",
                    }}
                  />
                  Se trimite…
                </>
              ) : (
                <>
                  <Ic.mail /> Trimite mesajul
                </>
              )}
            </button>
            <p style={{ fontSize: 11.5, color: "#6E6759", margin: 0, textAlign: "center" }}>
              Mesajul ajunge direct la {SALES_EMAIL}. Fără spam, fără liste de marketing.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
 
 
/* ------------------------------------------------------------------ */
/* DEMO 1 — pagina clientului (replică 1:1 a paginii reale /r/[slug])  */
/* ------------------------------------------------------------------ */
 
type DemoView = "initial" | "negative-form" | "thanks-negative" | "redirecting";
 
function ChoiceButton({
  onClick,
  icon,
  children,
  arrow,
}: {
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  arrow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="sv-btn"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background: "rgba(198,161,91,0.07)",
        color: C.text,
        fontWeight: 600,
        fontSize: 15,
        borderRadius: 14,
        padding: "16px 20px",
        border: "1px solid rgba(198,161,91,0.35)",
      }}
    >
      <span style={{ color: C.gold, display: "flex", flexShrink: 0 }}>{icon}</span>
      <span>{children}</span>
      {arrow && <span style={{ color: C.gold, display: "flex", flexShrink: 0 }}><Ic.arrow size={15} /></span>}
    </button>
  );
}
 
function ClientDemo({ restaurantName }: { restaurantName: string }) {
  const [view, setView] = useState<DemoView>("initial");
  const [message, setMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
 
  const len = restaurantName.length;
  const wordmarkSize = len <= 9 ? 28 : len <= 13 ? 24 : len <= 17 ? 20 : len <= 21 ? 17 : len <= 27 ? 14 : 12;
  const wordmarkSpacing = len <= 9 ? "0.14em" : len <= 13 ? "0.1em" : len <= 17 ? "0.06em" : len <= 21 ? "0.03em" : "0.01em";
 
  const reset = () => {
    setView("initial");
    setMessage("");
    setContactName("");
    setContactEmail("");
  };
 
  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setView("thanks-negative");
    }, 900);
  };
 
  const handlePositive = () => {
    setView("redirecting");
    setTimeout(() => reset(), 2400);
  };
 
  return (
    <div className="sv-phone">
      <div className="sv-phone-screen" style={{ justifyContent: "center" }}>
        {/* bokeh — identic cu pagina reală */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-8%", left: "-10%", width: 260, height: 260, borderRadius: "50%", filter: "blur(20px)", background: "radial-gradient(circle, rgba(198,161,91,0.16) 0%, transparent 70%)", animation: "sv-float1 9s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: 300, height: 300, borderRadius: "50%", filter: "blur(20px)", background: "radial-gradient(circle, rgba(150,100,50,0.14) 0%, transparent 70%)", animation: "sv-float2 11s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "35%", right: "-15%", width: 200, height: 200, borderRadius: "50%", filter: "blur(20px)", background: "radial-gradient(circle, rgba(198,161,91,0.1) 0%, transparent 70%)", animation: "sv-float1 8s ease-in-out infinite" }} />
        </div>
 
        <div style={{ position: "relative", zIndex: 1 }}>
          <Corners>
            <div
              style={{
                background: C.card,
                backdropFilter: "blur(18px)",
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: "34px 22px",
                boxShadow: "0 30px 60px -15px rgba(0,0,0,0.6)",
              }}
            >
              {/* wordmark */}
              <div style={{ textAlign: "center", marginBottom: 34, animation: "sv-fadeUp .55s cubic-bezier(.16,1,.3,1) .05s both" }}>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: wordmarkSize,
                    letterSpacing: wordmarkSpacing,
                    color: C.text,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    padding: "0 4px",
                  }}
                >
                  {restaurantName}
                </div>
                <div style={{ fontSize: 10.5, letterSpacing: "0.28em", color: C.muted, marginTop: 6, textTransform: "uppercase" }}>
                  Restaurant
                </div>
              </div>
 
              {view === "initial" && (
                <div>
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 14, lineHeight: 1.5, marginBottom: 26, animation: "sv-fadeUp .55s cubic-bezier(.16,1,.3,1) .15s both" }}>
                    Spune-ne cum a fost — alege ce ți se potrivește.
                  </p>
 
                  <div style={{ animation: "sv-fadeUp .55s cubic-bezier(.16,1,.3,1) .25s both" }}>
                    <ChoiceButton onClick={handlePositive} icon={<Ic.star size={17} />} arrow>
                      Lasă o recenzie pe Google
                    </ChoiceButton>
                  </div>
 
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0", animation: "sv-fadeUp .55s cubic-bezier(.16,1,.3,1) .25s both" }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                    <span style={{ fontSize: 11, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase" }}>sau</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                  </div>
 
                  <div style={{ animation: "sv-fadeUp .55s cubic-bezier(.16,1,.3,1) .35s both" }}>
                    <p style={{ textAlign: "center", color: C.muted, fontSize: 12.5, marginBottom: 10, lineHeight: 1.5 }}>
                      Ai avut o problemă și vrei să o rezolvăm imediat?
                    </p>
                    <ChoiceButton onClick={() => setView("negative-form")} icon={<Ic.msg size={17} />}>
                      Trimite un mesaj privat conducerii
                    </ChoiceButton>
                  </div>
                </div>
              )}
 
              {view === "negative-form" && (
                <form onSubmit={handleSubmitComplaint}>
                  <p style={{ textAlign: "center", color: C.text, fontSize: 16, marginBottom: 4, fontWeight: 500, animation: "sv-fadeUp .55s cubic-bezier(.16,1,.3,1) .05s both" }}>
                    Ne pare rău să auzim asta.
                  </p>
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 13.5, marginBottom: 26, lineHeight: 1.5, animation: "sv-fadeUp .55s cubic-bezier(.16,1,.3,1) .05s both" }}>
                    Spune-ne ce nu a fost în regulă — mesajul ajunge direct la echipa noastră.
                  </p>
 
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ce nu a fost pe placul tău?"
                    rows={4}
                    className="sv-input"
                    style={{ marginBottom: 18, resize: "none" }}
                  />
 
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                    <span style={{ fontSize: 10.5, letterSpacing: "0.18em", color: C.gold, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      Ca să primești un răspuns
                    </span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                  </div>
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 12.5, marginBottom: 14, lineHeight: 1.5 }}>
                    Lasă-ne un contact ca să te putem suna sau scrie personal și să îndreptăm lucrurile.
                  </p>
 
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nume"
                    className="sv-input"
                    style={{ marginBottom: 10 }}
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email — primești răspunsul nostru aici"
                    className="sv-input"
                    style={{ marginBottom: 20 }}
                  />
 
                  <button type="submit" className="sv-btn sv-btn-primary" style={{ width: "100%" }} disabled={submitting}>
                    {submitting ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#100F0D" strokeWidth="2.2" strokeLinecap="round" style={{ animation: "sv-spin .8s linear infinite" }}>
                        <path d="M21 12a9 9 0 11-6.2-8.6" />
                      </svg>
                    ) : (
                      <Ic.send size={15} />
                    )}
                    {submitting ? "Se trimite..." : "Trimite"}
                  </button>
                  <p style={{ textAlign: "center", color: C.muted, fontSize: 11, marginTop: 14, lineHeight: 1.5 }}>
                    Prin trimitere ești de acord cu prelucrarea datelor conform{" "}
                    <span style={{ textDecoration: "underline" }}>Politicii de Confidențialitate</span>.
                  </p>
                  <button type="button" className="sv-link" style={{ background: "none", border: "none", width: "100%", marginTop: 10, cursor: "pointer" }} onClick={reset}>
                    Înapoi
                  </button>
                </form>
              )}
 
              {view === "thanks-negative" && (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" style={{ margin: "0 auto 18px", display: "block" }}>
                    <circle cx="26" cy="26" r="20" fill="none" stroke={C.gold} strokeWidth="1.5" strokeDasharray="126" style={{ animation: "sv-drawCircle .7s cubic-bezier(.16,1,.3,1) both" }} />
                    <path d="M16 27l7 7 13-15" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="36" style={{ animation: "sv-drawCheck .4s ease .6s both" }} />
                  </svg>
                  <p style={{ color: C.text, fontSize: 16, marginBottom: 8, fontWeight: 500 }}>
                    Mulțumim, mesajul tău a ajuns la echipa noastră!
                  </p>
                  <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.5 }}>
                    Dacă ai lăsat un contact, cineva din echipă îți va răspunde personal în cel mai scurt timp.
                  </p>
                  <button className="sv-btn sv-btn-ghost sv-btn-sm" style={{ marginTop: 18 }} onClick={reset}>Reia demo-ul</button>
                </div>
              )}
 
              {view === "redirecting" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 40, height: 40, margin: "0 auto 20px", borderRadius: "50%", border: "2px solid rgba(198,161,91,0.2)", borderTopColor: C.gold, animation: "sv-spin .9s linear infinite" }} />
                  <p style={{ color: C.text, fontSize: 15.5 }}>Acum ai fi fost redirecționat către pagina ta de recenzii.</p>
                  <p style={{ fontSize: 11.5, color: C.muted, margin: "8px 0 0" }}>(simulare — nu se face un redirect real)</p>
                </div>
              )}
            </div>
          </Corners>
        </div>
      </div>
    </div>
  );
}
 
/* ------------------------------------------------------------------ */
/* DEMO 2 — panoul de manager (replică 1:1 a panoului real)            */
/* ------------------------------------------------------------------ */
 
type ComplaintStatus = "new" | "read" | "resolved";
 
type Complaint = {
  id: string;
  message: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: ComplaintStatus;
  created_at: string;
  ai_summary: string | null;
  ai_suggested_reply: string | null;
  ai_sensitive: boolean;
  reply_sent_at: string | null;
};
 
const dayMs = 24 * 60 * 60 * 1000;
const daysAgo = (d: number, hour: number, minute = 0) => {
  const t = new Date(Date.now() - d * dayMs);
  t.setHours(hour, minute, 0, 0);
  return t.toISOString();
};
 
const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "c1",
    message: "Am rezervat pentru 20:30 și am primit masa la 21:05. Nimeni nu ne-a spus nimic între timp.",
    contact_name: "Andrei M.",
    contact_email: "andrei.m@email.com",
    contact_phone: "07xx xxx 214",
    status: "new",
    created_at: daysAgo(0, 21, 14),
    ai_summary: "Întârziere de 35 min la o rezervare confirmată, fără comunicare din partea gazdei.",
    ai_suggested_reply:
      "Bună, Andrei. Ai avut dreptate să fii nemulțumit — o rezervare confirmată înseamnă o masă la ora stabilită. Am revizuit deja modul în care ținem rezervările în intervalul 20:00–21:30. Ne-ar face plăcere să te avem înapoi, cu desertul din partea casei.",
    ai_sensitive: false,
    reply_sent_at: null,
  },
  {
    id: "c2",
    message: "Ciorba a venit călduță, iar când am semnalat, chelnerul a ridicat din umeri.",
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    status: "new",
    created_at: daysAgo(1, 20, 2),
    ai_summary: "Preparat servit la temperatură scăzută + reacție defensivă a personalului de sală.",
    ai_suggested_reply:
      "Vă mulțumim că ne-ați spus. Temperatura la servire și modul în care reacționăm când ceva nu e în regulă sunt două lucruri pe care le-am discutat azi cu echipa de sală. Ne-ar plăcea să reparăm impresia la o următoare vizită.",
    ai_sensitive: false,
    reply_sent_at: null,
  },
  {
    id: "c3",
    message: "Am găsit un fir de păr în farfurie și zona de lângă bar mi s-a părut murdară.",
    contact_name: "Ioana P.",
    contact_email: "ioana.p@email.com",
    contact_phone: null,
    status: "read",
    created_at: daysAgo(3, 22, 41),
    ai_summary: "Sesizare de igienă: corp străin în preparat și curățenie deficitară în zona barului.",
    ai_suggested_reply:
      "Bună, Ioana. Am tratat mesajul tău ca pe o urgență: am verificat azi-dimineață fluxul din bucătărie și programul de curățenie din zona barului. Îmi pare sincer rău pentru experiență și te-aș ruga să ne dai ocazia să reparăm lucrurile.",
    ai_sensitive: true,
    reply_sent_at: null,
  },
  {
    id: "c4",
    message: "Muzica era atât de tare încât nu ne auzeam la masă. Am plecat fără desert.",
    contact_name: "Radu T.",
    contact_email: "radu.t@email.com",
    contact_phone: null,
    status: "read",
    created_at: daysAgo(5, 22, 10),
    ai_summary: "Volum ambiental prea ridicat după ora 22:00; a scurtat durata mesei și consumul.",
    ai_suggested_reply:
      "Bună, Radu. Am măsurat volumul în sală vineri seara și l-am coborât cu 6 dB după ora 22:00. Mulțumim că ne-ai scris în loc să pleci în tăcere — exact asta ne ajută să reparăm lucrurile.",
    ai_sensitive: false,
    reply_sent_at: daysAgo(4, 11, 30),
  },
  {
    id: "c5",
    message: "Nota a venit greșit, cu un fel în plus. S-a rezolvat, dar a durat.",
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    status: "resolved",
    created_at: daysAgo(9, 21, 5),
    ai_summary: "Eroare de facturare, corectată la fața locului, dar cu timp de așteptare.",
    ai_suggested_reply: null,
    ai_sensitive: false,
    reply_sent_at: null,
  },
];
 
const LIVE_COMPLAINT_TEMPLATE: Omit<Complaint, "id" | "created_at"> = {
  message: "Am comandat un burger fără ceapă și a venit cu ceapă. L-au refăcut, dar am pierdut 20 de minute.",
  contact_name: "Vlad S.",
  contact_email: "vlad.s@email.com",
  contact_phone: null,
  status: "new",
  ai_summary: "Eroare la comandă (ingredient nedorit) + întârziere mare la refacerea preparatului.",
  ai_suggested_reply:
    "Bună, Vlad. Ne pare rău pentru neatenție și pentru timpul pierdut — am discutat azi cu bucătăria despre notarea mențiunilor speciale pe bon. Ne-ar plăcea să-ți oferim burgerul din partea casei la următoarea vizită.",
  ai_sensitive: false,
  reply_sent_at: null,
};
 
type ThemeRowData = { theme: string; count: number; timePattern: string | null; outcome: string | null };
 
const SEED_THEMES: ThemeRowData[] = [
  { theme: "Timp de așteptare la masă", count: 14, timePattern: "Mai ales vineri și sâmbătă, 20:00–21:30", outcome: null },
  { theme: "Temperatura preparatelor", count: 9, timePattern: "Fără tipar clar de oră", outcome: null },
  { theme: "Zgomot / muzică prea tare", count: 6, timePattern: "După ora 22:00", outcome: "Marcat rezolvat pe 12 iunie — de atunci 0 reclamații pe această temă." },
  { theme: "Atitudinea personalului de sală", count: 4, timePattern: "Serile de weekend", outcome: null },
];
 
type Granularity = "day" | "week" | "month" | "year";
const GRANULARITY_LABEL: Record<Granularity, string> = { day: "Zi", week: "Săptămână", month: "Lună", year: "An" };
const WINDOW_SIZE: Record<Granularity, number> = { day: 30, week: 12, month: 12, year: 6 };
const pad = (n: number) => n.toString().padStart(2, "0");
 
type Scan = { created_at: string; choice: "positive" | "negative" | null };
 
/* set de scanări demo, deterministic — imită traficul unui restaurant */
function buildDemoScans(): Scan[] {
  const out: Scan[] = [];
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const hourWeights = [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 5, 9, 10, 6, 4, 4, 6, 10, 14, 16, 12, 6, 2];
  for (let d = 89; d >= 0; d--) {
    const date = new Date(Date.now() - d * dayMs);
    const dow = date.getDay();
    const weekendBoost = dow === 5 || dow === 6 ? 1.6 : dow === 0 ? 1.15 : 1;
    const growth = 1 + (89 - d) / 150;
    const count = Math.round((5 + rnd() * 5) * weekendBoost * growth);
    for (let i = 0; i < count; i++) {
      let pick = rnd() * hourWeights.reduce((a, b) => a + b, 0);
      let hour = 12;
      for (let h = 0; h < 24; h++) {
        pick -= hourWeights[h] ?? 0;
        if (pick <= 0) { hour = h; break; }
      }
      const r = rnd();
      const choice: Scan["choice"] = r < 0.82 ? "positive" : r < 0.94 ? "negative" : null;
      const t = new Date(date);
      t.setHours(hour, Math.floor(rnd() * 60), 0, 0);
      out.push({ created_at: t.toISOString(), choice });
    }
  }
  return out;
}
 
function startOfWeek(d: Date) {
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay();
  monday.setDate(monday.getDate() + ((day === 0 ? -6 : 1) - day));
  return monday;
}
 
function bucketKeyAndLabel(date: Date, granularity: Granularity): { key: string; label: string } {
  if (granularity === "day") {
    return { key: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, label: `${pad(date.getDate())}.${pad(date.getMonth() + 1)}` };
  }
  if (granularity === "week") {
    const monday = startOfWeek(date);
    return { key: `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`, label: `${pad(monday.getDate())}.${pad(monday.getMonth() + 1)}` };
  }
  if (granularity === "month") {
    return { key: `${date.getFullYear()}-${pad(date.getMonth() + 1)}`, label: date.toLocaleDateString("ro-RO", { month: "short", year: "2-digit" }) };
  }
  const key = `${date.getFullYear()}`;
  return { key, label: key };
}
 
function emptyBuckets(granularity: Granularity, count: number) {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (granularity === "day") d.setDate(d.getDate() - i);
    else if (granularity === "week") d.setDate(d.getDate() - i * 7);
    else if (granularity === "month") d.setMonth(d.getMonth() - i);
    else d.setFullYear(d.getFullYear() - i);
    out.push(bucketKeyAndLabel(d, granularity));
  }
  const seen = new Set<string>();
  return out.filter((b) => (seen.has(b.key) ? false : (seen.add(b.key), true)));
}
 
const adminCard: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: 22,
};
const adminTitle: React.CSSProperties = { color: C.text, fontSize: 15, fontWeight: 600, marginTop: 0, marginBottom: 16 };
const smallPill: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 999,
  border: "1px solid rgba(198,161,91,0.35)",
  background: "transparent",
  color: C.goldLight,
  cursor: "pointer",
  fontFamily: sans,
  whiteSpace: "nowrap",
};
const ghostPill: React.CSSProperties = { ...smallPill, border: "1px solid rgba(255,255,255,0.1)", color: C.muted };
 
function StackedBars({
  data,
  height,
  labelEvery = 1,
}: {
  data: { label: string; positive: number; negative: number; total: number }[];
  height: number;
  labelEvery?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}>
        {data.map((d, i) => (
          <div key={d.label + i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }} title={`${d.label}: ${d.positive} pozitive · ${d.negative} negative`}>
            <div className="sv-bar" style={{ height: `${(d.total / max) * 100}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", animationDelay: `${Math.min(i * 0.02, 0.6)}s` }}>
              <div style={{ height: `${d.total ? (d.negative / d.total) * 100 : 0}%`, background: C.amber, borderRadius: "3px 3px 0 0" }} />
              <div style={{ height: `${d.total ? (d.positive / d.total) * 100 : 0}%`, background: C.green }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 7 }}>
        {data.map((d, i) => (
          <div key={d.label + i} style={{ flex: 1, textAlign: "center", fontSize: 9.5, color: C.muted, whiteSpace: "nowrap", overflow: "visible" }}>
            {i % labelEvery === 0 ? d.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
 
function ThemeRow({ row }: { row: ThemeRowData }) {
  const [formOpen, setFormOpen] = useState(false);
  const [note, setNote] = useState("");
  const [justMarked, setJustMarked] = useState(false);
  const [saving, setSaving] = useState(false);
 
  const submit = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setFormOpen(false);
      setNote("");
      setJustMarked(true);
    }, 700);
  };
 
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ color: C.text, fontSize: 13.5, fontWeight: 500 }}>{row.theme}</span>
        <span style={{ color: C.gold, fontSize: 12.5, fontWeight: 600 }}>{row.count}×</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${(row.count / 14) * 100}%`, background: `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})`, borderRadius: 3, transition: "width 1s cubic-bezier(.16,1,.3,1)" }} />
      </div>
      {row.timePattern && <p style={{ color: C.gold, fontSize: 12, margin: "0 0 6px" }}>{row.timePattern}</p>}
      {(row.outcome || justMarked) && (
        <p style={{ color: C.muted, fontSize: 12, margin: "0 0 6px", lineHeight: 1.5 }}>
          {justMarked && !row.outcome ? "Marcat ca rezolvat — revenim cu rezultatul în câteva zile." : row.outcome}
        </p>
      )}
      {!formOpen && !justMarked && (
        <button type="button" onClick={() => setFormOpen(true)} style={smallPill}>
          Marchează ca rezolvat
        </button>
      )}
      {formOpen && (
        <div style={{ marginTop: 6 }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ce ai făcut ca să rezolvi asta? (opțional)"
            rows={2}
            className="sv-input"
            style={{ fontSize: 12.5, resize: "none" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setFormOpen(false)} disabled={saving} style={ghostPill}>Anulează</button>
            <button type="button" onClick={submit} disabled={saving} style={smallPill}>{saving ? "Se salvează..." : "Confirmă"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
 
const STATUS_LABEL: Record<ComplaintStatus, string> = { new: "Nouă", read: "Citită", resolved: "Rezolvată" };
const STATUS_COLOR: Record<ComplaintStatus, string> = { new: C.amber, read: C.gold, resolved: C.green };
 
function ComplaintCard({ complaint: c, onStatus, highlight }: { complaint: Complaint; onStatus: (id: string, s: ComplaintStatus) => void; highlight?: boolean }) {
  const [replyText, setReplyText] = useState(c.ai_suggested_reply ?? "");
  const [showComposer, setShowComposer] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentAt, setSentAt] = useState<string | null>(c.reply_sent_at);
 
  const nextStatus: ComplaintStatus = c.status === "new" ? "read" : c.status === "read" ? "resolved" : "new";
 
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
 
  const send = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentAt(new Date().toISOString());
      setShowComposer(false);
    }, 800);
  };
 
  return (
    <div
      style={{
        padding: 14,
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        border: highlight ? `1px solid rgba(198,161,91,.5)` : "1px solid transparent",
        boxShadow: highlight ? "0 0 0 3px rgba(198,161,91,.1)" : "none",
        animation: highlight ? "sv-fadeUp .5s cubic-bezier(.16,1,.3,1) both" : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <p style={{ color: C.text, fontSize: 14, lineHeight: 1.5, margin: 0, flex: 1 }}>{c.message}</p>
        <button
          type="button"
          onClick={() => onStatus(c.id, nextStatus)}
          title={`Apasă ca să marchezi drept „${STATUS_LABEL[nextStatus]}”`}
          style={{
            fontSize: 11,
            padding: "5px 10px",
            borderRadius: 999,
            border: "1px solid",
            background: "transparent",
            cursor: "pointer",
            fontFamily: sans,
            color: STATUS_COLOR[c.status],
            borderColor: STATUS_COLOR[c.status] + "59",
            whiteSpace: "nowrap",
          }}
        >
          {STATUS_LABEL[c.status]}
        </button>
      </div>
 
      <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>
        {fmt(c.created_at)}
        {c.contact_name && <> · contact: {c.contact_name}</>}
        {c.contact_phone && <> · {c.contact_phone}</>}
        {c.contact_email && <> · {c.contact_email}</>}
      </div>
 
      {c.ai_sensitive && (
        <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(224,168,140,0.1)", border: "1px solid rgba(224,168,140,0.35)", color: C.amber, fontSize: 12, fontWeight: 500 }}>
          ⚠️ Necesită atenție umană — nu răspunde doar cu sugestia AI, citește cu atenție
        </div>
      )}
 
      {c.ai_summary && (
        <div style={{ color: "#7FA0C4", fontSize: 12.5, marginTop: 10 }}>
          <strong>Rezumat AI:</strong> {c.ai_summary}
        </div>
      )}
 
      {sentAt ? (
        <div style={{ color: C.green, fontSize: 12.5, marginTop: 10 }}>✓ Răspuns trimis pe {fmt(sentAt)}</div>
      ) : c.ai_suggested_reply ? (
        <div style={{ marginTop: 12 }}>
          {!showComposer ? (
            <button type="button" onClick={() => setShowComposer(true)} style={ghostPill}>
              Vezi răspunsul sugerat de AI
            </button>
          ) : (
            <div>
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} className="sv-input" style={{ fontSize: 13, resize: "vertical" }} />
              {!c.contact_email && (
                <p style={{ color: C.amber, fontSize: 12, margin: "6px 0" }}>
                  Acest client nu a lăsat un email — nu poți trimite automat.
                </p>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !c.contact_email || !replyText.trim()}
                  style={{
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: C.gold,
                    color: "#100F0D",
                    fontWeight: 600,
                    fontFamily: sans,
                    cursor: "pointer",
                    opacity: sending || !c.contact_email || !replyText.trim() ? 0.5 : 1,
                  }}
                >
                  {sending ? "Se trimite..." : "Trimite răspuns"}
                </button>
                <button type="button" onClick={() => setShowComposer(false)} style={ghostPill}>Ascunde</button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
 
function ManagerDemo({ restaurantName }: { restaurantName: string }) {
  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [liveAlert, setLiveAlert] = useState(false);
  const scans = useMemo(() => buildDemoScans(), []);
 
  useEffect(() => {
    const arrive = setTimeout(() => {
      setComplaints((cs) => [
        { ...LIVE_COMPLAINT_TEMPLATE, id: `live-${Date.now()}`, created_at: new Date().toISOString() },
        ...cs,
      ]);
      setLiveAlert(true);
      const hide = setTimeout(() => setLiveAlert(false), 4200);
      return () => clearTimeout(hide);
    }, 5000);
    return () => clearTimeout(arrive);
  }, []);
 
  const setStatus = (id: string, status: ComplaintStatus) =>
    setComplaints((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
 
  const totalScans = scans.length;
  const positiveScans = scans.filter((s) => s.choice === "positive").length;
  const negativeScans = scans.filter((s) => s.choice === "negative").length;
  const newComplaints = complaints.filter((c) => c.status === "new").length;
  const decided = positiveScans + negativeScans;
  const satisfactionRate = decided > 0 ? Math.round((positiveScans / decided) * 100) : 0;
 
  const now = Date.now();
  const last7 = scans.filter((s) => now - new Date(s.created_at).getTime() < 7 * dayMs).length;
  const prev7 = scans.filter((s) => {
    const age = now - new Date(s.created_at).getTime();
    return age >= 7 * dayMs && age < 14 * dayMs;
  }).length;
  const trend = prev7 > 0 ? { pct: Math.round(Math.abs(((last7 - prev7) / prev7) * 100)), up: last7 >= prev7 } : null;
 
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved").length;
  const visibleComplaints = complaints.filter((c) => c.status !== "resolved");
 
  const hourlyData = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, positive: 0, negative: 0, total: 0 }));
    for (const s of scans) {
      const b = buckets[new Date(s.created_at).getHours()];
      if (!b) continue;
      b.total += 1;
      if (s.choice === "positive") b.positive += 1;
      if (s.choice === "negative") b.negative += 1;
    }
    return buckets.map((b) => ({ ...b, label: `${pad(b.hour)}:00` }));
  }, [scans]);
 
  const peakHour = useMemo(() => hourlyData.reduce((m, b) => (b.total > m.total ? b : m), hourlyData[0]!), [hourlyData]);
 
  const timeSeriesData = useMemo(() => {
    const buckets = emptyBuckets(granularity, WINDOW_SIZE[granularity]);
    const map = new Map(buckets.map((b) => [b.key, { ...b, positive: 0, negative: 0, total: 0 }]));
    for (const s of scans) {
      const { key } = bucketKeyAndLabel(new Date(s.created_at), granularity);
      const bucket = map.get(key);
      if (!bucket) continue;
      bucket.total += 1;
      if (s.choice === "positive") bucket.positive += 1;
      if (s.choice === "negative") bucket.negative += 1;
    }
    return Array.from(map.values());
  }, [scans, granularity]);
 
  const exportCsv = () => {
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const header = ["Data", "Status", "Mesaj", "Nume contact", "Telefon", "Email"];
    const rows = complaints.map((c) => [
      new Date(c.created_at).toLocaleString("ro-RO"),
      STATUS_LABEL[c.status],
      c.message,
      c.contact_name ?? "",
      c.contact_phone ?? "",
      c.contact_email ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((cell) => esc(String(cell))).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reclamatii-demo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
 
  return (
    <div style={{ position: "relative", background: `radial-gradient(ellipse at 50% 0%, #18140F 0%, ${C.bg} 65%)`, border: `1px solid ${C.border}`, borderRadius: 22, padding: "26px 18px", fontFamily: sans }}>
      {liveAlert && (
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            background: "rgba(198,161,91,.16)",
            border: `1px solid ${C.gold}`,
            color: C.goldLight,
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 12.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "sv-fadeUp .4s cubic-bezier(.16,1,.3,1) both",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, boxShadow: `0 0 6px ${C.gold}` }} />
          Reclamație nouă tocmai a sosit
        </div>
      )}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: serif, color: C.text, fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: "0.01em" }}>{restaurantName}</h3>
          <button type="button" style={{ ...ghostPill, padding: "7px 14px", fontSize: 12.5 }}>Delogare</button>
        </div>
 
        {/* satisfacție */}
        <section style={{ ...adminCard, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 15% 30%, rgba(198,161,91,0.08), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ color: C.muted, fontSize: 12.5, marginBottom: 4 }}>Rată satisfacție</div>
            <div className="sv-shimmer" style={{ fontFamily: serif, fontSize: 40, fontWeight: 700 }}>
              <Counter to={satisfactionRate} suffix="%" />
            </div>
          </div>
          {trend && (
            <div style={{ textAlign: "right", position: "relative" }}>
              <div style={{ color: trend.up ? C.green : C.amber, fontSize: 15, fontWeight: 600 }}>
                {trend.up ? "↑" : "↓"} {trend.pct}%
              </div>
              <div style={{ color: "#6E6759", fontSize: 11.5 }}>scanări față de săptămâna trecută</div>
            </div>
          )}
        </section>
 
        {/* stat cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Scanări totale", value: totalScans, color: "#7FA0C4", pulse: false },
            { label: "Recenzii Google direcționate", value: positiveScans, color: C.green, pulse: false },
            { label: "Experiențe negative", value: negativeScans, color: C.amber, pulse: false },
            { label: "Reclamații necitite", value: newComplaints, color: C.gold, pulse: newComplaints > 0 },
          ].map((s) => (
            <div key={s.label} className="sv-lift" style={{ ...adminCard, padding: 18, borderLeft: `2px solid ${s.color}55` }}>
              <div style={{ color: s.color, fontSize: 26, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                <Counter to={s.value} />
                {s.pulse && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}`, animation: "sv-corner 1.6s ease-in-out infinite" }} />}
              </div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </section>
 
        {/* ore de vârf */}
        <section style={{ ...adminCard, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
            <h4 style={{ ...adminTitle, marginBottom: 0 }}>Ore de vârf</h4>
            {peakHour && peakHour.total > 0 && (
              <span style={{ color: C.gold, fontSize: 12.5 }}>
                Cel mai activ interval: {peakHour.label}–{pad((peakHour.hour + 1) % 24)}:00
              </span>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 8, marginBottom: 16 }}>
            Scanări pe oră din zi, în total (toate datele disponibile).
          </p>
          <StackedBars data={hourlyData} height={170} labelEvery={3} />
        </section>
 
        {/* scanări în timp */}
        <section style={{ ...adminCard, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h4 style={{ ...adminTitle, marginBottom: 0 }}>Scanări în timp</h4>
            <div style={{ display: "flex", gap: 6 }}>
              {(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  style={{
                    fontSize: 12,
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: g === granularity ? C.gold : "transparent",
                    color: g === granularity ? "#100F0D" : C.muted,
                    cursor: "pointer",
                    fontFamily: sans,
                    fontWeight: g === granularity ? 600 : 400,
                  }}
                >
                  {GRANULARITY_LABEL[g]}
                </button>
              ))}
            </div>
          </div>
 
          <StackedBars data={timeSeriesData} height={190} labelEvery={granularity === "day" ? 4 : 1} />
 
          <div style={{ overflowX: "auto", marginTop: 16, maxHeight: 220 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Perioadă", "Total", "Pozitive", "Negative", "% pozitive"].map((h) => (
                    <th key={h} style={{ textAlign: "left", color: C.muted, fontWeight: 500, padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...timeSeriesData].reverse().slice(0, 8).map((row) => (
                  <tr key={row.key}>
                    <td style={tdStyle}>{row.label}</td>
                    <td style={tdStyle}>{row.total}</td>
                    <td style={{ ...tdStyle, color: C.green }}>{row.positive}</td>
                    <td style={{ ...tdStyle, color: C.amber }}>{row.negative}</td>
                    <td style={tdStyle}>{row.total > 0 ? Math.round((row.positive / row.total) * 100) + "%" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
 
        {/* setări */}
        <section style={{ ...adminCard, marginBottom: 20 }}>
          <h4 style={adminTitle}>Setări</h4>
          <p style={{ color: C.muted, fontSize: 12.5, marginBottom: 8 }}>Link Google Reviews</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input className="sv-input" defaultValue="https://g.page/r/…/review" style={{ flex: "1 1 220px", fontSize: 13 }} />
            <button type="button" style={smallPill}>Salvează</button>
          </div>
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 16, marginBottom: 4 }}>Email de alertă reclamații</p>
          <p style={{ color: "#C9C2B4", fontSize: 13.5, margin: 0 }}>
            manager@restaurantultau.ro <span style={{ color: "#6E6759" }}>— contactează-ne pentru schimbare</span>
          </p>
        </section>
 
        {/* teme recurente */}
        <section style={{ ...adminCard, marginBottom: 20 }}>
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontFamily: serif, color: C.text, fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>Teme recurente</h4>
            <p style={{ color: C.muted, fontSize: 12.5, margin: 0 }}>
              Calculat automat pe {new Date(Date.now() - 2 * dayMs).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}, din ultimele 30 de zile — actualizat săptămânal.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {SEED_THEMES.map((t) => (
              <ThemeRow key={t.theme} row={t} />
            ))}
          </div>
        </section>
 
        {/* reclamații */}
        <section style={adminCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <h4 style={{ ...adminTitle, marginBottom: 0 }}>
              Reclamații ({visibleComplaints.length})
              {resolvedComplaints > 0 && (
                <span style={{ color: C.muted, fontSize: 12.5, fontWeight: 400 }}> · {resolvedComplaints} rezolvate, ascunse din listă</span>
              )}
            </h4>
            <button type="button" onClick={exportCsv} style={ghostPill}>Export CSV</button>
          </div>
          {visibleComplaints.length === 0 ? (
            <div>
              <p style={{ color: C.muted, fontSize: 14 }}>Toate reclamațiile sunt rezolvate — bravo.</p>
              <button className="sv-btn sv-btn-ghost sv-btn-sm" onClick={() => setComplaints(SEED_COMPLAINTS)}>Reia demo-ul</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleComplaints.map((c) => (
                <ComplaintCard key={c.id} complaint={c} onStatus={setStatus} highlight={c.id.startsWith("live-")} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
 
const tdStyle: React.CSSProperties = {
  padding: "6px 8px",
  color: C.text,
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
/* ------------------------------------------------------------------ */
/* Pagina                                                              */
/* ------------------------------------------------------------------ */
 
export default function ScanVogueLanding() {
  useReveal();
 
  const [restaurantName, setRestaurantName] = useState("Numele restaurantului tău");
  const [tab, setTab] = useState<"client" | "manager">("client");
  const [scrollY, setScrollY] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
 
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMove = (e: MouseEvent) =>
      setPointer({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
 
  const displayName = restaurantName.trim() || "Numele restaurantului tău";
 
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
 
 
  return (
    <div className="sv-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
 
      {/* ---------------- NAV ---------------- */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: "blur(14px)",
          background: scrollY > 40 ? "rgba(11,10,8,.82)" : "transparent",
          borderBottom: `1px solid ${scrollY > 40 ? C.border2 : "transparent"}`,
          transition: "background .4s ease, border-color .4s ease",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: serif, fontSize: 21, letterSpacing: ".16em", fontWeight: 600 }}>
            SCAN<span style={{ color: C.gold }}>VOGUE</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a className="sv-link sv-hide-sm" href="#dovezi">Dovezi</a>
            <a className="sv-link sv-hide-sm" href="#demo">Demo</a>
            <a className="sv-link sv-hide-sm" href="#pret">Preț</a>
            <button type="button" className="sv-btn sv-btn-primary sv-btn-sm" onClick={openContact}>
              <Ic.mail size={15} /> Contactează-ne
            </button>
          </nav>
        </div>
      </header>
 
      {/* ---------------- HERO ---------------- */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "130px 22px 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "-18%",
              left: "-8%",
              width: 620,
              height: 620,
              borderRadius: "50%",
              filter: "blur(30px)",
              background: "radial-gradient(circle, rgba(198,161,91,.16) 0%, transparent 68%)",
              transform: `translate3d(${pointer.x * 26}px, ${pointer.y * 22 - scrollY * 0.12}px, 0)`,
              transition: "transform .6s cubic-bezier(.16,1,.3,1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-24%",
              right: "-12%",
              width: 700,
              height: 700,
              borderRadius: "50%",
              filter: "blur(34px)",
              background: "radial-gradient(circle, rgba(150,100,50,.16) 0%, transparent 68%)",
              transform: `translate3d(${pointer.x * -30}px, ${pointer.y * -20 - scrollY * 0.06}px, 0)`,
              transition: "transform .6s cubic-bezier(.16,1,.3,1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(${C.border2} 1px, transparent 1px), linear-gradient(90deg, ${C.border2} 1px, transparent 1px)`,
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(70% 60% at 50% 40%, #000 0%, transparent 100%)",
              opacity: 0.55,
              transform: `translateY(${scrollY * 0.08}px)`,
            }}
          />
        </div>
 
        <div className="sv-split" style={{ maxWidth: 1140, margin: "0 auto", position: "relative", width: "100%" }}>
          <div>
            <div style={{ animation: "sv-fadeUp .7s cubic-bezier(.16,1,.3,1) .05s both" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 999, padding: "7px 14px", fontSize: 11.5, color: C.muted }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: "sv-pulse 2.4s infinite" }} />
                Un QR pe masă. Restul se întâmplă singur.
              </span>
            </div>
            <h1
              style={{
                fontFamily: serif,
                fontWeight: 600,
                fontSize: "clamp(42px, 6.6vw, 78px)",
                lineHeight: 1.02,
                letterSpacing: "-.02em",
                margin: "22px 0 0",
                animation: "sv-fadeUp .8s cubic-bezier(.16,1,.3,1) .15s both",
              }}
            >
              Recenziile bune ajung pe Google.
              <br />
              <span className="sv-shimmer">Cele proaste ajung la tine.</span>
            </h1>
            <p className="sv-lead" style={{ animation: "sv-fadeUp .8s cubic-bezier(.16,1,.3,1) .28s both" }}>
              ScanVogue transformă fiecare masă într-un canal de feedback. Clientul scanează, alege singur dacă scrie
              public sau privat, iar tu primești pe email reclamația rezumată de AI, cu un draft de răspuns gata scris —
              înainte să ajungă pe Google.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30, animation: "sv-fadeUp .8s cubic-bezier(.16,1,.3,1) .4s both" }}>
              <a className="sv-btn sv-btn-primary" href="#demo">
                Încearcă demo-ul live <Ic.arrow />
              </a>
              <button type="button" className="sv-btn sv-btn-ghost" onClick={openContact}>
                <Ic.mail /> Contactează-ne
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 26, marginTop: 38, animation: "sv-fadeUp .8s cubic-bezier(.16,1,.3,1) .5s both" }}>
              {[
                { v: <><Counter to={9} suffix="%" /></>, l: "creștere de încasări la +1 stea (Harvard)" },
                { v: <><Counter to={26} /></>, l: "clienți tac pentru fiecare unul care reclamă (TARP)" },
                { v: <><Counter to={30} suffix="s" /></>, l: "de la scanare la alertă pe email" },
              ].map((s, i) => (
                <div key={i} style={{ minWidth: 130 }}>
                  <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: C.gold }}>{s.v}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, marginTop: 2, maxWidth: 200 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
 
          <div style={{ display: "flex", justifyContent: "center", animation: "sv-fadeUp 1s cubic-bezier(.16,1,.3,1) .35s both" }}>
            <div
              style={{
                transform: `perspective(1200px) rotateY(${pointer.x * -5}deg) rotateX(${pointer.y * 4}deg) translateY(${scrollY * -0.03}px)`,
                transition: "transform .5s cubic-bezier(.16,1,.3,1)",
                position: "relative",
              }}
            >
              <Corners inset={-10}>
                <div
                  style={{
                    width: 360,
                    maxWidth: "100%",
                    borderRadius: 28,
                    overflow: "hidden",
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 50px 90px -40px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,.06)",
                  }}
                >
                  <img
                    src="/plate-scanvogue.jpg"
                    alt={`Plăcuța ScanVogue pentru ${displayName}`}
                    style={{ display: "block", width: "100%", height: "auto" }}
                  />
                </div>
              </Corners>
            </div>
          </div>
        </div>
      </section>
 
      {/* ---------------- MARQUEE ---------------- */}
      <div className="sv-marquee" style={{ overflow: "hidden", borderTop: `1px solid ${C.border2}`, borderBottom: `1px solid ${C.border2}`, padding: "14px 0", background: "rgba(255,255,255,.015)" }}>
        <div className="sv-marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: "flex", gap: 44, paddingRight: 44 }}>
              {[
                "+1 stea pe Yelp = +5–9% încasări · Harvard Business School",
                "76% dintre consumatori citesc recenzii înainte să aleagă un local · BrightLocal 2024",
                "Recenziile cântăresc ~16% în clasamentul Google Local Pack · Whitespark",
                "Produsele cu recenzii convertesc cu până la 270% mai bine · Spiegel Research Center",
                "5% retenție în plus = 25–95% profit în plus · Bain & Company",
              ].map((t) => (
                <span key={t} style={{ fontSize: 12.5, color: C.muted, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold }} />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
 
      {/* ---------------- DOVEZI ---------------- */}
      <Section id="dovezi">
        <div className="sv-reveal" style={{ maxWidth: 720 }}>
          <span className="sv-eyebrow">Nu e o părere. E cercetare.</span>
          <h2 className="sv-h2">Reputația online se măsoară direct în încasări</h2>
          <p className="sv-lead">
            Fiecare cifră de mai jos vine dintr-un studiu public, nu dintr-o broșură de vânzări. Le poți verifica una
            câte una.
          </p>
        </div>
 
        <div className="sv-grid-3" style={{ marginTop: 44 }}>
          {[
            {
              big: <><Counter to={9} suffix="%" /></>,
              t: "creștere de încasări",
              d: "Michael Luca, Harvard Business School — o stea în plus pe Yelp aduce restaurantelor independente între 5% și 9% venituri suplimentare.",
              src: "„Reviews, Reputation, and Revenue: The Case of Yelp.com”, HBS Working Paper 12-016",
            },
            {
              big: <><Counter to={76} suffix="%" /></>,
              t: "citesc recenzii",
              d: "Trei sferturi dintre consumatori citesc regulat recenziile afacerilor locale înainte să decidă unde merg — iar restaurantele sunt categoria cea mai verificată.",
              src: "BrightLocal, Local Consumer Review Survey 2024",
            },
            {
              big: <><Counter to={16} suffix="%" /></>,
              t: "din clasamentul local",
              d: "Semnalele de recenzii (număr, prospețime, notă) sunt unul dintre cei mai grei factori pentru poziția în Google Local Pack — locul unde te caută lumea flămândă.",
              src: "Whitespark, Local Search Ranking Factors",
            },
            {
              big: <><Counter to={26} /></>,
              t: "clienți tac",
              d: "Pentru fiecare client care reclamă, alți 26 pleacă fără să spună un cuvânt. ScanVogue le dă acelor 26 un loc unde să vorbească — privat, la tine.",
              src: "Cercetare TARP / Lee Resources, citată pe larg în literatura de customer service",
            },
            {
              big: <><Counter to={4.7} decimals={1} /></>,
              t: "nota ideală",
              d: "Încrederea crește până la 4,2–4,7 stele și scade după: un profil perfect de 5,0 pare fabricat. Câteva recenzii critice, gestionate elegant, vând mai bine decât perfecțiunea.",
              src: "Spiegel Research Center, Northwestern University",
            },
            {
              big: <><Counter to={33} suffix="%" /></>,
              t: "revin după un răspuns",
              d: "O treime dintre clienții care primesc un răspuns rapid la o plângere își schimbă recenzia negativă sau revin. Viteza contează mai mult decât cadoul.",
              src: "Harvard Business Review — „Responding to Customer Reviews Yields Better Ratings”",
            },
          ].map((s) => (
            <div key={s.t} className="sv-card sv-lift sv-reveal" style={{ padding: 22 }}>
              <div style={{ fontFamily: serif, fontSize: 46, fontWeight: 600, color: C.gold, lineHeight: 1 }}>{s.big}</div>
              <div style={{ fontSize: 12.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.text, marginTop: 8 }}>{s.t}</div>
              <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, margin: "12px 0 0" }}>{s.d}</p>
              <p style={{ fontSize: 11, color: "#6E6759", lineHeight: 1.6, margin: "12px 0 0", borderTop: `1px solid ${C.border2}`, paddingTop: 10 }}>Sursă: {s.src}</p>
            </div>
          ))}
        </div>
      </Section>
 
      {/* ---------------- CUM FUNCȚIONEAZĂ ---------------- */}
      <Section style={{ background: `linear-gradient(180deg, transparent, ${C.bg2} 30%, transparent)` }}>
        <div className="sv-reveal" style={{ maxWidth: 720 }}>
          <span className="sv-eyebrow">Fluxul complet</span>
          <h2 className="sv-h2">Patru pași. Zero muncă în plus pentru echipă.</h2>
        </div>
        <div className="sv-grid-2" style={{ marginTop: 44 }}>
          {[
            { i: <Ic.qr size={22} />, n: "01", t: "Clientul scanează QR-ul de pe masă", d: "Nicio aplicație, niciun cont. Se deschide o pagină cu numele și identitatea vizuală ale localului tău, în 1,2 secunde." },
            { i: <Ic.shield size={22} />, n: "02", t: "Alege singur: public sau privat", d: "Cele două opțiuni au aceeași greutate vizuală — respectăm strict politica Google împotriva filtrării recenziilor (review gating). Nu riști penalizarea profilului." },
            { i: <Ic.spark size={22} />, n: "03", t: "AI-ul rezumă și scrie răspunsul", d: "Reclamația privată ajunge la tine pe email în ~30 de secunde: rezumat în două rânduri, semnalizare dacă e sensibilă (igienă, discriminare, siguranță) și un draft de răspuns pe care doar îl copiezi." },
            { i: <Ic.chart size={22} />, n: "04", t: "Tiparele ies la suprafață", d: "Săptămânal, sistemul grupează reclamațiile în teme recurente cu tipar orar („vineri, 20:00–21:30”) și îți arată dacă remediul aplicat a funcționat. Lunar primești raportul complet." },
          ].map((s) => (
            <div key={s.n} className="sv-card sv-lift sv-reveal" style={{ padding: 24, display: "flex", gap: 16 }}>
              <div style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 14, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(198,161,91,.06)" }}>{s.i}</div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: ".22em", color: C.gold }}>{s.n}</div>
                <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: "6px 0 0" }}>{s.t}</h3>
                <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, margin: "8px 0 0" }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
 
      {/* ---------------- DEMO ---------------- */}
      <Section id="demo">
        <div className="sv-reveal" style={{ maxWidth: 760 }}>
          <span className="sv-eyebrow">Demo funcțional — apasă pe orice</span>
          <h2 className="sv-h2">Vezi exact ce vede clientul și ce vezi tu</h2>
          <p className="sv-lead">
            Ambele demo-uri de mai jos sunt reale și interactive: trimite o reclamație, deschide-o în panou, copiază
            răspunsul AI, marchează-o rezolvată. Scrie numele localului tău și tot demo-ul se personalizează instant.
          </p>
        </div>
 
        <div className="sv-reveal" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 28 }}>
          <label style={{ fontSize: 12, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>Numele localului</label>
          <input
            className="sv-input"
            style={{ maxWidth: 320 }}
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value.slice(0, 40))}
            placeholder="Numele restaurantului tău"
            aria-label="Numele restaurantului tău"
          />
        </div>
 
        <div className="sv-reveal" style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <button className={`sv-tab ${tab === "client" ? "sv-tab-on" : ""}`} onClick={() => setTab("client")}>Pagina clientului</button>
          <button className={`sv-tab ${tab === "manager" ? "sv-tab-on" : ""}`} onClick={() => setTab("manager")}>Panoul de manager</button>
        </div>
 
        <div className="sv-reveal" style={{ marginTop: 26 }}>
          {tab === "client" ? (
            <div className="sv-split" style={{ alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, margin: 0 }}>Ce vede clientul</h3>
                <p className="sv-lead" style={{ fontSize: 15 }}>
                  O singură pagină, elegantă, cu numele tău în față. Fără formulare lungi, fără login. Alege una dintre
                  cele două căi — și în ambele cazuri tu câștigi: fie o recenzie publică, fie o problemă pe care o afli
                  primul.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    "Se încarcă instant, chiar și pe 3G",
                    "Conform politicii Google — fără review gating",
                    "Mesajul privat nu apare public niciodată",
                    "Datele de contact sunt opționale (GDPR-friendly)",
                  ].map((t) => (
                    <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: C.muted }}>
                      <span style={{ color: C.gold, marginTop: 1 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ClientDemo restaurantName={displayName} />
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, margin: "0 0 6px" }}>Ce vezi tu, dimineața, cu cafeaua</h3>
              <p className="sv-lead" style={{ fontSize: 15, marginBottom: 24 }}>
                Un singur ecran: câți au scanat, cât de mulțumiți sunt, ce reclamații au apărut, ce se repetă și ce
                trebuie să răspunzi. Apasă pe o reclamație ca să vezi rezumatul AI și draftul de răspuns.
              </p>
              <ManagerDemo restaurantName={displayName} />
            </div>
          )}
        </div>
      </Section>
 
      {/* ---------------- BENEFICII ---------------- */}
      <Section style={{ background: `linear-gradient(180deg, transparent, ${C.bg2} 40%, transparent)` }}>
        <div className="sv-grid-3">
          {[
            { t: "Prinzi problema în seara în care s-a întâmplat", d: "Nu peste trei zile, într-o recenzie de o stea citită de 400 de oameni. Alerta ajunge pe email în ~30 de secunde." },
            { t: "Nu mai scrii răspunsuri de la zero", d: "AI-ul îți dă un draft calm, specific și fără clișee corporate. Îl citești, îl ajustezi în 20 de secunde, îl trimiți." },
            { t: "Vezi tipare, nu incidente izolate", d: "„Zgomot după 22:00 — de 6 ori luna asta” e o decizie de business. O reclamație singură e doar o seară proastă." },
            { t: "Rapoarte lunare fără să le ceri", d: "Un email pe lună cu evoluția scanărilor, satisfacției și temelor — bun de trimis mai departe către asociați sau proprietar." },
            { t: "Export CSV oricând", d: "Toate reclamațiile, cu status și dată, într-un fișier. Al tău, nu al nostru." },
            { t: "Instalare în aceeași zi", d: "Îți trimitem QR-urile gata proiectate pentru mese și un panou de manager cu contul tău. Nu ai nimic de configurat." },
          ].map((b) => (
            <div key={b.t} className="sv-card sv-lift sv-reveal" style={{ padding: 22 }}>
              <h3 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, margin: 0, lineHeight: 1.25 }}>{b.t}</h3>
              <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, margin: "10px 0 0" }}>{b.d}</p>
            </div>
          ))}
        </div>
      </Section>
 
      {/* ---------------- PREȚ / CTA ---------------- */}
      <Section id="pret">
        <div className="sv-reveal" style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
          <span className="sv-eyebrow">Începe astăzi</span>
          <h2 className="sv-h2">Un abonament costă mai puțin decât o masă anulată</h2>
          <p className="sv-lead" style={{ margin: "16px auto 0" }}>
            Dacă studiul Harvard are dreptate și ajungi la o stea în plus, sistemul se plătește singur din prima
            săptămână. Dacă nu, îl oprești oricând.
          </p>
        </div>
 
        <div className="sv-reveal" style={{ maxWidth: 560, margin: "44px auto 0" }}>
          <Corners inset={-10}>
            <div className="sv-card" style={{ padding: 34, textAlign: "center", background: "linear-gradient(160deg, rgba(198,161,91,.07), rgba(22,19,15,.85))" }}>
              <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: C.gold }}>Pachet complet</div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, marginTop: 14 }}>
                <span style={{ fontFamily: serif, fontSize: 62, fontWeight: 600, lineHeight: 1 }}>
                  <Counter to={200} />
                </span>
                <span style={{ fontSize: 15, color: C.muted, paddingBottom: 10 }}>lei / lună</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>fără contract pe termen lung · prima lună de probă</div>
 
              <div style={{ borderTop: `1px solid ${C.border2}`, margin: "24px 0", paddingTop: 22, textAlign: "left", display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  "Pagină de scanare personalizată cu brandul tău",
                  "QR-uri gata de tipar pentru toate mesele",
                  "Alerte pe email cu rezumat AI și draft de răspuns",
                  "Panou de manager cu analize și teme recurente",
                  "Raport lunar automat + export CSV",
                  "Suport direct, om real, pe email",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, fontSize: 13.5, color: C.muted }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M4 12.5l5 5L20 6.5" /></svg>
                    {f}
                  </div>
                ))}
              </div>
 
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="button" className="sv-btn sv-btn-primary" onClick={openContact} style={{ minWidth: 220 }}>
                  <Ic.mail /> Contactează-ne
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: "#6E6759", margin: "16px 0 0" }}>
                Butonul deschide un formular scurt — mesajul ajunge direct pe{" "}
                <a href={`mailto:${SALES_EMAIL}`} style={{ color: C.gold, textDecoration: "none" }}>{SALES_EMAIL}</a>.
              </p>
            </div>
          </Corners>
        </div>
      </Section>
 
      {/* ---------------- FAQ ---------------- */}
      <Section>
        <div className="sv-reveal" style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 className="sv-h2" style={{ textAlign: "center" }}>Întrebări firești</h2>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { q: "Nu e asta „filtrare de recenzii”? Google nu penalizează?", a: "Nu. Review gating înseamnă să arăți calea către Google doar clienților mulțumiți. La noi ambele opțiuni apar simultan, cu exact aceeași greutate vizuală, pentru toată lumea. Clientul decide, nu algoritmul tău." },
              { q: "Ce se întâmplă dacă cineva scrie ceva grav?", a: "AI-ul marchează mesajele sensibile (igienă, siguranță alimentară, comportament discriminatoriu) și le pune în capul listei, cu semnalizare distinctă în alerta pe email. Le vezi primele, nu îngropate." },
              { q: "Cât durează instalarea?", a: "O zi. Ne trimiți numele, sigla și linkul profilului Google, iar noi îți dăm pagina, QR-urile pentru mese și accesul la panou. Personalul nu trebuie să învețe nimic." },
              { q: "Datele clienților sunt în siguranță?", a: "Contactul e opțional, se stochează criptat, nu se vinde și nu se folosește pentru marketing. Poți exporta sau șterge tot, oricând." },
              { q: "Merge și pentru cafenele, baruri, hoteluri?", a: "Da. Orice loc unde oamenii stau la o masă sau la o recepție și au o părere. Scrie-ne ce tip de local ai și îți spunem exact cum îl configurăm." },
            ].map((f) => (
              <details key={f.q} className="sv-card sv-reveal" style={{ padding: "16px 18px", cursor: "pointer" }}>
                <summary style={{ listStyle: "none", fontSize: 15, fontWeight: 600, display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
                  {f.q}
                  <span style={{ color: C.gold, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.75, margin: "12px 0 0" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>
 
      {/* ---------------- FINAL CTA ---------------- */}
      <Section style={{ paddingTop: 0 }}>
        <div className="sv-reveal" style={{ position: "relative", overflow: "hidden", borderRadius: 26, border: `1px solid ${C.border}`, padding: "clamp(40px, 6vw, 74px) 26px", textAlign: "center", background: "radial-gradient(120% 140% at 50% 0%, rgba(198,161,91,.12), rgba(16,14,11,.9) 62%)" }}>
          <div style={{ position: "absolute", top: "-40%", left: "50%", width: 700, height: 700, marginLeft: -350, borderRadius: "50%", filter: "blur(40px)", background: "radial-gradient(circle, rgba(198,161,91,.14), transparent 65%)", animation: "sv-float1 12s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 className="sv-h2" style={{ margin: 0 }}>
              Următoarea recenzie de o stea
              <br />
              poate fi doar un email către tine.
            </h2>
            <p className="sv-lead" style={{ margin: "16px auto 0", textAlign: "center" }}>
              Pornim {displayName} în 24 de ore. Scrie-ne și îți trimitem QR-urile.
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
              <button type="button" className="sv-btn sv-btn-primary" onClick={openContact}><Ic.mail /> Contactează-ne</button>
            </div>
          </div>
        </div>
      </Section>
 
      {/* ---------------- FOOTER ---------------- */}
      <footer style={{ borderTop: `1px solid ${C.border2}`, padding: "30px 22px 46px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 17, letterSpacing: ".16em" }}>SCAN<span style={{ color: C.gold }}>VOGUE</span></div>
          <div style={{ fontSize: 12, color: "#6E6759" }}>© {new Date().getFullYear()} ScanVogue · Platformă de management al recenziilor</div>
          <a className="sv-link" href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>
        </div>
      </footer>
 
      <ContactModal
        open={contactOpen}
        onClose={closeContact}
        restaurantName={displayName}
      />
    </div>
  );
}
