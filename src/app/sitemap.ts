import type { MetadataRoute } from "next";

const base = "https://marlylaverde.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ["", "/servicios", "/productos", "/galeria", "/agendar", "/privacidad"];
  return rutas.map((ruta) => ({
    url: `${base}${ruta}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: ruta === "" ? 1 : 0.7,
  }));
}
