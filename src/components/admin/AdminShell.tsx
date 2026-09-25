"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/admin/acciones-auth";
import { site } from "@/data/config";
import { IconMenu, IconClose } from "@/components/Icons";

const enlaces = [
  { href: "/admin", texto: "Panel", icono: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" },
  { href: "/admin/agenda", texto: "Agenda", icono: "M8 2v3M16 2v3M3 9h18M5 5h14v16H5z" },
  { href: "/admin/retoques", texto: "Retoques", icono: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" },
  { href: "/admin/clientes", texto: "Clientas", icono: "M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9.5 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { href: "/admin/servicios", texto: "Servicios", icono: "M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8z" },
  { href: "/admin/productos", texto: "Productos", icono: "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7" },
  { href: "/admin/inventario", texto: "Inventario", icono: "M3 4h18v4H3zM5 8v12h14V8M9 12h6" },
  { href: "/admin/galeria", texto: "Galería", icono: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6" },
  { href: "/admin/ventas", texto: "Ventas", icono: "M3 3v18h18M7 14l4-4 3 3 5-6" },
  { href: "/admin/compras", texto: "Compras", icono: "M6 2l1.5 3h9L18 2M3 6h18l-1.5 12a2 2 0 01-2 1.7H6.5a2 2 0 01-2-1.7z" },
  { href: "/admin/reportes", texto: "Reportes", icono: "M4 4h16v16H4zM8 16v-4M12 16v-7M16 16v-3" },
  { href: "/admin/configuracion", texto: "Configuración", icono: "M12 8a4 4 0 100 8 4 4 0 000-8zM3 12h2M19 12h2M12 3v2M12 19v2" },
];

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const NavContenido = () => (
    <>
      <div className="px-5 py-6">
        <Link href="/admin" className="font-serif text-xl text-cream">
          {site.nombre}
        </Link>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-rose-soft">
          Administración
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {enlaces.map((e) => {
          const activo =
            e.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(e.href);
          return (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setAbierto(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activo
                  ? "bg-rose text-white"
                  : "text-cream/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d={e.icono} />
              </svg>
              {e.texto}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="mb-2 truncate px-1 text-xs text-cream/60">{userEmail}</p>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-cream transition-colors hover:bg-white/20"
          >
            Cerrar sesión
          </button>
        </form>
        <Link
          href="/"
          className="mt-2 block px-1 text-center text-xs text-cream/60 hover:text-cream"
        >
          Ver sitio público ↗
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream lg:flex">
      {/* Barra superior móvil */}
      <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3 lg:hidden">
        <span className="font-serif text-lg text-cream">{site.nombre}</span>
        <button onClick={() => setAbierto(true)} aria-label="Abrir menú">
          <IconMenu className="h-6 w-6 text-cream" />
        </button>
      </div>

      {/* Menú lateral (escritorio) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink lg:flex">
        <NavContenido />
      </aside>

      {/* Menú lateral (móvil) */}
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink">
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-3 text-cream"
            >
              <IconClose className="h-6 w-6" />
            </button>
            <NavContenido />
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
