// Sistem vizual comun pentru paginile de administrare (super-admin +
// panoul proprietarului). Extinde aceeasi identitate din scan-client.tsx
// (fundal negru-catifelat, accent auriu tip placheta de alama) in loc sa
// inventeze o paleta noua -- e continuarea aceluiasi brand, nu o pagina
// separata. Semnatura vizuala aici: "sclipirea de alama" -- un baleiaj de
// lumina peste cifra centrala (rata de satisfactie), ca lumina care
// prinde o placheta lustruita, plus particule calde care plutesc lent in
// fundal (extensia efectului Bokeh de pe pagina publica).

export const ADMIN_COLORS = {
  bg: "#0B0A08",
  bgRadial: "#18140F",
  card: "rgba(22,19,15,0.78)",
  cardBorder: "rgba(198,161,91,0.16)",
  cardBorderHover: "rgba(198,161,91,0.4)",
  gold: "#C6A15B",
  goldLight: "#E8D2A0",
  goldDeep: "#8A6B38",
  textPrimary: "#F5F0E6",
  textMuted: "#9C9382",
  textFaint: "#6B6558",
  inputBg: "rgba(255,255,255,0.035)",
  inputBorder: "rgba(255,255,255,0.09)",
  emerald: "#8FD3A0",
  terracotta: "#E0A88C",
  sapphire: "#7FA0C4",
} as const;

export const ADMIN_GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

@keyframes adminFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes adminEmberFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(24px,-34px) scale(1.1); } }
@keyframes adminEmberFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-28px,22px) scale(1.06); } }
@keyframes adminEmberFloat3 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.45; } 50% { transform: translate(18px,18px) scale(1.14); opacity:0.7; } }
@keyframes adminCornerGlow { 0%,100% { opacity:0.45; } 50% { opacity:1; } }
@keyframes adminShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes adminSpin { to { transform: rotate(360deg); } }
@keyframes adminPulseBorder { 0%,100% { border-color: rgba(198,161,91,0.16); } 50% { border-color: rgba(198,161,91,0.4); } }

.admin-fade-1 { animation: adminFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.02s both; }
.admin-fade-2 { animation: adminFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.09s both; }
.admin-fade-3 { animation: adminFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both; }
.admin-fade-4 { animation: adminFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.23s both; }
.admin-fade-5 { animation: adminFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both; }

.admin-card {
  transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease;
}
.admin-card:hover {
  transform: translateY(-2px);
  border-color: rgba(198,161,91,0.4) !important;
  box-shadow: 0 12px 32px -12px rgba(0,0,0,0.5);
}

.admin-row {
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.admin-row:hover {
  background: rgba(198,161,91,0.05) !important;
  transform: translateX(2px);
}

.admin-btn { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease, opacity 0.2s ease; }
.admin-btn:active:not(:disabled) { transform: scale(0.97); }
.admin-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px -8px rgba(198,161,91,0.5); }
.admin-btn-ghost:hover { border-color: rgba(198,161,91,0.5) !important; background: rgba(198,161,91,0.06) !important; color: ${ADMIN_COLORS.gold} !important; }

