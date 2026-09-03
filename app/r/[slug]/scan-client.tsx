"use client";

import React, { useState } from "react";
import { Star, Send, ArrowUpRight, Loader2, MessageCircle } from "lucide-react";

const COLORS = {
  bg: "#0B0A08",
  bgRadial: "#18140F",
  card: "rgba(22,19,15,0.78)",
  cardBorder: "rgba(198,161,91,0.16)",
  gold: "#C6A15B",
  goldLight: "#E8D2A0",
  goldDeep: "#8A6B38",
  textPrimary: "#F5F0E6",
  textMuted: "#9C9382",
  inputBg: "rgba(255,255,255,0.035)",
  inputBorder: "rgba(255,255,255,0.09)",
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap');

@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bokehFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-30px) scale(1.08); } }
@keyframes bokehFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,20px) scale(1.05); } }
@keyframes bokehFloat3 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.5; } 50% { transform: translate(15px,15px) scale(1.12); opacity:0.75; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes drawCircle { from { stroke-dashoffset: 126; } to { stroke-dashoffset: 0; } }
@keyframes drawCheck { from { stroke-dashoffset: 36; } to { stroke-dashoffset: 0; } }
@keyframes cornerGlow { 0%,100% { opacity:0.5; } 50% { opacity:1; } }

.onyx-fade-1 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
.onyx-fade-2 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
.onyx-fade-3 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
.onyx-fade-4 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.35s both; }

.onyx-btn { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease; }
.onyx-btn:active { transform: scale(0.97); }
.onyx-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px -8px rgba(198,161,91,0.55); }
.onyx-btn-secondary:hover { border-color: rgba(198,161,91,0.55) !important; background: rgba(198,161,91,0.05) !important; }

