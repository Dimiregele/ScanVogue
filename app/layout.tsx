import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Platformă recenzii restaurant",
  description: "Sistem de colectare feedback pentru restaurante",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" style={{ height: "100%", width: "100%", margin: 0, padding: 0 }}>
      <body
        style={{
          margin: 0,
          padding: "16px",
          width: "100vw",
          minHeight: "100vh",
          height: "100dvh",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#050505",
          overflow: "hidden", // Previne apariția scroll-ului din cauza marginilor/colțurilor
        }}
      >
        {children}
      </body>
    </html>
  );
}
