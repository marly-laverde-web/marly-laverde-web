import type { Producto } from "@/data/productos";
import { waLink } from "@/data/config";
import { formatCOP } from "@/lib/format";
import MediaElegante from "./MediaElegante";
import { IconWhatsApp } from "./Icons";

export default function ProductoCard({ producto }: { producto: Producto }) {
  const agotado = producto.disponible === false;
  const mensaje = `¡Hola! 👋 Quiero comprar el producto *${producto.nombre}*. ¿Está disponible?`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden">
        <MediaElegante
          imagen={producto.imagen}
          alt={producto.nombre}
          etiqueta={producto.categoria}
          titulo={producto.nombre}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {agotado && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-rose">
          {producto.categoria}
        </span>
        <h3 className="mt-1 font-serif text-xl text-ink">{producto.nombre}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {producto.descripcion}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-lg font-semibold text-rose-dark">
            {formatCOP(producto.precio)}
          </span>
          {!agotado && (
            <a
              href={waLink(mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Comprar ${producto.nombre} por WhatsApp`}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-soft px-3.5 py-2 text-xs font-semibold text-rose-dark transition-colors hover:bg-rose hover:text-white"
            >
              <IconWhatsApp className="h-4 w-4" />
              Comprar
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
