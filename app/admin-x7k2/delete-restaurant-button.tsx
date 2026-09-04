"use client";

import { useState, useTransition } from "react";
import { deleteRestaurant } from "./actions";

export default function DeleteRestaurantButton({
  restaurantId,
  name,
}: {
  restaurantId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const matches = confirmText.trim().toLowerCase() === name.trim().toLowerCase();

  const handleConfirm = () => {
    if (!matches) return;
    startTransition(async () => {
      try {
        await deleteRestaurant(restaurantId);
        setOpen(false);
        setConfirmText("");
      } catch (err) {
        console.error("Nu am putut șterge restaurantul:", err);
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
          border: "1px solid rgba(220,80,80,0.5)",
          background: "rgba(220,80,80,0.08)",
          color: "#E08C8C",
          cursor: "pointer",
        }}
      >
        Șterge restaurant
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
              border: "1px solid rgba(220,80,80,0.5)",
              borderRadius: 16,
              padding: 24,
              boxSizing: "border-box",
            }}
          >
            <h3 style={{ color: "#F5F0E6", fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 8 }}>
              Ștergi definitiv &quot;{name}&quot;?
            </h3>
            <p style={{ color: "#9C9382", fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              Șterge restaurantul <strong style={{ color: "#E08C8C" }}>și tot ce ține de el</strong> —
              scanări, reclamații, statistici, link-ul QR nu va mai funcționa. Contul de email al
              proprietarului rămâne (poate fi refolosit la alt restaurant). <strong style={{ color: "#E08C8C" }}>Ireversibil.</strong>{" "}
              Scrie <strong style={{ color: "#E08C8C" }}>{name}</strong> ca să confirmi.
            </p>
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={name}
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
                disabled={isPending || !matches}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  background: "#E08C8C",
                  color: "#100F0D",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: matches ? "pointer" : "default",
                  opacity: matches ? 1 : 0.5,
                }}
              >
                {isPending ? "Se șterge..." : "Șterge definitiv"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
