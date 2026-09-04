"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateGoogleReviewUrl } from "./actions";

export default function GoogleUrlSetting({
  restaurantId,
  initialUrl,
}: {
  restaurantId: string;
  initialUrl: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      try {
        await updateGoogleReviewUrl(restaurantId, url);
        setSaved(true);
      } catch (err) {
        console.error("Nu am putut salva linkul Google Reviews:", err);
        window.alert("Ceva nu a mers bine la salvare. Încearcă din nou.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setSaved(false);
        }}
        style={{
          flex: 1,
          padding: 10,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.03)",
          color: "#F5F0E6",
          fontSize: 13,
          boxSizing: "border-box",
        }}
      />
      <button
        type="submit"
        disabled={isPending || url.trim() === initialUrl}
        style={{
          padding: "0 16px",
          borderRadius: 8,
          border: "none",
          background: "#C6A15B",
          color: "#100F0D",
          fontWeight: 600,
          fontSize: 13,
          cursor: isPending ? "default" : "pointer",
          opacity: isPending || url.trim() === initialUrl ? 0.5 : 1,
        }}
      >
        {isPending ? "..." : saved ? "Salvat" : "Salvează"}
      </button>
    </form>
  );
}
