"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Email sau parolă incorectă.");
      return;
    }

    router.push("/admin-x7k2");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0A08",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#151310",
          border: "1px solid rgba(198,161,91,0.16)",
          borderRadius: 16,
          padding: 32,
        }}
      >
        <h1 style={{ color: "#F5F0E6", fontSize: 18, marginBottom: 24, fontWeight: 600 }}>
          Panou Super-Admin
        </h1>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "#F5F0E6",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          required
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "#F5F0E6",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ color: "#E08585", fontSize: 13, marginBottom: 14 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "#C6A15B",
            color: "#100F0D",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Se conectează..." : "Intră în cont"}
        </button>
      </form>
    </div>
  );
}
