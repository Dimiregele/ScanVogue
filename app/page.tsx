export default function Home() {
  return (
    <main
      style={{
        width: "100%",
        maxWidth: "360px", // Lățime perfectă pentru telefoane
        height: "auto", // Permite cardului să se lungească dacă fontul e mare
        padding: "32px 20px",
        borderRadius: "24px",
        backgroundColor: "#121212",
        border: "1px solid #2a2a2a",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Titlu Restaurant */}
      <h1
        style={{
          color: "#f5f5f5",
          fontFamily: "serif",
          fontSize: "1.6rem",
          letterSpacing: "2px",
          marginBottom: "20px",
          fontWeight: "normal",
        }}
      >
        Complex Herastrau
      </h1>

      {/* Întrebare */}
      <p
        style={{
          color: "#e0e0e0",
          fontSize: "1.05rem",
          lineHeight: "1.4",
          marginBottom: "28px",
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
            padding: "14px 16px",
            borderRadius: "14px",
            border: "none",
            background: "linear-gradient(135deg, #d4af37 0%, #aa820a 100%)",
            color: "#000",
            fontWeight: "600",
            fontSize: "0.95rem",
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
            padding: "14px 16px",
            borderRadius: "14px",
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "#ccc",
            fontWeight: "500",
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Ceva nu a fost pe placul meu
        </button>

      </div>
    </main>
  );
}
