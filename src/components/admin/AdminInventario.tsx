"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import { ajustarStock } from "@/app/admin/inventario/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminInventario({ productos }: { productos: any[] }) {
  const router = useRouter();
  const [deltas, setDeltas] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState<string | null>(null);

  const valorInventario = productos.reduce(
    (a, p) => a + (p.costo ?? 0) * (p.stock ?? 0),
    0
  );
  const unidades = productos.reduce((a, p) => a + (p.stock ?? 0), 0);

  async function aplicar(id: string) {
    const cant = Number(deltas[id]);
    if (!cant) return;
    setProcesando(id);
    const res = await ajustarStock(id, cant);
    setProcesando(null);
    if (res.ok) {
      setDeltas((prev) => ({ ...prev, [id]: "" }));
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  return (
    <div>
      <EncabezadoAdmin
        titulo="Inventario"
        descripcion="Stock, costos y ganancia de tus productos. El stock baja solo al vender."
      />

      {/* Resumen */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Valor del inventario (al costo)
          </p>
          <p className="mt-1 font-serif text-2xl text-ink">
            {formatCOP(valorInventario)}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Unidades en stock
          </p>
          <p className="mt-1 font-serif text-2xl text-ink">{unidades}</p>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">
        Para <strong>cargar</strong> los datos de un producto (nombre, costo,
        precio, foto) ve a{" "}
        <Link href="/admin/productos" className="font-medium text-rose hover:underline">
          Productos
        </Link>
        . Aquí ajustas las <strong>entradas</strong> (compras nuevas) o correcciones
        de stock.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-sand/50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 text-right">Costo</th>
              <th className="px-4 py-3 text-right">Precio venta</th>
              <th className="px-4 py-3 text-right">Ganancia/u.</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Entrada / salida</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  Aún no hay productos. Créalos en la sección Productos.
                </td>
              </tr>
            )}
            {productos.map((p) => {
              const ganancia = (p.precio ?? 0) - (p.costo ?? 0);
              const stock = p.stock ?? 0;
              return (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">
                    {p.nombre}
                    {p.activo === false && (
                      <span className="ml-2 text-xs text-muted">(inactivo)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {formatCOP(p.costo ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCOP(p.precio)}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    {formatCOP(ganancia)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-semibold ${
                        stock <= 0
                          ? "text-rose-dark"
                          : stock <= 3
                            ? "text-gold"
                            : "text-ink"
                      }`}
                    >
                      {stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {formatCOP((p.costo ?? 0) * stock)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={deltas[p.id] ?? ""}
                        onChange={(e) =>
                          setDeltas((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        placeholder="+/-"
                        className="w-20 rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                      />
                      <button
                        onClick={() => aplicar(p.id)}
                        disabled={procesando === p.id}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-rose hover:bg-sand"
                      >
                        Aplicar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted">
        En “Entrada / salida” escribe cuántas unidades entraron (ej: <strong>10</strong>)
        o salieron por corrección (ej: <strong>-2</strong>) y presiona Aplicar.
      </p>
    </div>
  );
}
