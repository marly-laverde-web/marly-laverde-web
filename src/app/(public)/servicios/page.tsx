import type { Metadata } from "next";
import { categoriasServicios } from "@/data/servicios";
import { obtenerServicios } from "@/lib/datos";
import ServicioCard from "@/components/ServicioCard";
import TituloSeccion from "@/components/TituloSeccion";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Catálogo de servicios: colorimetría, tratamientos capilares, manicure, pedicure, maquillaje, cejas, pestañas y peinados.",
};

export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const activos = await obtenerServicios();

  // Categorías conocidas (con descripción) + cualquier categoría nueva creada
  // desde el panel de administración.
  const extras = Array.from(new Set(activos.map((s) => s.categoria))).filter(
    (c) => !categoriasServicios.some((cat) => cat.nombre === c)
  );
  const categorias = [
    ...categoriasServicios.map((c) => ({ nombre: c.nombre as string, descripcion: c.descripcion })),
    ...extras.map((c) => ({ nombre: c, descripcion: "" })),
  ];

  return (
    <>
      <section className="contenedor pt-16 pb-4">
        <TituloSeccion
          kicker="Catálogo"
          titulo="Nuestros servicios"
          subtitulo="Explora todo lo que tenemos para ti. Los precios son de referencia; escríbenos por WhatsApp para agendar o resolver cualquier duda."
        />
      </section>

      {categorias.map((cat) => {
        const items = activos.filter((s) => s.categoria === cat.nombre);
        if (items.length === 0) return null;
        return (
          <section key={cat.nombre} className="contenedor py-10">
            <div className="mb-8 border-l-4 border-rose pl-4">
              <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                {cat.nombre}
              </h2>
              {cat.descripcion && (
                <p className="mt-1 max-w-2xl text-sm text-muted">
                  {cat.descripcion}
                </p>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <ServicioCard key={s.id} servicio={s} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
