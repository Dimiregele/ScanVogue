import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0A08",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(198,161,91,0.22), transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, serif",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: 6,
            color: "#F5F0E6",
          }}
        >
          SCAN<span style={{ color: "#C6A15B" }}>VOGUE</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            color: "#9C9382",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          Recenziile bune ajung pe Google. Cele proaste ajung la tine.
        </div>
      </div>
    ),
    { ...size }
  );
}
