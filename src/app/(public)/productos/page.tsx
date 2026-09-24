import type { Metadata } from "next";
import { obtenerProductos } from "@/lib/datos";
import ProductoCard from "@/components/ProductoCard";
import TituloSeccion from "@/components/TituloSeccion";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Productos profesionales para el cuidado del cabello: shampoos, mascarillas, tratamientos y más.",
};

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const items = await obtenerProductos();

  // Agrupar por categoría manteniendo el orden de aparición
  const categorias = Array.from(new Set(items.map((p) => p.categoria)));

  return (
    <>
      <section className="contenedor pt-16 pb-4">
        <TituloSeccion
          kicker="Tienda"
          titulo="Nuestros productos"
          subtitulo="Cuidado profesional para llevar a casa. Escríbenos por WhatsApp para conocer disponibilidad y realizar tu pedido."
        />
      </section>

      {categorias.map((cat) => {
        const productosCat = items.filter((p) => p.categoria === cat);
        return (
          <section key={cat} className="contenedor py-10">
            <div className="mb-8 border-l-4 border-rose pl-4">
              <h2 className="font-serif text-2xl text-ink sm:text-3xl">{cat}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productosCat.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
