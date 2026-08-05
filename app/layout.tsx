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
    <html lang="ro" style={{ margin: 0, padding: 0, height: "100%", width: "100%" }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#050505",
          overflow: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
