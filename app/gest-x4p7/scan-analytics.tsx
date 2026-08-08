"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Scan = { created_at: string; choice: "positive" | "negative" | null };
type Granularity = "day" | "week" | "month" | "year";

const COLORS = {
  positive: "#8FD3A0",
  negative: "#E0A88C",
  grid: "rgba(255,255,255,0.06)",
  text: "#9C9382",
};

const GRANULARITY_LABEL: Record<Granularity, string> = {
  day: "Zi",
  week: "Săptămână",
  month: "Lună",
  year: "An",
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function startOfWeek(d: Date) {
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  monday.setDate(monday.getDate() + diff);
  return monday;
}

function bucketKeyAndLabel(date: Date, granularity: Granularity): { key: string; label: string } {
  if (granularity === "day") {
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return { key, label: `${pad(date.getDate())}.${pad(date.getMonth() + 1)}` };
  }
  if (granularity === "week") {
    const monday = startOfWeek(date);
    const key = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
    return { key, label: `${pad(monday.getDate())}.${pad(monday.getMonth() + 1)}` };
  }
  if (granularity === "month") {
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    const label = date.toLocaleDateString("ro-RO", { month: "short", year: "2-digit" });
    return { key, label };
  }
  const key = `${date.getFullYear()}`;
  return { key, label: key };
}

// Genereaza toate bucket-urile din fereastra de timp, chiar si cele fara
// nicio scanare -- altfel graficul ar "sari" peste perioade goale si ar
// da o impresie gresita despre trend.
function emptyBuckets(granularity: Granularity, count: number): { key: string; label: string }[] {
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
  // dedupe pastrand ordinea (poate aparea la 'year' daca sunt putini ani)
  const seen = new Set<string>();
  return out.filter((b) => (seen.has(b.key) ? false : (seen.add(b.key), true)));
}

const WINDOW_SIZE: Record<Granularity, number> = { day: 30, week: 12, month: 12, year: 6 };

export default function ScanAnalytics({ scans }: { scans: Scan[] }) {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const hourlyData = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, positive: 0, negative: 0, total: 0 }));
    for (const s of scans) {
      const h = new Date(s.created_at).getHours();
      buckets[h].total += 1;
      if (s.choice === "positive") buckets[h].positive += 1;
      if (s.choice === "negative") buckets[h].negative += 1;
    }
    return buckets.map((b) => ({ ...b, label: `${pad(b.hour)}:00` }));
  }, [scans]);

  const peakHour = useMemo(() => {
    if (scans.length === 0) return null;
    return hourlyData.reduce((max, b) => (b.total > max.total ? b : max), hourlyData[0]);
  }, [hourlyData, scans.length]);

  const timeSeriesData = useMemo(() => {
    const buckets = emptyBuckets(granularity, WINDOW_SIZE[granularity]);
    const map = new Map(buckets.map((b) => [b.key, { ...b, positive: 0, negative: 0, total: 0 }]));
    for (const s of scans) {
      const { key } = bucketKeyAndLabel(new Date(s.created_at), granularity);
      const bucket = map.get(key);
      if (!bucket) continue; // in afara ferestrei afisate
      bucket.total += 1;
      if (s.choice === "positive") bucket.positive += 1;
      if (s.choice === "negative") bucket.negative += 1;
    }
    return Array.from(map.values());
  }, [scans, granularity]);

  return (
    <div>
      <section style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <h2 style={sectionTitleStyle}>Ore de vârf</h2>
          {peakHour && peakHour.total > 0 && (
            <span style={{ color: "#C6A15B", fontSize: 12.5 }}>
              Cel mai activ interval: {peakHour.label}–{pad((peakHour.hour + 1) % 24)}:00
            </span>
          )}
        </div>
        <p style={{ color: "#9C9382", fontSize: 12.5, marginTop: 0, marginBottom: 16 }}>
          Scanări pe oră din zi, în total (toate datele disponibile).
        </p>
        {scans.length === 0 ? (
          <p style={{ color: "#9C9382", fontSize: 14 }}>Încă nu sunt destule scanări pentru un grafic.</p>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={hourlyData} margin={{ left: -20 }}>
                <CartesianGrid stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: COLORS.text, fontSize: 11 }} interval={2} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.text, fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#F5F0E6" }} />
                <Bar dataKey="positive" stackId="a" fill={COLORS.positive} radius={[0, 0, 0, 0]} />
                <Bar dataKey="negative" stackId="a" fill={COLORS.negative} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Scanări în timp</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                style={{
                  fontSize: 12,
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: g === granularity ? "#C6A15B" : "transparent",
                  color: g === granularity ? "#100F0D" : "#9C9382",
                  cursor: "pointer",
                  fontWeight: g === granularity ? 600 : 400,
                }}
              >
                {GRANULARITY_LABEL[g]}
              </button>
            ))}
          </div>
        </div>

        {scans.length === 0 ? (
          <p style={{ color: "#9C9382", fontSize: 14 }}>Încă nu sunt destule scanări pentru un grafic.</p>
        ) : (
          <>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={timeSeriesData} margin={{ left: -20 }}>
                  <CartesianGrid stroke={COLORS.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: COLORS.text, fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#F5F0E6" }} />
                  <Bar dataKey="positive" stackId="a" fill={COLORS.positive} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="negative" stackId="a" fill={COLORS.negative} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Perioadă</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Pozitive</th>
                    <th style={thStyle}>Negative</th>
                    <th style={thStyle}>% pozitive</th>
                  </tr>
                </thead>
                <tbody>
                  {[...timeSeriesData].reverse().map((row) => (
                    <tr key={row.key}>
                      <td style={tdStyle}>{row.label}</td>
                      <td style={tdStyle}>{row.total}</td>
                      <td style={{ ...tdStyle, color: COLORS.positive }}>{row.positive}</td>
                      <td style={{ ...tdStyle, color: COLORS.negative }}>{row.negative}</td>
                      <td style={tdStyle}>{row.total > 0 ? Math.round((row.positive / row.total) * 100) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#151310",
  border: "1px solid rgba(198,161,91,0.16)",
  borderRadius: 16,
  padding: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#F5F0E6",
  fontSize: 15,
  fontWeight: 600,
  marginTop: 0,
  marginBottom: 16,
};

const tooltipStyle: React.CSSProperties = {
  background: "#151310",
  border: "1px solid rgba(198,161,91,0.16)",
  borderRadius: 8,
  fontSize: 12,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  color: "#9C9382",
  fontWeight: 500,
  padding: "6px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 8px",
  color: "#F5F0E6",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
