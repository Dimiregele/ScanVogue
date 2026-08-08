"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";

type Step = "email" | "code";

export default function OwnerLoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getBrowserClient();
    // shouldCreateUser: false -- contul e creat automat cand super-adminul
    // adauga restaurantul (vezi ensureOwnerAccount in admin-x7k2/actions.ts).
    // Aici nu lasam pe oricine sa-si creeze cont doar tastand un email random.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    setLoading(false);

    if (otpError) {
      setError("Nu am găsit un cont pentru acest email.");
      return;
    }

    setStep("code");
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setLoading(false);

    if (verifyError) {
      setError("Cod incorect sau expirat.");
      return;
    }

    router.push("/gest-x4p7");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B0A08",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <form
        onSubmit={step === "email" ? handleSendCode : handleVerifyCode}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#151310",
          border: "1px solid rgba(198,161,91,0.16)",
          borderRadius: 16,
          padding: 32,
        }}
      >
        <h1 style={{ color: "#F5F0E6", fontSize: 18, marginBottom: 8, fontWeight: 600 }}>
          Panoul restaurantului tău
        </h1>

        {step === "email" ? (
          <>
            <p style={{ color: "#9C9382", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Introdu emailul folosit pentru alertele de reclamații — îți trimitem un cod.
            </p>
            <input
              type="email"
              required
              autoFocus
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </>
        ) : (
          <>
            <p style={{ color: "#9C9382", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Am trimis un cod la <strong style={{ color: "#C9C2B4" }}>{email}</strong>. Introdu-l mai jos.
            </p>
            <input
              type="text"
              inputMode="numeric"
              required
              autoFocus
              placeholder="Cod din email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ ...inputStyle, letterSpacing: "0.3em", textAlign: "center" }}
            />
          </>
        )}

        {error && (
          <p style={{ color: "#E08585", fontSize: 13, marginTop: 4, marginBottom: 14 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 16,
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
          {loading ? "Se trimite..." : step === "email" ? "Trimite cod" : "Confirmă"}
        </button>

        {step === "code" && (
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            style={{ width: "100%", background: "none", border: "none", color: "#9C9382", fontSize: 12.5, marginTop: 12, cursor: "pointer", textDecoration: "underline" }}
          >
            Folosește alt email
          </button>
        )}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: "#F5F0E6",
  fontSize: 14,
  boxSizing: "border-box",
};
