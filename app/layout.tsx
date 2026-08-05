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
    <html lang="ro" style={{ height: "100%", margin: 0, padding: 0 }}>
      <body
        style={{
          margin: 0,
          padding: "16px",
          width: "100%",
          minHeight: "100vh",
          height: "100dvh", // Rezolvă bug-ul de centrare verticală din Safari pe iPhone
          boxSizing: "border-box",
          display: "grid",
          placeItems: "center", // Centrează absolut totul fix în mijlocul ecranului
          backgroundColor: "#000000",
          overflowX: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
