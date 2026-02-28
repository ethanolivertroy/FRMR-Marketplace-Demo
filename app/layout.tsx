import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRMR Marketplace Demo",
  description: "Machine-readable trust centers — ingest any FRMR-compatible JSON and render your own trust center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
