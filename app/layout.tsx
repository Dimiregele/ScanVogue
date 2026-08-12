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
    <html lang="ro" style={{ height: "100%" }}>
      <body style={{ margin: 0, minHeight: "100%" }}>{children}</body>
    </html>
  );
}
