import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { site } from "@/data/config";

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

// URL base del sitio (usa el dominio real de Vercel; localhost en desarrollo)
const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
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
  twitter: {
    card: "summary_large_image",
    title: `${site.nombre} | ${site.subtitulo}`,
    description: site.descripcion,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}
