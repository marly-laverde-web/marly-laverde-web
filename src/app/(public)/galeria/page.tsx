import type { Metadata } from "next";
import { obtenerGaleria } from "@/lib/datos";
import MediaElegante from "@/components/MediaElegante";
import TituloSeccion from "@/components/TituloSeccion";

export const metadata: Metadata = {
  title: "Galería",
  description:
    "Galería de trabajos realizados: colorimetría, tratamientos capilares, maquillaje y más.",
};

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const galeria = await obtenerGaleria();
  return (
    <>
      <section className="contenedor pt-16 pb-4">
        <TituloSeccion
          kicker="Galería"
          titulo="Nuestros trabajos"
          subtitulo="Cada resultado refleja nuestra dedicación y amor por la belleza."
        />
      </section>

      <section className="contenedor py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {galeria.map((f) => (
            <div
              key={f.id}
              className="aspect-square overflow-hidden rounded-xl shadow-sm"
            >
              <MediaElegante
                imagen={f.imagen}
                alt={f.titulo}
                etiqueta={f.categoria}
                titulo={f.titulo}
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted">
          Las imágenes se publican con la autorización de nuestras clientas.
        </p>
      </section>
    </>
  );
}
