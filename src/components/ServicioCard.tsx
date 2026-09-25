import type { Servicio } from "@/data/servicios";
import { waLink } from "@/data/config";
import { formatCOP, formatDuracion } from "@/lib/format";
import MediaElegante from "./MediaElegante";
import { IconWhatsApp, IconClock } from "./Icons";

export default function ServicioCard({ servicio }: { servicio: Servicio }) {
  const mensaje = `¡Hola! 👋 Me interesa el servicio de *${servicio.nombre}* (${servicio.categoria}). ¿Podrían darme más información y disponibilidad?`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden">
        <MediaElegante
          imagen={servicio.imagen}
          alt={servicio.nombre}
          etiqueta={servicio.categoria}
          titulo={servicio.nombre}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl text-ink">{servicio.nombre}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {servicio.descripcion}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <div>
            {servicio.precio === null ? (
              <span className="block text-sm font-semibold text-rose-dark">
                Precio según valoración
              </span>
            ) : (
              <span className="block text-lg font-semibold text-rose-dark">
                {formatCOP(servicio.precio)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted">
              <IconClock className="h-3.5 w-3.5" />
              {formatDuracion(servicio.duracionMin)}
            </span>
          </div>
          <a
            href={waLink(mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar por ${servicio.nombre} en WhatsApp`}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-soft px-3.5 py-2 text-xs font-semibold text-rose-dark transition-colors hover:bg-rose hover:text-white"
          >
            <IconWhatsApp className="h-4 w-4" />
            Consultar
          </a>
        </div>
      </div>
    </article>
  );
}
