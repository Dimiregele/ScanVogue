import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Platformă recenzii restaurant",
  description: "Sistem de colectare feedback pentru restaurante",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          padding: "16px", // Adaugă spațiu ca cardul să nu atingă marginea ecranului
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
          boxSizing: "border-box",
          overflowX: "hidden", // Previne scroll-ul orizontal nedorit
        }}
      >
        {/* Un wrapper responsive care strânge cardul */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px", // Ajustează valoarea dacă vrei să fie mai lat/îngust pe desktop
            display: "flex",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
