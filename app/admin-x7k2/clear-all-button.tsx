"use client";

import { useState, useTransition } from "react";
import { clearRestaurantEverything } from "./actions";

const CONFIRM_PHRASE = "ȘTERGE TOT";

export default function ClearAllButton({
  restaurantId,
  name,
  scanCount,
  complaintCount,
}: {
  restaurantId: string;
  name: string;
  scanCount: number;
  complaintCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  if (scanCount === 0 && complaintCount === 0) return null;

  const handleConfirm = () => {
    if (confirmText.trim().toUpperCase() !== CONFIRM_PHRASE) return;
    startTransition(async () => {
      try {
        await clearRestaurantEverything(restaurantId);
        setOpen(false);
        setConfirmText("");
      } catch (err) {
        console.error("Nu am putut reseta restaurantul:", err);
        window.alert("Ceva nu a mers bine la resetare. Încearcă din nou.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-btn"
        style={{
          fontSize: 11,
          padding: "5px 10px",
          borderRadius: 999,
          border: "1px solid rgba(220,80,80,0.35)",
          background: "transparent",
          color: "#E08C8C",
          cursor: "pointer",
        }}
      >
        Curăță tot ({scanCount + complaintCount})
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              background: "#151310",
              border: "1px solid rgba(220,80,80,0.35)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h3 style={{ color: "#F5F0E6", fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 8 }}>
              Resetezi complet &quot;{name}&quot;?
            </h3>
            <p style={{ color: "#9C9382", fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              Șterge <strong style={{ color: "#E08C8C" }}>{scanCount} scanări</strong> ȘI{" "}
              <strong style={{ color: "#E08C8C" }}>{complaintCount} reclamații</strong> — inclusiv mesajele
              clienților și răspunsurile AI. Ireversibil, nu se pot recupera. Folosește asta doar înainte să
              predai contul unui client, ca să pornească de la zero. Scrie{" "}
              <strong style={{ color: "#E08C8C" }}>{CONFIRM_PHRASE}</strong> ca să confirmi.
            </p>
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 16,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#F5F0E6",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "#9C9382",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending || confirmText.trim().toUpperCase() !== CONFIRM_PHRASE}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  background: "#E08C8C",
                  color: "#100F0D",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: confirmText.trim().toUpperCase() === CONFIRM_PHRASE ? "pointer" : "default",
                  opacity: confirmText.trim().toUpperCase() === CONFIRM_PHRASE ? 1 : 0.5,
                }}
              >
                {isPending ? "Se șterge..." : "Confirmă resetarea completă"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
