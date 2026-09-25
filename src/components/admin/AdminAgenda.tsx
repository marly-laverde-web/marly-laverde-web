"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { site, waLink } from "@/data/config";
import { formatDuracion } from "@/lib/format";
import { ESTADOS_CITA, NOMBRES_DIAS, type EstadoCita } from "@/lib/tipos";
import {
  crearCitaAdmin,
  actualizarEstadoCita,
  eliminarCita,
  finalizarCita,
} from "@/app/admin/agenda/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";
import { IconWhatsApp } from "@/components/Icons";

/* eslint-disable @typescript-eslint/no-explicit-any */

function hhmm(t: string) {
  return t?.slice(0, 5) ?? "";
}

function calcularFin(hora: string, dur: number) {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + dur;
  const H = Math.floor(total / 60) % 24;
  const M = total % 60;
  return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
}

function sumarDias(fecha: string, n: number) {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().split("T")[0];
}

function fechaLegible(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${NOMBRES_DIAS[dt.getUTCDay()]} ${d} / ${m} / ${y}`;
}

export default function AdminAgenda({
  fecha,
  citas,
  servicios,
}: {
  fecha: string;
  citas: any[];
  servicios: any[];
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [servicioId, setServicioId] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [hora, setHora] = useState("");
  const [estado, setEstado] = useState<EstadoCita>("confirmada");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Finalización de cita + próximo retoque
  const [finalizando, setFinalizando] = useState<string | null>(null);
  const [fechaRetoque, setFechaRetoque] = useState("");
  const [conRetoque, setConRetoque] = useState(true);
  const [notasRetoque, setNotasRetoque] = useState("");

  function abrirFinalizar(c: any) {
    const servicio = servicios.find((s) => s.id === c.servicio_id);
    const intervalo = servicio?.intervalo_retoque_dias;
    setFinalizando(c.id);
    setConRetoque(Boolean(intervalo));
    setFechaRetoque(intervalo ? sumarDias(c.fecha, intervalo) : "");
    setNotasRetoque("");
  }

  async function confirmarFinalizar(c: any) {
    const res = await finalizarCita(
      c.id,
      conRetoque && fechaRetoque ? fechaRetoque : null,
      notasRetoque
    );
    if (res.ok) {
      setFinalizando(null);
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  function irAFecha(f: string) {
    router.push(`/admin/agenda?fecha=${f}`);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    const res = await crearCitaAdmin({
      servicioId,
      fecha,
      hora,
      nombre,
      telefono,
      estado,
      notas,
    });
    setGuardando(false);
    if (res.ok) {
      setMostrarForm(false);
      setServicioId("");
      setNombre("");
      setTelefono("");
      setHora("");
      setNotas("");
      router.refresh();
    } else {
      setError(res.error ?? "Error al crear la cita.");
    }
  }

  async function cambiarEstado(id: string, nuevo: EstadoCita) {
    await actualizarEstadoCita(id, nuevo);
    router.refresh();
  }

  async function borrar(id: string) {
    if (!confirm("¿Eliminar esta cita?")) return;
    await eliminarCita(id);
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  const categorias = Array.from(new Set(servicios.map((s) => s.categoria)));

  return (
    <div>
      <EncabezadoAdmin
        titulo="Agenda"
        descripcion="Consulta y gestiona las citas del día."
        accion={{
          texto: mostrarForm ? "Cerrar" : "+ Nueva cita",
          onClick: () => setMostrarForm((v) => !v),
        }}
      />

      {/* Navegación de fecha */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/60 p-4">
        <button onClick={() => irAFecha(sumarDias(fecha, -1))} className="btn-secundario !px-3 !py-2 !text-sm">
          ← Anterior
        </button>
        <input
          type="date"
          value={fecha}
          onChange={(e) => irAFecha(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
        />
        <button onClick={() => irAFecha(sumarDias(fecha, 1))} className="btn-secundario !px-3 !py-2 !text-sm">
          Siguiente →
        </button>
        <span className="ml-auto font-serif text-lg text-ink">
          {fechaLegible(fecha)}
        </span>
      </div>

      {/* Formulario nueva cita */}
      {mostrarForm && (
        <form
          onSubmit={crear}
          className="mb-6 space-y-4 rounded-2xl border border-line bg-white/70 p-6"
        >
          <h3 className="font-serif text-xl text-ink">Nueva cita — {fechaLegible(fecha)}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Servicio *</label>
              <select
                className={input}
                value={servicioId}
                onChange={(e) => setServicioId(e.target.value)}
                required
              >
                <option value="">Selecciona…</option>
                {categorias.map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {servicios
                      .filter((s) => s.categoria === cat)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({formatDuracion(s.duracion_min)})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Hora *</label>
              <input
                type="time"
                className={input}
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Cliente *</label>
              <input
                className={input}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Teléfono</label>
              <input
                className={input}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Estado</label>
              <select
                className={input}
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoCita)}
              >
                {ESTADOS_CITA.map((es) => (
                  <option key={es.valor} value={es.valor}>
                    {es.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Notas</label>
              <input
                className={input}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-rose-dark">{error}</p>}
          <button type="submit" disabled={guardando} className="btn-primario">
            {guardando ? "Guardando…" : "Crear cita"}
          </button>
        </form>
      )}

      {/* Lista de citas */}
      {citas.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white/60 px-4 py-10 text-center text-muted">
          No hay citas para este día.
        </p>
      ) : (
        <div className="space-y-3">
          {citas.map((c) => {
            const infoEstado = ESTADOS_CITA.find((e) => e.valor === c.estado);
            const servicio = servicios.find((s) => s.id === c.servicio_id);
            const precio = servicio?.precio ?? "";
            const cobroUrl = `/admin/ventas?cita=${c.id}&cliente=${encodeURIComponent(
              c.cliente_nombre
            )}&tel=${encodeURIComponent(c.cliente_telefono || "")}&desc=${encodeURIComponent(
              c.servicio_nombre
            )}${precio !== "" && precio !== null ? `&total=${precio}` : ""}`;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-white/70 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-28 shrink-0">
                  <p className="font-serif text-lg text-ink">{hhmm(c.hora_inicio)}</p>
                  <p className="text-xs text-muted">
                    a {calcularFin(c.hora_inicio, c.duracion_min)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink">{c.cliente_nombre}</p>
                  <p className="text-sm text-muted">{c.servicio_nombre}</p>
                  {c.notas && <p className="mt-1 text-xs text-muted">📝 {c.notas}</p>}
                  {c.cliente_telefono && (
                    <a
                      href={waLink(
                        `¡Hola ${c.cliente_nombre}! Te escribimos de ${site.nombre} sobre tu cita.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#25d366]"
                    >
                      <IconWhatsApp className="h-3.5 w-3.5" />
                      {c.cliente_telefono}
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <select
                    value={c.estado}
                    onChange={(e) => cambiarEstado(c.id, e.target.value as EstadoCita)}
                    className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                    style={{ color: infoEstado?.color }}
                  >
                    {ESTADOS_CITA.map((es) => (
                      <option key={es.valor} value={es.valor}>
                        {es.etiqueta}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {c.estado !== "atendida" && c.estado !== "cancelada" && (
                      <button
                        onClick={() => abrirFinalizar(c)}
                        className="font-semibold text-green-700 hover:underline"
                      >
                        Dar por terminado
                      </button>
                    )}
                    <Link href={cobroUrl} className="font-medium text-rose hover:underline">
                      Registrar cobro
                    </Link>
                    <button
                      onClick={() => borrar(c.id)}
                      className="font-medium text-rose-dark hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                </div>

                {finalizando === c.id && (
                  <div className="mt-3 rounded-xl border border-green-200 bg-green-50/60 p-4">
                    <p className="mb-2 font-medium text-ink">
                      Finalizar servicio de {c.cliente_nombre}
                    </p>
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={conRetoque}
                        onChange={(e) => setConRetoque(e.target.checked)}
                      />
                      Programar próximo retoque
                    </label>
                    {conRetoque && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-muted">
                            Fecha del próximo retoque
                          </label>
                          <input
                            type="date"
                            value={fechaRetoque}
                            min={fecha}
                            onChange={(e) => setFechaRetoque(e.target.value)}
                            className={input}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-muted">
                            Nota (opcional)
                          </label>
                          <input
                            value={notasRetoque}
                            onChange={(e) => setNotasRetoque(e.target.value)}
                            className={input}
                            placeholder="Ej: retoque de raíz"
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => confirmarFinalizar(c)}
                        className="btn-primario !py-2 !text-xs"
                      >
                        Confirmar y finalizar
                      </button>
                      <button
                        onClick={() => setFinalizando(null)}
                        className="text-xs text-muted hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
