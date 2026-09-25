"use client";

import { useMemo, useState } from "react";
import { formatCOP } from "@/lib/format";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

const etiquetaMedio: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  datafono: "Datáfono",
};

function fechaBogota(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

export default function AdminReportes({
  ventas,
  citas,
  desde,
  hasta,
}: {
  ventas: any[];
  citas: any[];
  desde: string;
  hasta: string;
}) {
  const [descargando, setDescargando] = useState(false);

  const datos = useMemo(() => {
    const totalIngresos = ventas.reduce((a, v) => a + (v.total ?? 0), 0);

    const porMedio: Record<string, number> = {
      efectivo: 0,
      transferencia: 0,
      datafono: 0,
    };
    for (const v of ventas) porMedio[v.medio_pago] = (porMedio[v.medio_pago] ?? 0) + v.total;

    const porDiaMap = new Map<string, { total: number; count: number }>();
    for (const v of ventas) {
      const d = fechaBogota(v.fecha);
      const cur = porDiaMap.get(d) ?? { total: 0, count: 0 };
      cur.total += v.total;
      cur.count += 1;
      porDiaMap.set(d, cur);
    }
    const porDia = Array.from(porDiaMap.entries())
      .map(([fecha, x]) => ({ fecha, ...x }))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

    const vendidosMap = new Map<string, { cantidad: number; total: number }>();
    for (const v of ventas) {
      const k = v.descripcion || "—";
      const cur = vendidosMap.get(k) ?? { cantidad: 0, total: 0 };
      cur.cantidad += v.cantidad ?? 1;
      cur.total += v.total;
      vendidosMap.set(k, cur);
    }
    const masVendidos = Array.from(vendidosMap.entries())
      .map(([nombre, x]) => ({ nombre, ...x }))
      .sort((a, b) => b.total - a.total);

    const serviciosMap = new Map<string, number>();
    for (const c of citas)
      serviciosMap.set(c.servicio_nombre, (serviciosMap.get(c.servicio_nombre) ?? 0) + 1);
    const serviciosRealizados = Array.from(serviciosMap.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count);

    const clientasMap = new Map<string, { count: number; total: number }>();
    for (const v of ventas) {
      const k = (v.cliente_nombre || v.cliente_telefono || "").trim();
      if (!k) continue;
      const cur = clientasMap.get(k) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += v.total;
      clientasMap.set(k, cur);
    }
    const clientasFrecuentes = Array.from(clientasMap.entries())
      .map(([cliente, x]) => ({ cliente, ...x }))
      .sort((a, b) => b.total - a.total);

    return {
      totalIngresos,
      porMedio,
      porDia,
      masVendidos,
      serviciosRealizados,
      clientasFrecuentes,
    };
  }, [ventas, citas]);

  async function descargarExcel() {
    setDescargando(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const resumen = [
        ["Reporte de ventas"],
        ["Desde", desde, "Hasta", hasta],
        [],
        ["Total ingresos", datos.totalIngresos],
        ["Número de ventas", ventas.length],
        ["Citas atendidas", citas.length],
        [],
        ["Ingresos por medio de pago"],
        ["Efectivo", datos.porMedio.efectivo],
        ["Transferencia", datos.porMedio.transferencia],
        ["Datáfono", datos.porMedio.datafono],
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(resumen),
        "Resumen"
      );

      const detalle = [
        ["Fecha", "Cliente", "Teléfono", "Descripción", "Cantidad", "Total", "Medio de pago"],
        ...ventas.map((v) => [
          fechaBogota(v.fecha),
          v.cliente_nombre || "",
          v.cliente_telefono || "",
          v.descripcion,
          v.cantidad ?? 1,
          v.total,
          etiquetaMedio[v.medio_pago] ?? v.medio_pago,
        ]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detalle), "Ventas");

      const vendidos = [
        ["Servicio / Producto", "Cantidad", "Total"],
        ...datos.masVendidos.map((x) => [x.nombre, x.cantidad, x.total]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(vendidos), "Más vendidos");

      const clientas = [
        ["Cliente", "Compras", "Total"],
        ...datos.clientasFrecuentes.map((x) => [x.cliente, x.count, x.total]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(clientas), "Clientas");

      XLSX.writeFile(wb, `reporte_${desde}_a_${hasta}.xlsx`);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div>
      <EncabezadoAdmin
        titulo="Reportes"
        descripcion="Consulta e imprime tus ventas por período. Descarga todo en Excel."
      />

      {/* Filtro de fechas */}
      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white/60 p-4"
      >
        <div>
          <label className="mb-1 block text-xs text-muted">Desde</label>
          <input
            type="date"
            name="desde"
            defaultValue={desde}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Hasta</label>
          <input
            type="date"
            name="hasta"
            defaultValue={hasta}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="btn-secundario !py-2 !text-sm">
          Aplicar
        </button>
        <button
          type="button"
          onClick={descargarExcel}
          disabled={descargando || ventas.length === 0}
          className="btn-primario !py-2 !text-sm"
        >
          {descargando ? "Generando…" : "⬇ Descargar Excel"}
        </button>
      </form>

      {/* Resumen */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Total ingresos</p>
          <p className="mt-1 font-serif text-2xl text-ink">{formatCOP(datos.totalIngresos)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Ventas</p>
          <p className="mt-1 font-serif text-2xl text-ink">{ventas.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Citas atendidas</p>
          <p className="mt-1 font-serif text-2xl text-ink">{citas.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="mb-1 text-xs uppercase tracking-wider text-muted">Por medio (rango)</p>
          <ul className="space-y-0.5 text-xs text-ink">
            <li className="flex justify-between"><span>Efectivo</span><span>{formatCOP(datos.porMedio.efectivo)}</span></li>
            <li className="flex justify-between"><span>Transferencia</span><span>{formatCOP(datos.porMedio.transferencia)}</span></li>
            <li className="flex justify-between"><span>Datáfono</span><span>{formatCOP(datos.porMedio.datafono)}</span></li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Más vendidos */}
        <TablaReporte
          titulo="Más vendidos"
          columnas={["Servicio / Producto", "Cant.", "Total"]}
          filas={datos.masVendidos
            .slice(0, 10)
            .map((x) => [x.nombre, String(x.cantidad), formatCOP(x.total)])}
          vacio="Sin ventas en el período."
        />

        {/* Clientas frecuentes */}
        <TablaReporte
          titulo="Clientas más frecuentes"
          columnas={["Cliente", "Compras", "Total"]}
          filas={datos.clientasFrecuentes
            .slice(0, 10)
            .map((x) => [x.cliente, String(x.count), formatCOP(x.total)])}
          vacio="Sin datos de clientas."
        />

        {/* Servicios realizados */}
        <TablaReporte
          titulo="Servicios realizados (citas atendidas)"
          columnas={["Servicio", "Cantidad"]}
          filas={datos.serviciosRealizados
            .slice(0, 10)
            .map((x) => [x.nombre, String(x.count)])}
          vacio="Sin citas atendidas en el período."
        />

        {/* Ingresos por día */}
        <TablaReporte
          titulo="Ingresos por día"
          columnas={["Fecha", "Ventas", "Total"]}
          filas={datos.porDia.map((x) => [x.fecha, String(x.count), formatCOP(x.total)])}
          vacio="Sin ventas en el período."
        />
      </div>
    </div>
  );
}

function TablaReporte({
  titulo,
  columnas,
  filas,
  vacio,
}: {
  titulo: string;
  columnas: string[];
  filas: string[][];
  vacio: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white/60">
      <h3 className="border-b border-line bg-sand/40 px-4 py-3 font-serif text-lg text-ink">
        {titulo}
      </h3>
      {filas.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted">{vacio}</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr>
              {columnas.map((c, i) => (
                <th key={c} className={`px-4 py-2 ${i > 0 ? "text-right" : ""}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, r) => (
              <tr key={r} className="border-t border-line/50">
                {fila.map((celda, i) => (
                  <td
                    key={i}
                    className={`px-4 py-2 ${
                      i > 0 ? "text-right" : "font-medium text-ink"
                    } ${i > 0 ? "text-muted" : ""}`}
                  >
                    {celda}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
