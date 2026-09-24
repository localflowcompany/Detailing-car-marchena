import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Detailing Car Marchena",
  description:
    "Detailing profesional en Marchena. Pulido, cerámico, tapicería y faros: el acabado que un túnel de lavado no puede darte.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="bg-bg text-white antialiased">{children}</body>
    </html>
  );
}
