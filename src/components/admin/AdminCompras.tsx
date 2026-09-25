"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/format";
import { registrarCompra, eliminarCompra } from "@/app/admin/compras/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CATEGORIAS = [
  "Insumos",
  "Productos para venta",
  "Herramientas / equipos",
  "Servicios públicos",
  "Arriendo",
  "Publicidad",
  "Otros",
];

export default function AdminCompras({
  compras,
  hoy,
}: {
  compras: any[];
  hoy: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(hoy);
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const totalMes = compras.reduce((a, c) => a + (c.valor ?? 0), 0);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    const res = await registrarCompra({
      fecha,
      descripcion,
      categoria,
      valor: Number(valor) || 0,
      notas,
    });
    setGuardando(false);
    if (res.ok) {
      setDescripcion("");
      setCategoria("");
      setValor("");
      setNotas("");
      setFecha(hoy);
      router.refresh();
    } else {
      setError(res.error ?? "Error al registrar.");
    }
  }

  async function borrar(id: string) {
    if (!confirm("¿Eliminar esta compra?")) return;
    await eliminarCompra(id);
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Compras"
        descripcion="Registra los costos y gastos (insumos, productos, servicios, etc.). Se usan para calcular la utilidad en Reportes."
        accion={{
          texto: abierto ? "Cerrar" : "+ Registrar compra",
          onClick: () => setAbierto((v) => !v),
        }}
      />

      {/* Resumen */}
      <div className="mb-6 rounded-2xl border border-line bg-white/70 p-5 sm:max-w-xs">
        <p className="text-xs uppercase tracking-wider text-muted">
          Compras del mes
        </p>
        <p className="mt-1 font-serif text-2xl text-ink">{formatCOP(totalMes)}</p>
      </div>

      {/* Formulario */}
      {abierto && (
        <form
          onSubmit={registrar}
          className="mb-6 space-y-4 rounded-2xl border border-line bg-white/70 p-6"
        >
          <h3 className="font-serif text-xl text-ink">Registrar compra</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Fecha *</label>
              <input
                type="date"
                className={input}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Valor (pesos) *
              </label>
              <input
                type="number"
                min="0"
                className={input}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-ink">
                ¿Qué se compró? *
              </label>
              <input
                className={input}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Tintes, guantes, papel aluminio…"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Categoría</label>
              <input
                className={input}
                list="categorias-compra"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Opcional"
              />
              <datalist id="categorias-compra">
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
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
            {guardando ? "Guardando…" : "Registrar compra"}
          </button>
        </form>
      )}

      {/* Lista */}
      <h3 className="mb-3 font-serif text-lg text-ink">Compras del mes</h3>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white/60">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-sand/50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No hay compras registradas este mes.
                </td>
              </tr>
            )}
            {compras.map((c) => (
              <tr key={c.id} className="border-b border-line/60 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted">{c.fecha}</td>
                <td className="px-4 py-3 font-medium text-ink">{c.descripcion}</td>
                <td className="px-4 py-3 text-muted">{c.categoria || "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatCOP(c.valor)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => borrar(c.id)}
                    className="text-xs font-medium text-rose-dark hover:underline"
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
