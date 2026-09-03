"use client";

import { useTransition } from "react";
import { toggleRestaurantActive } from "./actions";

export default function ToggleActiveButton({
  restaurantId,
  name,
  isActive,
}: {
  restaurantId: string;
  name: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const verb = isActive ? "dezactivezi" : "activezi";
    const avertisment = isActive
      ? `Restaurantul nu va mai putea primi feedback prin QR cât timp e dezactivat.`
      : `Restaurantul va putea din nou primi feedback prin QR.`;

    const confirmat = window.confirm(
      `Sigur vrei să ${verb} restaurantul "${name}"?\n\n${avertisment}`
    );

    if (confirmat) {
      startTransition(async () => {
        try {
          await toggleRestaurantActive(restaurantId, !isActive);
        } catch (err) {
          console.error("Nu am putut schimba starea restaurantului:", err);
          window.alert("Ceva nu a mers bine la schimbarea stării. Încearcă din nou.");
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
        color: isActive ? "#8FD3A0" : "#E0A88C",
        borderColor: isActive ? "rgba(143,211,160,0.35)" : "rgba(224,168,140,0.35)",
        transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
      }}
    >
      {isPending ? "..." : isActive ? "Activ" : "Inactiv"}
    </button>
  );
}
