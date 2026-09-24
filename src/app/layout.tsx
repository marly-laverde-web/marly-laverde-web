import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/data/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BotonWhatsAppFlotante from "@/components/BotonWhatsAppFlotante";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marlylaverde.com"),
  title: {
    default: `${site.nombre} | ${site.subtitulo}`,
    template: `%s | ${site.nombre}`,
  },
  description: site.descripcion,
  keywords: [
    "colorimetría",
    "tratamientos capilares",
    "balayage",
    "salón de belleza",
    "estudio de belleza",
    "manicure",
    "pedicure",
    "maquillaje",
    "Marly Laverde",
  ],
  openGraph: {
    title: `${site.nombre} | ${site.subtitulo}`,
    description: site.descripcion,
    type: "website",
    locale: "es_CO",
    siteName: `${site.nombre} ${site.subtitulo}`,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${montserrat.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <BotonWhatsAppFlotante />
      </body>
    </html>
  );
}
