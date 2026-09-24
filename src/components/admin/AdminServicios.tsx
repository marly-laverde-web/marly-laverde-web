"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoriasServicios } from "@/data/servicios";
import { formatCOP, formatDuracion } from "@/lib/format";
import { guardarServicio, eliminarServicio } from "@/app/admin/servicios/acciones";
import SubirImagen from "./SubirImagen";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface FormState {
  id?: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  duracion_min: string;
  intervalo_retoque_dias: string;
  destacado: boolean;
  activo: boolean;
  imagen_url: string;
}

const vacio: FormState = {
  nombre: "",
  categoria: "",
  descripcion: "",
  precio: "",
  duracion_min: "60",
  intervalo_retoque_dias: "",
  destacado: false,
  activo: true,
  imagen_url: "",
};

export default function AdminServicios({ inicial }: { inicial: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function abrirNuevo() {
    setError("");
    setForm({ ...vacio });
  }

  function abrirEditar(s: any) {
    setError("");
    setForm({
      id: s.id,
      nombre: s.nombre,
      categoria: s.categoria,
      descripcion: s.descripcion ?? "",
      precio: s.precio === null || s.precio === undefined ? "" : String(s.precio),
      duracion_min: String(s.duracion_min ?? 60),
      intervalo_retoque_dias:
        s.intervalo_retoque_dias === null || s.intervalo_retoque_dias === undefined
          ? ""
          : String(s.intervalo_retoque_dias),
      destacado: !!s.destacado,
      activo: !!s.activo,
      imagen_url: s.imagen_url ?? "",
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError("");
    const res = await guardarServicio({
      id: form.id,
      nombre: form.nombre,
      categoria: form.categoria,
      descripcion: form.descripcion,
      precio: form.precio.trim() === "" ? null : Number(form.precio),
      duracion_min: Number(form.duracion_min) || 60,
      intervalo_retoque_dias:
        form.intervalo_retoque_dias.trim() === ""
          ? null
          : Number(form.intervalo_retoque_dias),
      destacado: form.destacado,
      activo: form.activo,
      imagen_url: form.imagen_url || null,
    });
    setGuardando(false);
    if (res.ok) {
      setForm(null);
      router.refresh();
    } else {
      setError(res.error ?? "Error al guardar.");
    }
  }

  async function borrar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar el servicio "${nombre}"? Esta acción no se puede deshacer.`))
      return;
    const res = await eliminarServicio(id);
    if (res.ok) router.refresh();
    else alert(res.error ?? "No se pudo eliminar.");
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Servicios"
        descripcion="Crea y edita los servicios que verán las clientas. La duración define el espacio que ocupa en la agenda."
        accion={{ texto: "+ Nuevo servicio", onClick: abrirNuevo }}
      />

      {/* Formulario */}
      {form && (
        <form
          onSubmit={guardar}
          className="mb-8 space-y-4 rounded-2xl border border-line bg-white/70 p-6"
        >
          <h3 className="font-serif text-xl text-ink">
            {form.id ? "Editar servicio" : "Nuevo servicio"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Nombre *</label>
              <input
                className={input}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Categoría *</label>
              <input
                className={input}
                list="categorias-servicio"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                required
              />
              <datalist id="categorias-servicio">
                {categoriasServicios.map((c) => (
                  <option key={c.nombre} value={c.nombre} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Descripción</label>
            <textarea
              className={input}
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Precio (pesos)
              </label>
              <input
                type="number"
                min="0"
                className={input}
                placeholder="Vacío = Consultar"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Duración (min) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                className={input}
                value={form.duracion_min}
                onChange={(e) => setForm({ ...form, duracion_min: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Retoque (días)
              </label>
              <input
                type="number"
                min="0"
                className={input}
                placeholder="Opcional"
                value={form.intervalo_retoque_dias}
                onChange={(e) =>
                  setForm({ ...form, intervalo_retoque_dias: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Foto</label>
            <SubirImagen
              valor={form.imagen_url}
              onChange={(url) => setForm({ ...form, imagen_url: url })}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Activo (visible en el sitio)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
              />
              Destacado (aparece en el inicio)
            </label>
          </div>

          {error && <p className="text-sm text-rose-dark">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="btn-primario">
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="btn-secundario"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-sand/50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Duración</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inicial.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Aún no hay servicios. Crea el primero.
                </td>
              </tr>
            )}
            {inicial.map((s) => (
              <tr key={s.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{s.nombre}</td>
                <td className="px-4 py-3 text-muted">{s.categoria}</td>
                <td className="px-4 py-3">{formatCOP(s.precio)}</td>
                <td className="px-4 py-3">{formatDuracion(s.duracion_min)}</td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                        s.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {s.activo ? "Activo" : "Inactivo"}
                    </span>
                    {s.destacado && (
                      <span className="rounded-full bg-rose-soft px-2 py-0.5 text-[0.65rem] font-semibold text-rose-dark">
                        Destacado
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => abrirEditar(s)}
                    className="mr-3 text-sm font-medium text-rose hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => borrar(s.id, s.nombre)}
                    className="text-sm font-medium text-rose-dark hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
