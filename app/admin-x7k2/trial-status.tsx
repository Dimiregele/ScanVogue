"use client";

import { useState, useTransition } from "react";
import { setTrialStartDate } from "./actions";

const TRIAL_LENGTH_DAYS = 30;

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

export default function TrialStatus({
  restaurantId,
  trialStartedAt,
}: {
  restaurantId: string;
  trialStartedAt: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [dateInput, setDateInput] = useState(
    trialStartedAt ? trialStartedAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const handleSave = () => {
    if (!dateInput) return;
    startTransition(async () => {
      try {
        await setTrialStartDate(restaurantId, new Date(dateInput).toISOString());
        setEditing(false);
      } catch (err) {
        console.error("Nu am putut salva data de start a probei:", err);
        window.alert("Ceva nu a mers bine. Încearcă din nou.");
      }
    });
  };

  if (editing || !trialStartedAt) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          style={{
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.03)",
            color: "#F5F0E6",
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="admin-btn"
          style={{
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(198,161,91,0.5)",
            background: "rgba(198,161,91,0.1)",
            color: "#E8D2A0",
            cursor: isPending ? "default" : "pointer",
          }}
        >
          {isPending ? "..." : "Salvează"}
        </button>
        {trialStartedAt && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="admin-btn"
            style={{
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#9C9382",
              cursor: "pointer",
            }}
          >
            Anulează
          </button>
        )}
      </div>
    );
  }

  const start = new Date(trialStartedAt);
  const today = new Date();
  const elapsed = daysBetween(start, today);
  const remaining = TRIAL_LENGTH_DAYS - elapsed;
  const expired = remaining < 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: "#9C9382" }}>
        Trial din {start.toLocaleDateString("ro-RO")}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: expired ? "#E08C8C" : remaining <= 5 ? "#E0C08C" : "#8FD3A0",
        }}
      >
        {expired ? `expirat de ${Math.abs(remaining)} zile` : `${remaining} zile rămase`}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="admin-btn"
        style={{
          fontSize: 11,
          padding: "2px 6px",
          borderRadius: 6,
          border: "none",
          background: "transparent",
          color: "#9C9382",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        editează
      </button>
    </div>
  );
}
