import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "L'Oliva Notturna",
  description: "Restaurante italiano ficticio en Viña del Mar.",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
