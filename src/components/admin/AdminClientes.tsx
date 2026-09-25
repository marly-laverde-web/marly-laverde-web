"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { site, waLinkTelefono } from "@/data/config";
import { formatCOP } from "@/lib/format";
import { guardarCliente, eliminarCliente } from "@/app/admin/clientes/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";
import { IconWhatsApp } from "@/components/Icons";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface FormState {
  id?: string;
  nombre: string;
  telefono: string;
  fecha_nacimiento: string;
  notas: string;
}

const vacio: FormState = { nombre: "", telefono: "", fecha_nacimiento: "", notas: "" };

function fechaBogota(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

function cumpleLegible(fecha: string | null) {
  if (!fecha) return "—";
  const [, m, d] = fecha.split("-");
  return `${d}/${m}`;
}

export default function AdminClientes({
  clientes,
  citas,
  ventas,
  retoques,
}: {
  clientes: any[];
  citas: any[];
  ventas: any[];
  retoques: any[];
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function citasDe(c: any) {
    return c.telefono
      ? citas.filter((x) => x.cliente_telefono && x.cliente_telefono === c.telefono)
      : [];
  }
  function ventasDe(c: any) {
    return ventas.filter(
      (v) =>
        (c.telefono && v.cliente_telefono && v.cliente_telefono === c.telefono) ||
        (v.cliente_nombre &&
          v.cliente_nombre.trim().toLowerCase() === c.nombre.trim().toLowerCase())
    );
  }
  function retoquesDe(c: any) {
    return c.telefono
      ? retoques.filter((r) => r.cliente_telefono === c.telefono)
      : [];
  }
  function totalDe(c: any) {
    return ventasDe(c).reduce((a, v) => a + (v.total ?? 0), 0);
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.telefono ?? "").includes(q)
    );
  }, [clientes, busqueda]);

  const seleccionado = clientes.find((c) => c.id === seleccionadoId) || null;

  function abrirEditar(c: any) {
    setError("");
    setForm({
      id: c.id,
      nombre: c.nombre,
      telefono: c.telefono ?? "",
      fecha_nacimiento: c.fecha_nacimiento ?? "",
      notas: c.notas ?? "",
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError("");
    const res = await guardarCliente({
      id: form.id,
      nombre: form.nombre,
      telefono: form.telefono,
      fecha_nacimiento: form.fecha_nacimiento || null,
      notas: form.notas,
    });
    setGuardando(false);
    if (res.ok) {
      setForm(null);
      router.refresh();
    } else {
      setError(res.error ?? "Error al guardar.");
    }
  }

  async function borrar(c: any) {
    if (!confirm(`¿Eliminar la ficha de "${c.nombre}"? (No borra sus citas ni ventas)`)) return;
    const res = await eliminarCliente(c.id);
    if (res.ok) {
      if (seleccionadoId === c.id) setSeleccionadoId(null);
      router.refresh();
    } else alert(res.error);
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Clientas"
        descripcion="Fichas con historial, cumpleaños y observaciones."
        accion={{ texto: "+ Nueva clienta", onClick: () => setForm({ ...vacio }) }}
      />

      {/* Formulario */}
      {form && (
        <form onSubmit={guardar} className="mb-6 space-y-4 rounded-2xl border border-line bg-white/70 p-6">
          <h3 className="font-serif text-xl text-ink">
            {form.id ? "Editar clienta" : "Nueva clienta"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Nombre *</label>
              <input className={input} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Teléfono</label>
              <input className={input} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 3001234567" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Cumpleaños</label>
              <input type="date" className={input} value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Observaciones</label>
              <input className={input} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Preferencias, alergias, etc." />
            </div>
          </div>
          {error && <p className="text-sm text-rose-dark">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="btn-primario">
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <button type="button" onClick={() => setForm(null)} className="btn-secundario">Cancelar</button>
          </div>
        </form>
      )}

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o teléfono…"
        className={`${input} mb-4`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Lista */}
        <div className="space-y-2">
          {filtradas.length === 0 && (
            <p className="rounded-2xl border border-line bg-white/60 px-4 py-6 text-center text-sm text-muted">
              No hay clientas registradas.
            </p>
          )}
          {filtradas.map((c) => (
            <button
              key={c.id}
              onClick={() => setSeleccionadoId(c.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                seleccionadoId === c.id
                  ? "border-rose bg-rose-soft/40"
                  : "border-line bg-white/60 hover:border-rose/40"
              }`}
            >
              <div>
                <p className="font-medium text-ink">{c.nombre}</p>
                <p className="text-xs text-muted">{c.telefono || "sin teléfono"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-rose-dark">{formatCOP(totalDe(c))}</p>
                <p className="text-xs text-muted">{citasDe(c).length} citas</p>
              </div>
            </button>
          ))}
        </div>

        {/* Ficha */}
        <div>
          {seleccionado ? (
            <div className="space-y-5 rounded-2xl border border-line bg-white/60 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-2xl text-ink">{seleccionado.nombre}</h3>
                  <p className="text-sm text-muted">{seleccionado.telefono || "sin teléfono"}</p>
                </div>
                <div className="flex gap-2">
                  {seleccionado.telefono && (
                    <a
                      href={waLinkTelefono(seleccionado.telefono, `¡Hola ${seleccionado.nombre}! Te saludamos de ${site.nombre}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#25d366] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <IconWhatsApp className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                  <button onClick={() => abrirEditar(seleccionado)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-rose hover:bg-sand">Editar</button>
                  <button onClick={() => borrar(seleccionado)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-dark hover:underline">Eliminar</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-sand/40 p-4 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted">Cumpleaños</p>
                  <p className="font-medium text-ink">🎂 {cumpleLegible(seleccionado.fecha_nacimiento)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Citas</p>
                  <p className="font-medium text-ink">{citasDe(seleccionado).length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Total gastado</p>
                  <p className="font-medium text-rose-dark">{formatCOP(totalDe(seleccionado))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Retoques activos</p>
                  <p className="font-medium text-ink">{retoquesDe(seleccionado).length}</p>
                </div>
              </div>

              {seleccionado.notas && (
                <p className="rounded-lg bg-white/70 px-4 py-2 text-sm text-muted">
                  📝 {seleccionado.notas}
                </p>
              )}

              {/* Historial de citas */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Historial de citas</h4>
                {citasDe(seleccionado).length === 0 ? (
                  <p className="text-sm text-muted">Sin citas registradas.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {citasDe(seleccionado).slice(0, 12).map((c: any, i: number) => (
                      <li key={i} className="flex justify-between border-b border-line/40 py-1">
                        <span className="text-ink">{c.servicio_nombre}</span>
                        <span className="text-muted">{c.fecha} · {c.hora_inicio?.slice(0, 5)} · {c.estado}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Compras */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Compras</h4>
                {ventasDe(seleccionado).length === 0 ? (
                  <p className="text-sm text-muted">Sin compras registradas.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {ventasDe(seleccionado).slice(0, 12).map((v: any, i: number) => (
                      <li key={i} className="flex justify-between border-b border-line/40 py-1">
                        <span className="text-ink">{v.descripcion}</span>
                        <span className="text-muted">{fechaBogota(v.fecha)} · {formatCOP(v.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-line bg-white/40 px-6 py-16 text-center text-sm text-muted">
              Selecciona una clienta para ver su ficha completa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
