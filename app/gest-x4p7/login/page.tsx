"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import { ADMIN_COLORS, ADMIN_GLOBAL_CSS, AdminEmbers, AdminCornerFrame } from "../../_shared/decor";

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
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 0%, ${ADMIN_COLORS.bgRadial} 0%, ${ADMIN_COLORS.bg} 65%)`,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <style>{ADMIN_GLOBAL_CSS}</style>
      <AdminEmbers />

      <div style={{ width: "100%", maxWidth: 340, position: "relative", zIndex: 1 }} className="admin-fade-1">
        <AdminCornerFrame>
          <form
            onSubmit={step === "email" ? handleSendCode : handleVerifyCode}
            style={{
              width: "100%",
              background: ADMIN_COLORS.card,
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: `1px solid ${ADMIN_COLORS.cardBorder}`,
              borderRadius: 18,
              padding: 32,
              boxShadow: "0 30px 60px -15px rgba(0,0,0,0.6)",
            }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: ADMIN_COLORS.textPrimary,
                fontSize: 22,
                marginBottom: 20,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
              className="admin-fade-2"
            >
              Panoul restaurantului tău
            </h1>

            {step === "email" ? (
              <div className="admin-fade-3">
                <p style={{ color: ADMIN_COLORS.textMuted, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
                  Introdu emailul folosit pentru alertele de reclamații — îți trimitem un cod.
                </p>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                  style={inputStyle}
                />
              </div>
            ) : (
              <div className="admin-fade-3">
                <p style={{ color: ADMIN_COLORS.textMuted, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
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
                  className="admin-input"
                  style={{ ...inputStyle, letterSpacing: "0.35em", textAlign: "center", fontSize: 18 }}
                />
              </div>
            )}

            {error && (
              <p style={{ color: "#E08585", fontSize: 13, marginTop: 10, marginBottom: 0 }}>{error}</p>
            )}

            <div className="admin-fade-4">
              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn-primary"
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 18,
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${ADMIN_COLORS.goldLight}, ${ADMIN_COLORS.gold} 60%, ${ADMIN_COLORS.goldDeep})`,
                  color: "#100F0D",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: loading ? "default" : "pointer",
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
                  className="admin-btn"
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    color: ADMIN_COLORS.textMuted,
                    fontSize: 12.5,
                    marginTop: 12,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Folosește alt email
                </button>
              )}
            </div>
          </form>
        </AdminCornerFrame>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: `1px solid ${ADMIN_COLORS.inputBorder}`,
  background: ADMIN_COLORS.inputBg,
  color: ADMIN_COLORS.textPrimary,
  fontSize: 14,
  boxSizing: "border-box",
};
