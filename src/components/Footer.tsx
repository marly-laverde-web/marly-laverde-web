import Link from "next/link";
import { site, waLink, mensajeWhatsAppGeneral } from "@/data/config";
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconWhatsApp,
  IconClock,
  IconMapPin,
  IconPhone,
} from "./Icons";

export default function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-sand/60">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div>
          <span className="block font-serif text-2xl text-ink">{site.nombre}</span>
          <span className="mb-3 block text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-rose">
            {site.subtitulo}
          </span>
          <p className="text-sm leading-relaxed text-muted">{site.descripcion}</p>
          <div className="mt-4 flex gap-3">
            {site.redes.instagram && (
              <a href={site.redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-white/70 p-2 text-rose transition-colors hover:bg-rose hover:text-white">
                <IconInstagram className="h-5 w-5" />
              </a>
            )}
            {site.redes.facebook && (
              <a href={site.redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-white/70 p-2 text-rose transition-colors hover:bg-rose hover:text-white">
                <IconFacebook className="h-5 w-5" />
              </a>
            )}
            {site.redes.tiktok && (
              <a href={site.redes.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="rounded-full bg-white/70 p-2 text-rose transition-colors hover:bg-rose hover:text-white">
                <IconTikTok className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        {/* Enlaces */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink">
            Navegación
          </h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/servicios" className="hover:text-rose">Servicios</Link></li>
            <li><Link href="/productos" className="hover:text-rose">Productos</Link></li>
            <li><Link href="/galeria" className="hover:text-rose">Galería</Link></li>
            <li><Link href="/agendar" className="hover:text-rose">Agendar cita</Link></li>
            <li><Link href="/privacidad" className="hover:text-rose">Tratamiento de datos</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink">
            Contacto
          </h4>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2">
              <IconPhone className="h-4 w-4 shrink-0 text-rose" />
              <span>{site.telefonoVisible}</span>
            </li>
            {site.direccion && (
              <li className="flex items-start gap-2">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <span>
                  {site.direccion}
                  {site.ciudad && (
                    <>
                      <br />
                      {site.ciudad}
                    </>
                  )}
                </span>
              </li>
            )}
            <li>
              <a
                href={waLink(mensajeWhatsAppGeneral)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-rose hover:text-rose-dark"
              >
                <IconWhatsApp className="h-4 w-4" />
                Escríbenos por WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Horarios */}
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink">
            <IconClock className="h-4 w-4 text-rose" /> Horarios
          </h4>
          <ul className="space-y-2 text-sm text-muted">
            {site.horarios.map((h) => (
              <li key={h.dia} className="flex flex-col">
                <span className="font-medium text-ink/90">{h.dia}</span>
                <span>{h.horas}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="contenedor flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-muted sm:flex-row sm:text-left">
          <p>
            © {anio} {site.nombre} {site.subtitulo}. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-3">
            <Link href="/privacidad" className="hover:text-rose">
              Política de tratamiento de datos (Ley 1581 de 2012)
            </Link>
            <span className="text-line">·</span>
            <Link href="/admin" className="hover:text-rose">
              Administración
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
