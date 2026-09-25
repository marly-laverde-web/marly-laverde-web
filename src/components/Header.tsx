"use client";

import { useState } from "react";
import Link from "next/link";
import { site, waLink, mensajeWhatsAppGeneral } from "@/data/config";
import { IconMenu, IconClose, IconWhatsApp } from "./Icons";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/servicios", texto: "Servicios" },
  { href: "/productos", texto: "Productos" },
  { href: "/galeria", texto: "Galería" },
  { href: "/agendar", texto: "Agendar" },
];

export default function Header() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="contenedor flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3" onClick={() => setAbierto(false)}>
          <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-line sm:h-16 sm:w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo Marly Laverde Estudio de Belleza"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-lg tracking-wide text-ink sm:text-xl">
              {site.nombre}
            </span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-rose">
              {site.subtitulo}
            </span>
          </span>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden items-center gap-8 md:flex">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-rose"
            >
              {e.texto}
            </Link>
          ))}
          <a
            href={waLink(mensajeWhatsAppGeneral)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp !px-5 !py-2.5 text-sm"
          >
            <IconWhatsApp className="h-4 w-4" />
            WhatsApp
          </a>
        </nav>

        {/* Botón menú móvil */}
        <button
          type="button"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto((v) => !v)}
          className="md:hidden"
        >
          {abierto ? (
            <IconClose className="h-7 w-7 text-ink" />
          ) : (
            <IconMenu className="h-7 w-7 text-ink" />
          )}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {abierto && (
        <nav className="border-t border-line bg-cream md:hidden">
          <div className="contenedor flex flex-col gap-1 py-4">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setAbierto(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-ink/90 transition-colors hover:bg-sand hover:text-rose"
              >
                {e.texto}
              </Link>
            ))}
            <a
              href={waLink(mensajeWhatsAppGeneral)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-2"
              onClick={() => setAbierto(false)}
            >
              <IconWhatsApp className="h-5 w-5" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