.onyx-input { transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
.onyx-input:focus { outline: none; border-color: ${COLORS.gold} !important; box-shadow: 0 0 0 3px rgba(198,161,91,0.15); background: rgba(255,255,255,0.05) !important; }

.onyx-link { transition: color 0.2s ease; }
.onyx-link:hover { color: ${COLORS.gold} !important; }

.onyx-corner { animation: cornerGlow 3.5s ease-in-out infinite; }

/* Centrare corecta pe mobil, inclusiv telefoane Samsung mai vechi (fara suport
   pentru "dvh") si iPhone-uri mari (cu notch/safe-area). 100vh e scris primul
   ca fallback -- browserele care nu inteleg "dvh" il ignora si raman cu 100vh,
   in loc sa ramana fara nicio inaltime minima (ceea ce rupea centrarea). */
.onyx-viewport {
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px;
  padding-top: max(24px, env(safe-area-inset-top));
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  padding-left: max(24px, env(safe-area-inset-left));
  padding-right: max(24px, env(safe-area-inset-right));
}
`;

type Restaurant = {
  id: string;
  name: string;
  subtitle: string | null;
  logoUrl: string | null;
  googleReviewUrl: string;
};

async function updateScan(scanId: string | null, body: Record<string, unknown>) {
  if (!scanId) return;
  try {
    await fetch("/api/scan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scanId, ...body }),
    });
  } catch (err) {
    console.error("Nu am putut actualiza scanarea:", err);
  }
}

function Bokeh() {
  const spots = [
    { top: "-8%", left: "-10%", size: 260, color: "rgba(198,161,91,0.16)", anim: "bokehFloat1 9s ease-in-out infinite" },
    { bottom: "-12%", right: "-8%", size: 300, color: "rgba(150,100,50,0.14)", anim: "bokehFloat2 11s ease-in-out infinite" },
    { top: "35%", right: "-15%", size: 200, color: "rgba(198,161,91,0.1)", anim: "bokehFloat3 8s ease-in-out infinite" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {spots.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
            filter: "blur(20px)",
            animation: s.anim,
          }}
        />
      ))}
    </div>
  );
}

function CornerFrame({ children }: { children: React.ReactNode }) {
  const cornerStyle = { position: "absolute" as const, width: 22, height: 22, borderColor: COLORS.gold };
  return (
    <div style={{ position: "relative" }}>
      <span className="onyx-corner" style={{ ...cornerStyle, top: -9, left: -9, borderTop: `1px solid ${COLORS.gold}`, borderLeft: `1px solid ${COLORS.gold}`, borderTopLeftRadius: 4 }} />
      <span className="onyx-corner" style={{ ...cornerStyle, top: -9, right: -9, borderTop: `1px solid ${COLORS.gold}`, borderRight: `1px solid ${COLORS.gold}`, borderTopRightRadius: 4, animationDelay: "0.4s" }} />
      <span className="onyx-corner" style={{ ...cornerStyle, bottom: -9, left: -9, borderBottom: `1px solid ${COLORS.gold}`, borderLeft: `1px solid ${COLORS.gold}`, borderBottomLeftRadius: 4, animationDelay: "0.8s" }} />
      <span className="onyx-corner" style={{ ...cornerStyle, bottom: -9, right: -9, borderBottom: `1px solid ${COLORS.gold}`, borderRight: `1px solid ${COLORS.gold}`, borderBottomRightRadius: 4, animationDelay: "1.2s" }} />
      {children}
    </div>
  );
}

function Wordmark({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="onyx-fade-1" style={{ textAlign: "center", marginBottom: 34 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, letterSpacing: "0.14em", color: COLORS.textPrimary, fontWeight: 600 }}>
        {restaurant.name}
      </div>
      {restaurant.subtitle && (
        <div style={{ fontSize: 10.5, letterSpacing: "0.28em", color: COLORS.textMuted, marginTop: 6, textTransform: "uppercase" }}>
          {restaurant.subtitle}
        </div>
      )}
    </div>
  );
}

function PrimaryButton({ onClick, children, icon }: { onClick?: () => void; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="onyx-btn onyx-btn-primary"
      style={{
        width: "100%",
        background: `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold} 60%, ${COLORS.goldDeep})`,
        color: "#100F0D",
        fontWeight: 600,
        fontSize: 15,
        borderRadius: 14,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        border: "none",
        cursor: "pointer",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="onyx-btn onyx-btn-secondary"
      style={{
        width: "100%",
        background: "transparent",
        color: "#C9C2B4",
        fontSize: 15,
        borderRadius: 14,
        padding: "16px 20px",
        border: "1px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// Folosit pentru cele doua optiuni de pe ecranul initial (Google / mesaj privat).
// Design deliberat: ACEEASI greutate vizuala pentru amandoua -- nici o varianta
// nu arata mai "principala" decat cealalta. Politica Google interzice explicit
// filtrarea clientilor dupa cat de multumiti sunt (a arata Google doar celor
// multumiti, sau a face vizibil mai atragatoare calea privata) -- vezi
// "review gating" in politica lor de continut. Ambele optiuni trebuie sa fie
// la fel de usor de ales, pentru oricine, indiferent de experienta avuta.
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
      onClick={onClick}
      className="onyx-btn onyx-btn-secondary"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background: "rgba(198,161,91,0.07)",
        color: COLORS.textPrimary,
        fontWeight: 600,
        fontSize: 15,
        borderRadius: 14,
        padding: "16px 20px",
        border: "1px solid rgba(198,161,91,0.35)",
        cursor: "pointer",
      }}
    >
      <span style={{ color: COLORS.gold, display: "flex", flexShrink: 0 }}>{icon}</span>
      <span>{children}</span>
      {arrow && <ArrowUpRight size={15} strokeWidth={2} style={{ color: COLORS.gold, flexShrink: 0 }} />}
    </button>
  );
}

function SuccessCheck() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" style={{ margin: "0 auto 18px" }}>
      <circle cx="26" cy="26" r="20" fill="none" stroke={COLORS.gold} strokeWidth="1.5" strokeDasharray="126" style={{ animation: "drawCircle 0.7s cubic-bezier(0.16,1,0.3,1) both" }} />
      <path d="M16 27l7 7 13-15" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="36" style={{ animation: "drawCheck 0.4s ease 0.6s both" }} />
    </svg>
  );
}

type View = "initial" | "negative-form" | "thanks-negative" | "redirecting";

export default function ScanClient({ restaurant, scanId }: { restaurant: Restaurant; scanId: string | null }) {
  const [view, setView] = useState<View>("initial");
  const [message, setMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePositive = () => {
    updateScan(scanId, { choice: "positive" });
    setView("redirecting");
    setTimeout(() => {
      window.location.href = restaurant.googleReviewUrl;
    }, 700);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    updateScan(scanId, { choice: "negative" });

    try {
      const res = await fetch("/api/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          message,
          contactName,
          contactEmail,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "(fara continut)");
        console.error(`Trimiterea a esuat -- status ${res.status}:`, body);
        throw new Error(`Trimiterea a esuat (${res.status})`);
      }
      setView("thanks-negative");
    } catch (err) {
      console.error(err);
      setView("thanks-negative");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="onyx-viewport"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 0%, ${COLORS.bgRadial} 0%, ${COLORS.bg} 65%)`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{GLOBAL_CSS}</style>
      <Bokeh />

      <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}>
        <CornerFrame>
          <div
            style={{
              background: COLORS.card,
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 22,
              padding: "42px 28px",
              boxShadow: "0 30px 60px -15px rgba(0,0,0,0.6)",
            }}
          >
            <Wordmark restaurant={restaurant} />

            {view === "initial" && (
              <div>
                <p className="onyx-fade-2" style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 14, lineHeight: 1.5, marginBottom: 26 }}>
                  Spune-ne cum a fost — alege ce ți se potrivește.
                </p>

                <div className="onyx-fade-3">
                  <ChoiceButton onClick={handlePositive} icon={<Star size={17} strokeWidth={2} />} arrow>
                    Lasă o recenzie pe Google
                  </ChoiceButton>
                </div>

                <div className="onyx-fade-3" style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ fontSize: 11, letterSpacing: "0.14em", color: COLORS.textMuted, textTransform: "uppercase" }}>sau</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                </div>

                <div className="onyx-fade-4">
                  <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 12.5, marginBottom: 10, lineHeight: 1.5 }}>
                    Ai avut o problemă și vrei să o rezolvăm imediat?
                  </p>
                  <ChoiceButton onClick={() => setView("negative-form")} icon={<MessageCircle size={17} strokeWidth={2} />}>
                    Trimite un mesaj privat conducerii
                  </ChoiceButton>
                </div>
              </div>
            )}

            {view === "negative-form" && (
              <form onSubmit={handleSubmitComplaint}>
                <p className="onyx-fade-1" style={{ textAlign: "center", color: COLORS.textPrimary, fontSize: 16, marginBottom: 4, fontWeight: 500 }}>
                  Ne pare rău să auzim asta.
                </p>
                <p className="onyx-fade-1" style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13.5, marginBottom: 26, lineHeight: 1.5 }}>
                  Spune-ne ce nu a fost în regulă — mesajul ajunge direct la echipa noastră.
                </p>

                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ce nu a fost pe placul tău?"
                  rows={4}
                  className="onyx-input onyx-fade-2"
                  style={{ width: "100%", background: COLORS.inputBg, border: `1px solid ${COLORS.inputBorder}`, borderRadius: 12, padding: 14, color: COLORS.textPrimary, fontSize: 14, marginBottom: 18, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />

                <div
                  className="onyx-fade-3"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ fontSize: 10.5, letterSpacing: "0.18em", color: COLORS.gold, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    Ca să primești un răspuns
                  </span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                </div>
                <p className="onyx-fade-3" style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 12.5, marginBottom: 14, lineHeight: 1.5 }}>
                  Lasă-ne un contact ca să te putem suna sau scrie personal și să îndreptăm lucrurile.
                </p>

                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nume"
                  className="onyx-input onyx-fade-3"
                  style={{ width: "100%", background: COLORS.inputBg, border: `1px solid ${COLORS.inputBorder}`, borderRadius: 12, padding: 14, color: COLORS.textPrimary, fontSize: 14, marginBottom: 10, fontFamily: "inherit", boxSizing: "border-box" }}
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Email — primești răspunsul nostru aici"
                  className="onyx-input onyx-fade-3"
                  style={{ width: "100%", background: COLORS.inputBg, border: `1px solid ${COLORS.inputBorder}`, borderRadius: 12, padding: 14, color: COLORS.textPrimary, fontSize: 14, marginBottom: 20, fontFamily: "inherit", boxSizing: "border-box" }}
                />

                <div className="onyx-fade-4">
                  <PrimaryButton icon={submitting ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={15} strokeWidth={2} />}>
                    {submitting ? "Se trimite..." : "Trimite"}
                  </PrimaryButton>
                </div>
                <p className="onyx-fade-4" style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 11, marginTop: 14, lineHeight: 1.5 }}>
                  Prin trimitere ești de acord cu prelucrarea datelor conform{" "}
                  <a href="/confidentialitate" target="_blank" rel="noopener noreferrer" className="onyx-link" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>
                    Politicii de Confidențialitate
                  </a>
                  .
                </p>
              </form>
            )}

            {view === "thanks-negative" && (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <SuccessCheck />
                <p className="onyx-fade-1" style={{ color: COLORS.textPrimary, fontSize: 16, marginBottom: 8, fontWeight: 500 }}>
                  Mulțumim, mesajul tău a ajuns la echipa noastră!
                </p>
                <p className="onyx-fade-2" style={{ color: COLORS.textMuted, fontSize: 13.5, lineHeight: 1.5 }}>
                  Dacă ai lăsat un contact, cineva din echipă îți va răspunde personal în cel mai scurt timp.
                </p>
              </div>
            )}

            {view === "redirecting" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 40, height: 40, margin: "0 auto 20px", borderRadius: "50%", border: "2px solid rgba(198,161,91,0.2)", borderTopColor: COLORS.gold, animation: "spin 0.9s linear infinite" }} />
                <p className="onyx-fade-1" style={{ color: COLORS.textPrimary, fontSize: 15.5 }}>
                  Mulțumim! Te ducem spre Google Reviews...
                </p>
              </div>
            )}
          </div>
        </CornerFrame>
      </div>
    </div>
  );
}
