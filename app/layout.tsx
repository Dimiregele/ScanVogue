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
          padding: "16px",
          minHeight: "100vh",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0a0a", // Fundalul întunecat al paginii
        }}
      >
        {children}
      </body>
    </html>
  );
}
