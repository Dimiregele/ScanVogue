"use client";

import { useState, useTransition } from "react";
import { sendComplaintReply } from "./actions";
import ComplaintStatusButton from "./complaint-status-button";

type Complaint = {
  id: string;
  message: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  status: "new" | "read" | "resolved";
  created_at: string;
  ai_summary: string | null;
  ai_suggested_reply: string | null;
  ai_sensitive: boolean;
  reply_sent_at: string | null;
};

export default function ComplaintCard({ complaint: c }: { complaint: Complaint }) {
  const [replyText, setReplyText] = useState(c.ai_suggested_reply ?? "");
  const [showComposer, setShowComposer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    setError(null);
    startTransition(async () => {
      try {
        await sendComplaintReply(c.id, replyText);
      } catch (err) {
        setError(err instanceof Error ? err.message : "A apărut o eroare.");
      }
    });
  };

  return (
    <div className="admin-row" style={rowStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <p style={{ color: "#F5F0E6", fontSize: 14, lineHeight: 1.5, margin: 0, flex: 1 }}>{c.message}</p>
        <ComplaintStatusButton complaintId={c.id} status={c.status} />
      </div>

      <div style={{ color: "#9C9382", fontSize: 12, marginTop: 8 }}>
        {new Date(c.created_at).toLocaleString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        {c.contact_name && <> · contact: {c.contact_name}</>}
        {c.contact_phone && <> · {c.contact_phone}</>}
        {c.contact_email && <> · {c.contact_email}</>}
      </div>

      {c.ai_sensitive && (
        <div style={sensitiveBadgeStyle}>⚠️ Necesită atenție umană — nu răspunde doar cu sugestia AI, citește cu atenție</div>
      )}

      {c.ai_summary && (
        <div style={{ color: "#7FA0C4", fontSize: 12.5, marginTop: 10 }}>
          <strong>Rezumat AI:</strong> {c.ai_summary}
        </div>
      )}

      {c.reply_sent_at ? (
        <div style={{ color: "#8FD3A0", fontSize: 12.5, marginTop: 10 }}>
          ✓ Răspuns trimis pe {new Date(c.reply_sent_at).toLocaleString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </div>
      ) : c.ai_suggested_reply ? (
        <div style={{ marginTop: 12 }}>
          {!showComposer ? (
            <button type="button" onClick={() => setShowComposer(true)} style={secondaryBtnStyle}>
              Vezi răspunsul sugerat de AI
            </button>
          ) : (
            <div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                style={textareaStyle}
              />
              {!c.contact_email && (
                <p style={{ color: "#E0A88C", fontSize: 12, margin: "6px 0" }}>
                  Acest client nu a lăsat un email — nu poți trimite automat.
                </p>
              )}
              {error && <p style={{ color: "#E08585", fontSize: 12, margin: "6px 0" }}>{error}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isPending || !c.contact_email || !replyText.trim()}
                  style={{ ...sendBtnStyle, opacity: isPending || !c.contact_email || !replyText.trim() ? 0.5 : 1 }}
                >
                  {isPending ? "Se trimite..." : "Trimite răspuns"}
                </button>
                <button type="button" onClick={() => setShowComposer(false)} style={secondaryBtnStyle}>
                  Ascunde
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  padding: 14,
  background: "rgba(255,255,255,0.02)",
  borderRadius: 12,
};

const sensitiveBadgeStyle: React.CSSProperties = {
  marginTop: 10,
  padding: "8px 12px",
  borderRadius: 8,
  background: "rgba(224,168,140,0.1)",
  border: "1px solid rgba(224,168,140,0.35)",
  color: "#E0A88C",
  fontSize: 12,
  fontWeight: 500,
};

const secondaryBtnStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "#9C9382",
  cursor: "pointer",
};

const sendBtnStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 8,
  border: "none",
  background: "#C6A15B",
  color: "#100F0D",
  fontWeight: 600,
  cursor: "pointer",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: "#F5F0E6",
  fontSize: 13,
  fontFamily: "inherit",
  resize: "vertical",
  boxSizing: "border-box",
};