.admin-input { transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
.admin-input:focus { outline: none; border-color: ${ADMIN_COLORS.gold} !important; box-shadow: 0 0 0 3px rgba(198,161,91,0.14); background: rgba(255,255,255,0.05) !important; }
/* Chrome recunoaste campurile de email/parola si le pune singur un contur/
   fundal auriu-inchis, INAINTE sa dai click sau sa scrii ceva -- de-aia
   "Email" arata diferit de "Parola" desi au acelasi cod. Fundalul galben
   real al lui Chrome se aplica printr-o animatie interna, nu poate fi oprit
   doar cu "background" -- se blocheaza cu o tranzitie absurd de lunga pe
   acea proprietate, combinata cu box-shadow pentru culoarea vizibila reala. */
.admin-input:-webkit-autofill,
.admin-input:-webkit-autofill:hover,
.admin-input:-webkit-autofill:focus {
  border-color: ${ADMIN_COLORS.inputBorder} !important;
  -webkit-text-fill-color: ${ADMIN_COLORS.textPrimary} !important;
  -webkit-box-shadow: 0 0 0 1000px #17140F inset !important;
  box-shadow: 0 0 0 1000px #17140F inset !important;
  caret-color: ${ADMIN_COLORS.textPrimary};
  transition: background-color 600000s 0s, color 600000s 0s, border-color 0.2s ease !important;
}
.admin-input:-webkit-autofill:focus {
  border-color: ${ADMIN_COLORS.gold} !important;
}

.admin-corner { animation: adminCornerGlow 4s ease-in-out infinite; }

.admin-shimmer-text {
  background: linear-gradient(90deg, ${ADMIN_COLORS.gold} 0%, ${ADMIN_COLORS.goldLight} 25%, ${ADMIN_COLORS.gold} 50%, ${ADMIN_COLORS.goldDeep} 75%, ${ADMIN_COLORS.gold} 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: adminShimmer 3.5s linear infinite;
}

.admin-status-dot {
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .admin-fade-1, .admin-fade-2, .admin-fade-3, .admin-fade-4, .admin-fade-5,
  .admin-corner, .admin-shimmer-text { animation: none !important; }
  .admin-card, .admin-row, .admin-btn { transition: none !important; }
}
`;

export function AdminEmbers() {
  const spots = [
    { top: "-10%", left: "-8%", size: 280, color: "rgba(198,161,91,0.14)", anim: "adminEmberFloat1 10s ease-in-out infinite" },
    { bottom: "-14%", right: "-10%", size: 320, color: "rgba(150,100,50,0.12)", anim: "adminEmberFloat2 12s ease-in-out infinite" },
    { top: "40%", right: "-12%", size: 220, color: "rgba(198,161,91,0.09)", anim: "adminEmberFloat3 9s ease-in-out infinite" },
    { bottom: "10%", left: "8%", size: 160, color: "rgba(143,211,160,0.06)", anim: "adminEmberFloat3 13s ease-in-out infinite" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
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
            filter: "blur(24px)",
            animation: s.anim,
          }}
        />
      ))}
    </div>
  );
}

export function AdminCornerFrame({ children }: { children: React.ReactNode }) {
  const cornerStyle = { position: "absolute" as const, width: 20, height: 20, borderColor: ADMIN_COLORS.gold };
  return (
    <div style={{ position: "relative" }}>
      <span className="admin-corner" style={{ ...cornerStyle, top: -8, left: -8, borderTop: `1px solid ${ADMIN_COLORS.gold}`, borderLeft: `1px solid ${ADMIN_COLORS.gold}`, borderTopLeftRadius: 4 }} />
      <span className="admin-corner" style={{ ...cornerStyle, top: -8, right: -8, borderTop: `1px solid ${ADMIN_COLORS.gold}`, borderRight: `1px solid ${ADMIN_COLORS.gold}`, borderTopRightRadius: 4, animationDelay: "0.5s" }} />
      <span className="admin-corner" style={{ ...cornerStyle, bottom: -8, left: -8, borderBottom: `1px solid ${ADMIN_COLORS.gold}`, borderLeft: `1px solid ${ADMIN_COLORS.gold}`, borderBottomLeftRadius: 4, animationDelay: "1s" }} />
      <span className="admin-corner" style={{ ...cornerStyle, bottom: -8, right: -8, borderBottom: `1px solid ${ADMIN_COLORS.gold}`, borderRight: `1px solid ${ADMIN_COLORS.gold}`, borderBottomRightRadius: 4, animationDelay: "1.5s" }} />
      {children}
    </div>
  );
}

export const adminPageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  width: "100%",
  position: "relative",
  background: `radial-gradient(ellipse at 50% 0%, ${ADMIN_COLORS.bgRadial} 0%, ${ADMIN_COLORS.bg} 65%)`,
  fontFamily: "'Inter', system-ui, sans-serif",
  padding: "40px 20px",
};

export const adminContentStyle: React.CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

export const adminCardStyle: React.CSSProperties = {
  background: ADMIN_COLORS.card,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: `1px solid ${ADMIN_COLORS.cardBorder}`,
  borderRadius: 18,
  padding: 24,
};

export const adminSectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  color: ADMIN_COLORS.textPrimary,
  fontSize: 19,
  fontWeight: 600,
  letterSpacing: "0.01em",
  marginTop: 0,
  marginBottom: 16,
};
