"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/format";
import { guardarProducto, eliminarProducto } from "@/app/admin/productos/acciones";
import SubirImagen from "./SubirImagen";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface FormState {
  id?: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  costo: string;
  stock: string;
  referencia: string;
  disponible: boolean;
  destacado: boolean;
  activo: boolean;
  imagen_url: string;
}

const vacio: FormState = {
  nombre: "",
  categoria: "",
  descripcion: "",
  precio: "",
  costo: "",
  stock: "",
  referencia: "",
  disponible: true,
  destacado: false,
  activo: true,
  imagen_url: "",
};

export default function AdminProductos({ inicial }: { inicial: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function abrirEditar(p: any) {
    setError("");
    setForm({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria ?? "",
      descripcion: p.descripcion ?? "",
      precio: p.precio === null || p.precio === undefined ? "" : String(p.precio),
      costo: p.costo ? String(p.costo) : "",
      stock: p.stock ? String(p.stock) : "",
      referencia: p.referencia ?? "",
      disponible: !!p.disponible,
      destacado: !!p.destacado,
      activo: !!p.activo,
      imagen_url: p.imagen_url ?? "",
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError("");
    const res = await guardarProducto({
      id: form.id,
      nombre: form.nombre,
      categoria: form.categoria,
      descripcion: form.descripcion,
      precio: form.precio.trim() === "" ? null : Number(form.precio),
      costo: Number(form.costo) || 0,
      stock: Number(form.stock) || 0,
      referencia: form.referencia,
      disponible: form.disponible,
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
    if (!confirm(`¿Eliminar el producto "${nombre}"?`)) return;
    const res = await eliminarProducto(id);
    if (res.ok) router.refresh();
    else alert(res.error ?? "No se pudo eliminar.");
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Productos"
        descripcion="Administra los productos que se muestran en la tienda."
        accion={{ texto: "+ Nuevo producto", onClick: () => setForm({ ...vacio }) }}
      />

      {form && (
        <form
          onSubmit={guardar}
          className="mb-8 space-y-4 rounded-2xl border border-line bg-white/70 p-6"
        >
          <h3 className="font-serif text-xl text-ink">
            {form.id ? "Editar producto" : "Nuevo producto"}
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
              <label className="mb-1 block text-sm font-medium text-ink">Categoría</label>
              <input
                className={input}
                value={form.categoria}
                placeholder="Ej: Cuidado del color"
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              />
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Precio de venta (pesos)
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
                Costo (valor de compra)
              </label>
              <input
                type="number"
                min="0"
                className={input}
                placeholder="0"
                value={form.costo}
                onChange={(e) => setForm({ ...form, costo: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Stock (existencias)
              </label>
              <input
                type="number"
                min="0"
                className={input}
                placeholder="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Referencia / código
              </label>
              <input
                className={input}
                value={form.referencia}
                onChange={(e) => setForm({ ...form, referencia: e.target.value })}
              />
            </div>
          </div>

          {form.precio && form.costo && (
            <p className="text-sm text-muted">
              Ganancia por unidad:{" "}
              <strong className="text-green-700">
                {formatCOP(Number(form.precio) - Number(form.costo))}
              </strong>
            </p>
          )}

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
              Activo (visible)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.disponible}
                onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
              />
              Disponible (con stock)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
              />
              Destacado
            </label>
          </div>

          {error && <p className="text-sm text-rose-dark">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="btn-primario">
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <button type="button" onClick={() => setForm(null)} className="btn-secundario">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white/60">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-sand/50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inicial.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Aún no hay productos.
                </td>
              </tr>
            )}
            {inicial.map((p) => (
              <tr key={p.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{p.nombre}</td>
                <td className="px-4 py-3 text-muted">{p.categoria}</td>
                <td className="px-4 py-3">{formatCOP(p.precio)}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`font-medium ${
                      (p.stock ?? 0) <= 0
                        ? "text-rose-dark"
                        : (p.stock ?? 0) <= 3
                          ? "text-gold"
                          : "text-ink"
                    }`}
                  >
                    {p.stock ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                        p.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                    {!p.disponible && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[0.65rem] font-semibold text-gray-600">
                        Agotado
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => abrirEditar(p)}
                    className="mr-3 text-sm font-medium text-rose hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => borrar(p.id, p.nombre)}
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
