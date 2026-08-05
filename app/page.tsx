export default function Home() {
  return (
    /* Wrapper principal pentru centrare și dimensionare */
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "340px", // Dimensiune optimă universală
        boxSizing: "border-box",
      }}
    >
      {/* --- COLȚURILE AURII DECORATIVE (lipite fix de card) --- */}
      {/* Top Left */}
      <div
        style={{
          position: "absolute",
          top: "-8px",
          left: "-8px",
          width: "24px",
          height: "24px",
          borderTop: "2px solid #d4af37",
          borderLeft: "2px solid #d4af37",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* Top Right */}
      <div
        style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          width: "24px",
          height: "24px",
          borderTop: "2px solid #d4af37",
          borderRight: "2px solid #d4af37",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* Bottom Left */}
      <div
        style={{
          position: "absolute",
          bottom: "-8px",
          left: "-8px",
          width: "24px",
          height: "24px",
          borderBottom: "2px solid #d4af37",
          borderLeft: "2px solid #d4af37",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* Bottom Right */}
      <div
        style={{
          position: "absolute",
          bottom: "-8px",
          right: "-8px",
          width: "24px",
          height: "24px",
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
          padding: "32px 20px",
          borderRadius: "20px",
          backgroundColor: "#121212",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.9)",
        }}
      >
        {/* Titlu Restaurant */}
        <h1
          style={{
            color: "#ffffff",
            fontFamily: "serif",
            fontSize: "1.45rem",
            letterSpacing: "2px",
            marginTop: 0,
            marginBottom: "18px",
            fontWeight: "normal",
          }}
        >
          Complex Herastrau
        </h1>

        {/* Întrebare */}
        <p
          style={{
            color: "#d0d0d0",
            fontSize: "0.98rem",
            lineHeight: "1.4",
            marginTop: 0,
            marginBottom: "26px",
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
              padding: "14px 12px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #d4af37 0%, #aa820a 100%)",
              color: "#000000",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>★</span> Am avut o experiență plăcută
          </button>

          {/* Buton 2 - Negativ */}
          <button
            style={{
              width: "100%",
              padding: "14px 12px",
              borderRadius: "12px",
              border: "1px solid #333333",
              background: "#1a1a1a",
              color: "#cccccc",
              fontWeight: "500",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Ceva nu a fost pe placul meu
          </button>

        </div>
      </main>
    </div>
  );
}
