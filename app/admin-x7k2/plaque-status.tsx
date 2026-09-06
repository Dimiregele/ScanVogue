"use client";

import { useTransition } from "react";
import { togglePayingStatus, markPlaqueSent } from "./actions";

// Doua stari separate, afisate impreuna:
// 1. "Platitor" (is_paying) -- comutabil oricand, marcheaza tranzitia de la
//    luna gratuita la client platitor.
// 2. "Placheta trimisa" (plaque_sent_at) -- apare DOAR cand e platitor, si o
//    data setata ramane setata (nu exista buton de "anuleaza" -- daca a fost
//    o greseala, se corecteaza direct din baza de date, nu prin UI, ca sa nu
//    devina un buton apasat din greseala des).
export default function PlaqueStatus({
  restaurantId,
  isPaying,
  plaqueSentAt,
}: {
  restaurantId: string;
  isPaying: boolean;
  plaqueSentAt: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePaying = () => {
    startTransition(async () => {
      try {
        await togglePayingStatus(restaurantId, !isPaying);
      } catch (err) {
        console.error("Nu am putut schimba statusul de plată:", err);
        window.alert("Ceva nu a mers bine. Încearcă din nou.");
      }
    });
  };

  const handleMarkSent = () => {
    const confirmat = window.confirm("Confirmi că plăcuța fizică a fost trimisă/predată restaurantului?");
    if (!confirmat) return;

    startTransition(async () => {
      try {
        await markPlaqueSent(restaurantId);
      } catch (err) {
        console.error("Nu am putut marca plăcuța ca trimisă:", err);
        window.alert("Ceva nu a mers bine. Încearcă din nou.");
      }
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={handleTogglePaying}
        disabled={isPending}
        className="admin-btn"
        style={{
          fontSize: 11,
          padding: "5px 10px",
          borderRadius: 999,
          border: "1px solid",
          background: "transparent",
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.6 : 1,
          color: isPaying ? "#E8D2A0" : "#9C9382",
          borderColor: isPaying ? "rgba(198,161,91,0.5)" : "rgba(255,255,255,0.15)",
        }}
      >
        {isPaying ? "Platitor" : "Perioadă de probă"}
      </button>

      {isPaying &&
        (plaqueSentAt ? (
          <span style={{ fontSize: 11, color: "#8FD3A0" }}>
            ✓ Plăcuță trimisă ({new Date(plaqueSentAt).toLocaleDateString("ro-RO")})
          </span>
        ) : (
          <button
            type="button"
            onClick={handleMarkSent}
            disabled={isPending}
            className="admin-btn"
            style={{
              fontSize: 11,
              padding: "5px 10px",
              borderRadius: 999,
              border: "1px solid rgba(224,168,140,0.5)",
              background: "rgba(224,168,140,0.08)",
              color: "#E0A88C",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            Marchează plăcuță trimisă
          </button>
        ))}
    </div>
  );
}
