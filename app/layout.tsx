

Layout · TSX
import type { Metadata, Viewport } from "next";
 
export const metadata: Metadata = {
  metadataBase: new URL("https://scanvogue.ro"),
  title: {
    default: "ScanVogue — Gestionare recenzii și reclamații pentru restaurante",
    template: "%s · ScanVogue",
  },
  description:
    "Un cod QR pe masă transformă recenziile proaste în mesaje private, rezumate automat de AI, înainte să ajungă pe Google. Platformă pentru restaurante, cafenele și hoteluri din România.",
  keywords: [
    "gestionare recenzii restaurant",
    "reclamații clienți HoReCa",
    "recenzii Google restaurant",
    "feedback clienți restaurant",
    "QR code recenzii",
    "management reputație restaurant",
  ],
  authors: [{ name: "ScanVogue" }],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://scanvogue.ro",
    siteName: "ScanVogue",
    title: "ScanVogue — Gestionare recenzii și reclamații pentru restaurante",
    description:
      "Recenziile bune ajung pe Google. Cele proaste ajung la tine. Un QR pe masă, AI care triază reclamațiile, tu câștigi timp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanVogue — Gestionare recenzii pentru restaurante",
    description: "Recenziile bune ajung pe Google. Cele proaste ajung la tine.",
  },
};
 
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0B0A08",
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
