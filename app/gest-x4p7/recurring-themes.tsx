"use client";

import { useState, useTransition } from "react";
import { getRecurringThemes } from "./actions";

type Theme = { theme: string; count: number; example: string };

export default function RecurringThemes() {
  const [result, setResult] = useState<{ themes: Theme[]; tooFew: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAnalyze = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await getRecurringThemes();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "A apărut o eroare.");
      }
    });
  };

  const maxCount = result?.themes.length ? Math.max(...result.themes.map((t) => t.count)) : 1;

  return (
    <section className="admin-fade-5 admin-card" style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: result ? 18 : 0 }}>
        <div>
          <h2 style={titleStyle}>Teme recurente</h2>
          <p style={{ color: "#9C9382", fontSize: 12.5, margin: 0 }}>
            Ce se repetă în reclamațiile din ultimele 90 de zile — nu doar mesaje individuale.
          </p>
        </div>
        <button type="button" onClick={handleAnalyze} disabled={isPending} style={btnStyle}>
          {isPending ? "Analizează..." : result ? "Reanalizează" : "Analizează temele"}
        </button>
      </div>

      {error && <p style={{ color: "#E08585", fontSize: 13, marginTop: 12 }}>{error}</p>}

      {result && result.tooFew && (
        <p style={{ color: "#9C9382", fontSize: 13.5 }}>
          Ai nevoie de cel puțin 3 reclamații în ultimele 90 de zile pentru o analiză utilă.
        </p>
      )}

      {result && !result.tooFew && result.themes.length === 0 && (
        <p style={{ color: "#9C9382", fontSize: 13.5 }}>
          Nicio temă repetată găsită — reclamațiile par a fi probleme izolate, nu tipare.
        </p>
      )}

      {result && result.themes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {result.themes.map((t, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ color: "#F5F0E6", fontSize: 13.5, fontWeight: 500 }}>{t.theme}</span>
                <span style={{ color: "#C6A15B", fontSize: 12.5, fontWeight: 600 }}>{t.count}×</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${(t.count / maxCount) * 100}%`, background: "linear-gradient(90deg, #8A6B38, #C6A15B)", borderRadius: 3 }} />
              </div>
              <p style={{ color: "#6B6558", fontSize: 12, fontStyle: "italic", margin: 0 }}>&quot;{t.example}&quot;</p>
            </div>
          ))}
        </div>
      )}
    </section>
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

const btnStyle: React.CSSProperties = {
  fontSize: 12.5,
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid rgba(198,161,91,0.35)",
  background: "transparent",
  color: "#E8D2A0",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
