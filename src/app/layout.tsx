import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import "@/frontend/styles/globals.css";

const garamond = EB_Garamond({
  variable: "--fuente-garamond",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--fuente-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Archivo personal de conocimiento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Las variables de las fuentes van en <html>: los tokens (:root) las leen desde ahí.
    <html lang="es" className={`${garamond.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
