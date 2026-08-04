import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platformă recenzii restaurant",
  description: "Sistem de colectare feedback pentru restaurante",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
