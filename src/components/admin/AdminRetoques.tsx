"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { site, waLinkTelefono } from "@/data/config";
import { ESTADOS_RETOQUE, NOMBRES_DIAS, type EstadoRetoque } from "@/lib/tipos";
import {
  actualizarEstadoRetoque,
  modificarFechaRetoque,
  eliminarRetoque,
} from "@/app/admin/retoques/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";
import { IconWhatsApp } from "@/components/Icons";

/* eslint-disable @typescript-eslint/no-explicit-any */

function diasHasta(fecha: string, hoy: string) {
  const [ay, am, ad] = fecha.split("-").map(Number);
  const [hy, hm, hd] = hoy.split("-").map(Number);
  const f = Date.UTC(ay, am - 1, ad);
  const h = Date.UTC(hy, hm - 1, hd);
  return Math.round((f - h) / 86400000);
}

function fechaLegible(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${NOMBRES_DIAS[dt.getUTCDay()]} ${d}/${m}/${y}`;
}

function textoDias(dias: number) {
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} día(s)`;
  if (dias === 0) return "¡Es hoy!";
  if (dias === 1) return "Mañana";
  return `En ${dias} días`;
}

export default function AdminRetoques({
  retoques,
  hoy,
}: {
  retoques: any[];
  hoy: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");

  const alertas = retoques.filter((r) => diasHasta(r.fecha_retoque, hoy) <= 3);
  const proximos = retoques.filter((r) => diasHasta(r.fecha_retoque, hoy) > 3);

  async function recordar(r: any) {
    const msg = `¡Hola ${r.cliente_nombre}! 👋 Te saludamos de ${site.nombre}. Se acerca la fecha de tu retoque de *${r.servicio_nombre}* (${fechaLegible(
      r.fecha_retoque
    )}). ¿Deseas que agendemos tu cita? 💗`;
    window.open(waLinkTelefono(r.cliente_telefono, msg), "_blank", "noopener,noreferrer");
    await actualizarEstadoRetoque(r.id, "recordada");
    router.refresh();
  }

  async function cambiarEstado(id: string, estado: EstadoRetoque) {
    await actualizarEstadoRetoque(id, estado);
    router.refresh();
  }

  async function guardarFecha(id: string) {
    if (!nuevaFecha) return;
    const res = await modificarFechaRetoque(id, nuevaFecha);
    if (res.ok) {
      setEditando(null);
      setNuevaFecha("");
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  async function borrar(id: string) {
    if (!confirm("¿Eliminar este seguimiento de retoque?")) return;
    await eliminarRetoque(id);
    router.refresh();
  }

  function Tarjeta({ r, alerta }: { r: any; alerta: boolean }) {
    const dias = diasHasta(r.fecha_retoque, hoy);
    const est = ESTADOS_RETOQUE.find((e) => e.valor === r.estado);
    return (
      <div
        className={`rounded-2xl border bg-white/70 p-4 ${
          alerta ? "border-rose/40" : "border-line"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium text-ink">{r.cliente_nombre}</p>
            <p className="text-sm text-muted">{r.servicio_nombre}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">
              {fechaLegible(r.fecha_retoque)}
            </p>
            <p
              className={`text-xs font-medium ${
                dias <= 3 ? "text-rose-dark" : "text-muted"
              }`}
            >
              {textoDias(dias)}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white"
            style={{ backgroundColor: est?.color }}
          >
            {est?.etiqueta}
          </span>
          {r.notas && <span className="text-xs text-muted">📝 {r.notas}</span>}
        </div>

        {editando === r.id ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={nuevaFecha}
              min={hoy}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm"
            />
            <button onClick={() => guardarFecha(r.id)} className="btn-primario !py-1.5 !text-xs">
              Guardar fecha
            </button>
            <button onClick={() => setEditando(null)} className="text-xs text-muted hover:underline">
              Cancelar
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {r.cliente_telefono && (
              <button
                onClick={() => recordar(r)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#25d366] px-3 py-1.5 font-semibold text-white hover:bg-[#1ebe5a]"
              >
                <IconWhatsApp className="h-3.5 w-3.5" />
                Recordar
              </button>
            )}
            <button
              onClick={() => cambiarEstado(r.id, "agendada")}
              className="rounded-lg border border-line px-3 py-1.5 font-medium text-green-700 hover:bg-sand"
            >
              Ya agendó
            </button>
            <button
              onClick={() => {
                setEditando(r.id);
                setNuevaFecha(r.fecha_retoque);
              }}
              className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink hover:bg-sand"
            >
              Modificar fecha
            </button>
            <button
              onClick={() => cambiarEstado(r.id, "cancelada")}
              className="rounded-lg border border-line px-3 py-1.5 font-medium text-muted hover:bg-sand"
            >
              Cancelar
            </button>
            <button
              onClick={() => borrar(r.id)}
              className="rounded-lg px-3 py-1.5 font-medium text-rose-dark hover:underline"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <EncabezadoAdmin
        titulo="Seguimiento de retoques"
        descripcion="Avisos para recordar a las clientas su próximo retoque. Aparecen desde 3 días antes."
      />

      {/* Alertas */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-ink">
          Para contactar ahora
          {alertas.length > 0 && (
            <span className="rounded-full bg-rose px-2 py-0.5 text-xs font-semibold text-white">
              {alertas.length}
            </span>
          )}
        </h2>
        {alertas.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white/60 px-4 py-6 text-center text-sm text-muted">
            No hay retoques próximos en los siguientes 3 días.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {alertas.map((r) => (
              <Tarjeta key={r.id} r={r} alerta />
            ))}
          </div>
        )}
      </section>

      {/* Próximos */}
      {proximos.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl text-ink">Próximos retoques</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {proximos.map((r) => (
              <Tarjeta key={r.id} r={r} alerta={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
