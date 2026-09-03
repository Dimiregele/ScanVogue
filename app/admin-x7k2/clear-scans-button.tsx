"use client";

import { useState, useTransition } from "react";
import { clearRestaurantScans } from "./actions";

export default function ClearScansButton({
  restaurantId,
  name,
  scanCount,
}: {
  restaurantId: string;
  name: string;
  scanCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  if (scanCount === 0) return null;

  const handleConfirm = () => {
    if (confirmText.trim().toUpperCase() !== "ȘTERGE") return;
    startTransition(async () => {
      try {
        await clearRestaurantScans(restaurantId);
        setOpen(false);
        setConfirmText("");
      } catch (err) {
        console.error("Nu am putut șterge scanările:", err);
        window.alert("Ceva nu a mers bine la ștergere. Încearcă din nou.");
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
          border: "1px solid rgba(224,168,140,0.3)",
          background: "transparent",
          color: "#E0A88C",
          cursor: "pointer",
        }}
      >
        Curăță scanări ({scanCount})
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
              maxWidth: 380,
              background: "#151310",
              border: "1px solid rgba(224,168,140,0.3)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h3 style={{ color: "#F5F0E6", fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 8 }}>
              Ștergi {scanCount} scanări la &quot;{name}&quot;?
            </h3>
            <p style={{ color: "#9C9382", fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              Ireversibil — nu se pot recupera. Reclamațiile nu sunt afectate,
              doar scanările (statistici, ore de vârf, rată satisfacție).
              Scrie <strong style={{ color: "#E0A88C" }}>ȘTERGE</strong> ca să confirmi.
            </p>
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ȘTERGE"
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
                disabled={isPending || confirmText.trim().toUpperCase() !== "ȘTERGE"}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  background: "#E0A88C",
                  color: "#100F0D",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: confirmText.trim().toUpperCase() === "ȘTERGE" ? "pointer" : "default",
                  opacity: confirmText.trim().toUpperCase() === "ȘTERGE" ? 1 : 0.5,
                }}
              >
                {isPending ? "Se șterge..." : "Confirmă ștergerea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
