"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NOMBRES_DIAS, type Horario } from "@/lib/tipos";
import {
  guardarHorarios,
  guardarConfig,
  agregarBloqueo,
  eliminarBloqueo,
  guardarProfesional,
  eliminarProfesional,
} from "@/app/admin/configuracion/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminConfiguracion({
  horarios: horariosIniciales,
  intervalo: intervaloInicial,
  anticipacion: anticipacionInicial,
  bloqueos,
  profesionales,
}: {
  horarios: Horario[];
  intervalo: number;
  anticipacion: number;
  bloqueos: any[];
  profesionales: any[];
}) {
  const router = useRouter();
  const [horarios, setHorarios] = useState<Horario[]>(horariosIniciales);
  const [intervalo, setIntervalo] = useState(String(intervaloInicial));
  const [anticipacion, setAnticipacion] = useState(String(anticipacionInicial));
  const [msg, setMsg] = useState("");

  // Profesionales
  const [nuevoProf, setNuevoProf] = useState("");

  async function agregarProfesional(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoProf.trim()) return;
    const res = await guardarProfesional({ nombre: nuevoProf, activo: true });
    if (res.ok) {
      setNuevoProf("");
      router.refresh();
    } else alert(res.error);
  }
  async function alternarProfesional(p: any) {
    await guardarProfesional({ id: p.id, nombre: p.nombre, activo: !p.activo });
    router.refresh();
  }
  async function borrarProfesional(id: string, nombre: string) {
    if (!confirm(`¿Eliminar al profesional "${nombre}"?`)) return;
    const res = await eliminarProfesional(id);
    if (res.ok) router.refresh();
    else alert(res.error);
  }

  // Bloqueos
  const [bFecha, setBFecha] = useState("");
  const [bInicio, setBInicio] = useState("");
  const [bFin, setBFin] = useState("");
  const [bMotivo, setBMotivo] = useState("");

  function actualizarHorario(dia: number, cambios: Partial<Horario>) {
    setHorarios((prev) =>
      prev.map((h) => (h.dia_semana === dia ? { ...h, ...cambios } : h))
    );
  }

  async function guardarTodo() {
    setMsg("");
    const r1 = await guardarHorarios(horarios);
    const r2 = await guardarConfig(Number(intervalo), Number(anticipacion));
    if (r1.ok && r2.ok) {
      setMsg("Cambios guardados correctamente.");
      router.refresh();
    } else {
      setMsg(r1.error || r2.error || "Error al guardar.");
    }
  }

  async function nuevoBloqueo(e: React.FormEvent) {
    e.preventDefault();
    const res = await agregarBloqueo({
      fecha: bFecha,
      hora_inicio: bInicio || null,
      hora_fin: bFin || null,
      motivo: bMotivo,
    });
    if (res.ok) {
      setBFecha("");
      setBInicio("");
      setBFin("");
      setBMotivo("");
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  async function quitarBloqueo(id: string) {
    if (!confirm("¿Eliminar este bloqueo?")) return;
    await eliminarBloqueo(id);
    router.refresh();
  }

  const input =
    "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Configuración"
        descripcion="Define el horario de atención, los profesionales y cómo se ofrecen las citas."
      />

      {/* Profesionales */}
      <div className="mb-8 rounded-2xl border border-line bg-white/70 p-6">
        <h3 className="mb-1 font-serif text-xl text-ink">Profesionales</h3>
        <p className="mb-4 text-sm text-muted">
          Las personas que realizan los servicios. Al cobrar podrás elegir quién
          lo hizo, y en Reportes verás el acumulado de cada una.
        </p>

        <form onSubmit={agregarProfesional} className="mb-4 flex flex-wrap gap-2">
          <input
            value={nuevoProf}
            onChange={(e) => setNuevoProf(e.target.value)}
            placeholder="Nombre del profesional"
            className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
          <button type="submit" className="btn-primario !py-2 !text-sm">
            Agregar
          </button>
        </form>

        {profesionales.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay profesionales.</p>
        ) : (
          <ul className="space-y-2">
            {profesionales.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-sand/40 px-4 py-2 text-sm"
              >
                <span className="font-medium text-ink">
                  {p.nombre}
                  {!p.activo && <span className="ml-2 text-xs text-muted">(inactivo)</span>}
                </span>
                <span className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => alternarProfesional(p)}
                    className="font-medium text-rose hover:underline"
                  >
                    {p.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => borrarProfesional(p.id, p.nombre)}
                    className="font-medium text-rose-dark hover:underline"
                  >
                    Eliminar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Horario semanal */}
      <div className="mb-8 rounded-2xl border border-line bg-white/70 p-6">
        <h3 className="mb-4 font-serif text-xl text-ink">Horario de atención</h3>
        <div className="space-y-2">
          {horarios.map((h) => (
            <div
              key={h.dia_semana}
              className="flex flex-wrap items-center gap-3 border-b border-line/50 py-2 last:border-0"
            >
              <label className="flex w-40 items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={h.abierto}
                  onChange={(e) =>
                    actualizarHorario(h.dia_semana, { abierto: e.target.checked })
                  }
                />
                <span className="font-medium">{NOMBRES_DIAS[h.dia_semana]}</span>
              </label>
              {h.abierto ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    className={input}
                    value={h.hora_inicio}
                    onChange={(e) =>
                      actualizarHorario(h.dia_semana, { hora_inicio: e.target.value })
                    }
                  />
                  <span className="text-muted">a</span>
                  <input
                    type="time"
                    className={input}
                    value={h.hora_fin}
                    onChange={(e) =>
                      actualizarHorario(h.dia_semana, { hora_fin: e.target.value })
                    }
                  />
                </div>
              ) : (
                <span className="text-sm text-muted">Cerrado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parámetros de la agenda */}
      <div className="mb-8 rounded-2xl border border-line bg-white/70 p-6">
        <h3 className="mb-4 font-serif text-xl text-ink">Parámetros de la agenda</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Intervalo entre horarios
            </label>
            <select
              className={`${input} w-full`}
              value={intervalo}
              onChange={(e) => setIntervalo(e.target.value)}
            >
              <option value="15">Cada 15 minutos</option>
              <option value="20">Cada 20 minutos</option>
              <option value="30">Cada 30 minutos</option>
              <option value="60">Cada hora</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Anticipación mínima (horas)
            </label>
            <input
              type="number"
              min="0"
              className={`${input} w-full`}
              value={anticipacion}
              onChange={(e) => setAnticipacion(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">
              Cuántas horas antes, como mínimo, puede reservar una clienta.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <button onClick={guardarTodo} className="btn-primario">
          Guardar cambios
        </button>
        {msg && <span className="text-sm text-green-700">{msg}</span>}
      </div>

      {/* Bloqueos */}
      <div className="rounded-2xl border border-line bg-white/70 p-6">
        <h3 className="mb-1 font-serif text-xl text-ink">Días u horas bloqueadas</h3>
        <p className="mb-4 text-sm text-muted">
          Festivos, vacaciones o momentos no disponibles. Si dejas las horas
          vacías, se bloquea el día completo.
        </p>

        <form onSubmit={nuevoBloqueo} className="mb-5 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Fecha</label>
            <input type="date" className={input} value={bFecha} onChange={(e) => setBFecha(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Desde (opcional)</label>
            <input type="time" className={input} value={bInicio} onChange={(e) => setBInicio(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Hasta (opcional)</label>
            <input type="time" className={input} value={bFin} onChange={(e) => setBFin(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted">Motivo</label>
            <input className={`${input} w-full`} value={bMotivo} onChange={(e) => setBMotivo(e.target.value)} placeholder="Ej: Festivo" />
          </div>
          <button type="submit" className="btn-secundario !py-2 !text-sm">
            Agregar
          </button>
        </form>

        {bloqueos.length === 0 ? (
          <p className="text-sm text-muted">No hay bloqueos programados.</p>
        ) : (
          <ul className="space-y-2">
            {bloqueos.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg bg-sand/50 px-4 py-2 text-sm"
              >
                <span className="text-ink">
                  <strong>{b.fecha}</strong>
                  {b.hora_inicio
                    ? ` · ${b.hora_inicio.slice(0, 5)} a ${b.hora_fin?.slice(0, 5) ?? ""}`
                    : " · Todo el día"}
                  {b.motivo ? ` — ${b.motivo}` : ""}
                </span>
                <button
                  onClick={() => quitarBloqueo(b.id)}
                  className="text-xs font-medium text-rose-dark hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
