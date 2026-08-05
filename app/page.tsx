export default function Home() {
  return (
    /* Fundalul principal ocupă ecranele tuturor modelelor Samsung/Android */
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh", // Se adaptează instant când apare/dispare bara de navigare
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        boxSizing: "border-box",
        backgroundColor: "#050505",
        overflow: "hidden",
      }}
    >
      {/* Containerul Cardului + Colțurile aurii */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "320px", // Puțin mai strâns pentru ecrane de Samsung mai mici
          boxSizing: "border-box",
        }}
      >
        {/* --- COLȚURILE AURII DECORATIVE --- */}
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: "-8px",
            width: "20px",
            height: "20px",
            borderTop: "2px solid #d4af37",
            borderLeft: "2px solid #d4af37",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            width: "20px",
            height: "20px",
            borderTop: "2px solid #d4af37",
            borderRight: "2px solid #d4af37",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-8px",
            left: "-8px",
            width: "20px",
            height: "20px",
            borderBottom: "2px solid #d4af37",
            borderLeft: "2px solid #d4af37",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-8px",
            right: "-8px",
            width: "20px",
            height: "20px",
            borderBottom: "2px solid #d4af37",
            borderRight: "2px solid #d4af37",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* --- CARDUL PROPRIU-ZIS --- */}
        <main
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            padding: "28px 18px",
            borderRadius: "20px",
            backgroundColor: "#121212",
            border: "1px solid rgba(212, 175, 55, 0.25)",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.9)",
          }}
        >
          {/* Titlu Restaurant */}
          <h1
            style={{
              color: "#ffffff",
              fontFamily: "serif",
              fontSize: "1.35rem",
              letterSpacing: "1.5px",
              marginTop: 0,
              marginBottom: "16px",
              fontWeight: "normal",
            }}
          >
            Complex Herastrau
          </h1>

          {/* Întrebare */}
          <p
            style={{
              color: "#d0d0d0",
              fontSize: "0.95rem",
              lineHeight: "1.4",
              marginTop: 0,
              marginBottom: "24px",
            }}
          >
            Cum a fost experiența ta astăzi la noi?
          </p>

          {/* Container Butoane */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Buton 1 - Pozitiv */}
            <button
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #d4af37 0%, #aa820a 100%)",
                color: "#000000",
                fontWeight: "600",
                fontSize: "0.88rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>★</span> Am avut o experiență plăcută
            </button>

            {/* Buton 2 - Negativ */}
            <button
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #333333",
                background: "#1a1a1a",
                color: "#cccccc",
                fontWeight: "500",
                fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              Ceva nu a fost pe placul meu
            </button>

          </div>
        </main>
      </div>
    </div>
  );
}
