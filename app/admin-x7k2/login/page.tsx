"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import { ADMIN_COLORS, ADMIN_GLOBAL_CSS, AdminEmbers, AdminCornerFrame } from "../../_shared/decor";

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
            onSubmit={handleSubmit}
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
                marginBottom: 4,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
              className="admin-fade-2"
            >
              Panou Super-Admin
            </h1>
            <p className="admin-fade-2" style={{ color: ADMIN_COLORS.textFaint, fontSize: 12.5, marginBottom: 24 }}>
              Acces restricționat
            </p>

            <div className="admin-fade-3">
              <input
                type="email"
                required
                autoFocus
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                style={{
                  width: "100%",
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 10,
                  border: `1px solid ${ADMIN_COLORS.inputBorder}`,
                  background: ADMIN_COLORS.inputBg,
                  color: ADMIN_COLORS.textPrimary,
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
                className="admin-input"
                style={{
                  width: "100%",
                  padding: 12,
                  marginBottom: 16,
                  borderRadius: 10,
                  border: `1px solid ${ADMIN_COLORS.inputBorder}`,
                  background: ADMIN_COLORS.inputBg,
                  color: ADMIN_COLORS.textPrimary,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <p style={{ color: "#E08585", fontSize: 13, marginBottom: 14 }}>{error}</p>
            )}

            <div className="admin-fade-4">
              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn-primary"
                style={{
                  width: "100%",
                  padding: 12,
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
                {loading ? "Se conectează..." : "Intră în cont"}
              </button>
            </div>
          </form>
        </AdminCornerFrame>
      </div>
    </div>
  );
}
