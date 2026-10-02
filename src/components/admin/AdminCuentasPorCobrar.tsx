"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/format";
import { MEDIOS_PAGO, ETIQUETA_MEDIO, type MedioPago } from "@/lib/tipos";
import { waLinkTelefono } from "@/data/config";
import { marcarCreditoPagado } from "@/app/admin/ventas/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

function diasHasta(fecha: string | null, hoy: string) {
  if (!fecha) return 9999;
  const [ay, am, ad] = fecha.split("-").map(Number);
  const [hy, hm, hd] = hoy.split("-").map(Number);
  return Math.round(
    (Date.UTC(ay, am - 1, ad) - Date.UTC(hy, hm - 1, hd)) / 86400000
  );
}

interface Grupo {
  clave: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha_pago_credito: string | null;
  items: any[];
  total: number;
  dias: number;
}

export default function AdminCuentasPorCobrar({
  ventas,
  hoy,
}: {
  ventas: any[];
  hoy: string;
}) {
  const router = useRouter();
  const [verPagadas, setVerPagadas] = useState(false);
  const [pagando, setPagando] = useState<string | null>(null);
  const [medio, setMedio] = useState<MedioPago>("efectivo");
  const [fechaPago, setFechaPago] = useState(hoy);

  // Agrupar los ítems de una misma deuda (misma cita, o misma clienta + fecha)
  function agrupar(filas: any[]): Grupo[] {
    const mapa = new Map<string, Grupo>();
    for (const v of filas) {
      const clave =
        v.cita_id ?? `${v.cliente_nombre}__${v.fecha_pago_credito ?? "s/f"}`;
      let g = mapa.get(clave);
      if (!g) {
        g = {
          clave,
          cliente_nombre: v.cliente_nombre ?? "Clienta",
          cliente_telefono: v.cliente_telefono ?? "",
          fecha_pago_credito: v.fecha_pago_credito ?? null,
          items: [],
          total: 0,
          dias: diasHasta(v.fecha_pago_credito ?? null, hoy),
        };
        mapa.set(clave, g);
      }
      g.items.push(v);
      g.total += v.total ?? 0;
    }
    return [...mapa.values()];
  }

  const pendientes = useMemo(
    () => agrupar(ventas.filter((v) => !v.credito_pagado)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ventas, hoy]
  );
  const pagadas = useMemo(
    () => agrupar(ventas.filter((v) => v.credito_pagado)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ventas, hoy]
  );

  pendientes.sort((a, b) => a.dias - b.dias);

  const totalPorCobrar = pendientes.reduce((s, g) => s + g.total, 0);
  const nPendientes = pendientes.length;
  const nVencidas = pendientes.filter((g) => g.dias < 0).length;

  function semaforo(g: Grupo): { texto: string; clase: string } {
    if (!g.fecha_pago_credito)
      return { texto: "Sin fecha", clase: "bg-gray-200 text-gray-600" };
    if (g.dias < 0)
      return {
        texto: `Vencido hace ${Math.abs(g.dias)} día(s)`,
        clase: "bg-red-100 text-red-700",
      };
    if (g.dias === 0)
      return { texto: "¡Vence hoy!", clase: "bg-red-100 text-red-700" };
    if (g.dias <= 2)
      return { texto: `Vence en ${g.dias} día(s)`, clase: "bg-red-100 text-red-700" };
    if (g.dias <= 7)
      return { texto: `En ${g.dias} días`, clase: "bg-yellow-100 text-yellow-800" };
    return { texto: `En ${g.dias} días`, clase: "bg-green-100 text-green-700" };
  }

  async function registrarPago(g: Grupo) {
    setPagando(null);
    for (const item of g.items) {
      const res = await marcarCreditoPagado(item.id, medio, fechaPago);
      if (!res.ok) {
        alert(res.error);
        return;
      }
    }
    setMedio("efectivo");
    setFechaPago(hoy);
    router.refresh();
  }

  const input =
    "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  const lista = verPagadas ? pagadas : pendientes;

  return (
    <div>
      <EncabezadoAdmin
        titulo="Cuentas por cobrar"
        descripcion="Servicios y productos que las clientas quedaron debiendo (ventas a crédito)."
      />

      {/* Resumen */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Total por cobrar</p>
          <p className="mt-1 font-serif text-2xl text-rose-dark">{formatCOP(totalPorCobrar)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Créditos pendientes</p>
          <p className="mt-1 font-serif text-2xl text-ink">{nPendientes}</p>
        </div>
        <div
          className={`rounded-2xl border p-5 ${
            nVencidas > 0 ? "border-red-300 bg-red-50/60" : "border-line bg-white/70"
          }`}
        >
          <p className="text-xs uppercase tracking-wider text-muted">Vencidos (en mora)</p>
          <p
            className={`mt-1 font-serif text-2xl ${
              nVencidas > 0 ? "text-red-700" : "text-ink"
            }`}
          >
            {nVencidas}
          </p>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-4 flex gap-1">
        {([false, true] as const).map((op) => (
          <button
            key={String(op)}
            onClick={() => setVerPagadas(op)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              verPagadas === op ? "bg-rose text-white" : "border border-line bg-white text-ink"
            }`}
          >
            {op ? "Pagadas" : "Pendientes"}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {lista.length === 0 && (
          <p className="rounded-2xl border border-line bg-white/60 px-4 py-8 text-center text-muted">
            {verPagadas
              ? "Aún no hay créditos pagados."
              : "¡No hay cuentas por cobrar! 🎉"}
          </p>
        )}
        {lista.map((g) => {
          const s = semaforo(g);
          const abre = pagando === g.clave;
          const mensaje =
            `Hola ${g.cliente_nombre}, te saludamos de Marly Laverde Estudio de Belleza. ` +
            `Te recordamos tu pago pendiente de ${formatCOP(g.total)}` +
            (g.fecha_pago_credito ? ` con fecha ${g.fecha_pago_credito}` : "") +
            `. ¡Gracias! 🌸`;
          return (
            <div key={g.clave} className="rounded-2xl border border-line bg-white/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{g.cliente_nombre}</p>
                  {g.cliente_telefono && (
                    <p className="text-sm text-muted">{g.cliente_telefono}</p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {g.items.map((it) => it.descripcion).join(", ")}
                  </p>
                  {g.fecha_pago_credito && (
                    <p className="mt-1 text-xs text-muted">
                      Pago acordado: <strong className="text-ink">{g.fecha_pago_credito}</strong>
                    </p>
                  )}
                  {verPagadas && g.items[0]?.credito_pago_fecha && (
                    <p className="mt-1 text-xs text-green-700">
                      Pagado el {g.items[0].credito_pago_fecha}
                      {g.items[0].credito_medio_pago
                        ? ` · ${ETIQUETA_MEDIO[g.items[0].credito_medio_pago] ?? g.items[0].credito_medio_pago}`
                        : ""}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-rose-dark">{formatCOP(g.total)}</p>
                  {!verPagadas && (
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${s.clase}`}>
                      {s.texto}
                    </span>
                  )}
                </div>
              </div>

              {!verPagadas && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <button
                    onClick={() => {
                      setPagando(abre ? null : g.clave);
                      setMedio("efectivo");
                      setFechaPago(hoy);
                    }}
                    className="font-medium text-rose hover:underline"
                  >
                    {abre ? "Cancelar" : "Registrar pago"}
                  </button>
                  {g.cliente_telefono && (
                    <a
                      href={waLinkTelefono(g.cliente_telefono, mensaje)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-700 hover:underline"
                    >
                      Recordar por WhatsApp
                    </a>
                  )}
                </div>
              )}

              {abre && (
                <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white/70 p-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted">¿Cómo pagó?</label>
                    <select
                      value={medio}
                      onChange={(e) => setMedio(e.target.value as MedioPago)}
                      className={input}
                    >
                      {MEDIOS_PAGO.map((m) => (
                        <option key={m.valor} value={m.valor}>
                          {m.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">Fecha del pago</label>
                    <input
                      type="date"
                      value={fechaPago}
                      onChange={(e) => setFechaPago(e.target.value)}
                      className={input}
                    />
                  </div>
                  <button
                    onClick={() => registrarPago(g)}
                    className="btn-primario !py-2 !text-xs"
                  >
                    Confirmar pago de {formatCOP(g.total)}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
