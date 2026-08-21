"use client";

import { useState, useTransition } from "react";
import { markThemeResolved } from "./actions";

type Theme = { theme: string; count: number; timePattern: string | null };

export default function RecurringThemes({
  restaurantId,
  computedAt,
  themes,
  outcomeLabels,
}: {
  restaurantId: string;
  computedAt: string | null;
  themes: Theme[];
  outcomeLabels: (string | null)[];
}) {
  const maxCount = themes.length ? Math.max(...themes.map((t) => t.count)) : 1;

  const computedAtLabel = computedAt
    ? new Date(computedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })
    : null;

  return (
    <section className="admin-fade-5 admin-card" style={cardStyle}>
      <div style={{ marginBottom: themes.length ? 18 : 0 }}>
        <h2 style={titleStyle}>Teme recurente</h2>
        <p style={{ color: "#9C9382", fontSize: 12.5, margin: 0 }}>
          {computedAtLabel
            ? `Calculat automat pe ${computedAtLabel}, din ultimele 30 de zile — actualizat săptămânal.`
            : "Se actualizează automat, săptămânal — nu e nimic de calculat manual încă."}
        </p>
      </div>

      {themes.length === 0 && (
        <p style={{ color: "#9C9382", fontSize: 13.5 }}>
          Nicio temă recurentă încă — fie prea puține reclamații, fie sunt probleme izolate, nu tipare. Prima analiză
          apare după câteva zile de activitate.
        </p>
      )}

      {themes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {themes.map((t, i) => (
            <ThemeRow
              key={t.theme}
              restaurantId={restaurantId}
              theme={t}
              maxCount={maxCount}
              outcomeLabel={outcomeLabels[i] ?? null}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ThemeRow({
  restaurantId,
  theme,
  maxCount,
  outcomeLabel,
}: {
  restaurantId: string;
  theme: Theme;
  maxCount: number;
  outcomeLabel: string | null;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [note, setNote] = useState("");
  const [justMarked, setJustMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await markThemeResolved(restaurantId, theme.theme, note);
        setFormOpen(false);
        setNote("");
        setJustMarked(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "A apărut o eroare.");
      }
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ color: "#F5F0E6", fontSize: 13.5, fontWeight: 500 }}>{theme.theme}</span>
        <span style={{ color: "#C6A15B", fontSize: 12.5, fontWeight: 600 }}>{theme.count}×</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        <div
          style={{
            height: "100%",
            width: `${(theme.count / maxCount) * 100}%`,
            background: "linear-gradient(90deg, #8A6B38, #C6A15B)",
            borderRadius: 3,
          }}
        />
      </div>
      {theme.timePattern && (
        <p style={{ color: "#C6A15B", fontSize: 12, margin: "0 0 6px" }}>{theme.timePattern}</p>
      )}

      {(outcomeLabel || justMarked) && (
        <p style={{ color: "#9C9382", fontSize: 12, margin: "0 0 6px", lineHeight: 1.5 }}>
          {justMarked && !outcomeLabel ? "Marcat ca rezolvat — revenim cu rezultatul în câteva zile." : outcomeLabel}
        </p>
      )}

      {!formOpen && (
        <button type="button" onClick={() => setFormOpen(true)} style={smallBtnStyle}>
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
            style={textareaStyle}
          />
          {error && <p style={{ color: "#E08585", fontSize: 12, margin: "4px 0" }}>{error}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setFormOpen(false)} disabled={isPending} style={cancelBtnStyle}>
              Anulează
            </button>
            <button type="button" onClick={handleSubmit} disabled={isPending} style={smallBtnStyle}>
              {isPending ? "Se salvează..." : "Confirmă"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(22,19,15,0.78)",
  border: "1px solid rgba(198,161,91,0.16)",
  borderRadius: 18,
  padding: 24,
  marginBottom: 20,
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  color: "#F5F0E6",
  fontSize: 19,
  fontWeight: 600,
  margin: "0 0 4px",
};

const smallBtnStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 999,
  border: "1px solid rgba(198,161,91,0.35)",
  background: "transparent",
  color: "#E8D2A0",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const cancelBtnStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "#9C9382",
  cursor: "pointer",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: 10,
  color: "#F5F0E6",
  fontSize: 12.5,
  fontFamily: "inherit",
  resize: "none",
  boxSizing: "border-box",
};
