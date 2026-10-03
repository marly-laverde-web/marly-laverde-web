"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/format";
import { MEDIOS_PAGO, ETIQUETA_MEDIO, type MedioPago } from "@/lib/tipos";
import { waLinkTelefono, primerNombre, emoji } from "@/data/config";
import {
  registrarAbonoCredito,
  eliminarAbonoCredito,
} from "@/app/admin/ventas/acciones";
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
  ventaIds: string[];
  total: number;
  abonado: number;
  saldo: number;
  dias: number;
  pagada: boolean;
}

export default function AdminCuentasPorCobrar({
  ventas,
  abonos,
  hoy,
}: {
  ventas: any[];
  abonos: any[];
  hoy: string;
}) {
  const router = useRouter();
  const [verPagadas, setVerPagadas] = useState(false);
  const [abriendo, setAbriendo] = useState<string | null>(null);

  // Formulario de abono
  const [aFecha, setAFecha] = useState(hoy);
  const [aValor, setAValor] = useState("");
  const [aMedio, setAMedio] = useState<MedioPago>("efectivo");
  const [aNotas, setANotas] = useState("");

  function claveDe(v: any) {
    return v.cita_id ?? `${v.cliente_nombre}__${v.fecha_pago_credito ?? "s/f"}`;
  }

  function abonadoDe(clave: string) {
    return abonos
      .filter((a) => a.grupo_clave === clave)
      .reduce((s, a) => s + (a.valor ?? 0), 0);
  }

  const grupos = useMemo<Grupo[]>(() => {
    const mapa = new Map<string, Grupo>();
    for (const v of ventas) {
      const clave = claveDe(v);
      let g = mapa.get(clave);
      if (!g) {
        g = {
          clave,
          cliente_nombre: v.cliente_nombre ?? "Clienta",
          cliente_telefono: v.cliente_telefono ?? "",
          fecha_pago_credito: v.fecha_pago_credito ?? null,
          items: [],
          ventaIds: [],
          total: 0,
          abonado: 0,
          saldo: 0,
          dias: diasHasta(v.fecha_pago_credito ?? null, hoy),
          pagada: true,
        };
        mapa.set(clave, g);
      }
      g.items.push(v);
      g.ventaIds.push(v.id);
      g.total += v.total ?? 0;
      if (!v.credito_pagado) g.pagada = false;
    }
    for (const g of mapa.values()) {
      g.abonado = abonadoDe(g.clave);
      g.saldo = Math.max(0, g.total - g.abonado);
    }
    return [...mapa.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ventas, abonos, hoy]);

  const pendientes = grupos
    .filter((g) => !g.pagada)
    .sort((a, b) => a.dias - b.dias);
  const pagadas = grupos.filter((g) => g.pagada);

  const totalPorCobrar = pendientes.reduce((s, g) => s + g.saldo, 0);
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

  function abrir(g: Grupo) {
    setAbriendo(g.clave);
    setAFecha(hoy);
    setAValor(String(g.saldo)); // por defecto, el saldo completo
    setAMedio("efectivo");
    setANotas("");
  }

  async function registrar(g: Grupo) {
    if (!aValor || Number(aValor) <= 0) return;
    const res = await registrarAbonoCredito({
      grupoClave: g.clave,
      clienteNombre: g.cliente_nombre,
      ventaIds: g.ventaIds,
      fecha: aFecha,
      valor: Number(aValor),
      medio: aMedio,
      notas: aNotas,
    });
    if (res.ok) {
      setAbriendo(null);
      setAValor("");
      setANotas("");
      router.refresh();
    } else alert(res.error);
  }

  async function borrarAbono(g: Grupo, abonoId: string) {
    if (!confirm("¿Eliminar este abono?")) return;
    const res = await eliminarAbonoCredito(abonoId, g.clave, g.ventaIds);
    if (res.ok) router.refresh();
    else alert(res.error);
  }

  const input =
    "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  const lista = verPagadas ? pagadas : pendientes;

  return (
    <div>
      <EncabezadoAdmin
        titulo="Cuentas por cobrar"
        descripcion="Servicios y productos que las clientas quedaron debiendo (ventas a crédito). Puedes registrar abonos parciales."
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
          const abre = abriendo === g.clave;
          const abonosG = abonos.filter((a) => a.grupo_clave === g.clave);
          const mensaje =
            `¡Hola ${primerNombre(g.cliente_nombre)}! ${emoji.flor}\n\n` +
            `Te saludamos con cariño de Marly Laverde Estudio de Belleza ${emoji.corazon}\n\n` +
            `Te recordamos amablemente tu saldo pendiente:\n` +
            `${emoji.dinero} Valor: ${formatCOP(g.saldo)}\n` +
            (g.fecha_pago_credito ? `${emoji.calendario} Fecha acordada: ${g.fecha_pago_credito}\n` : "") +
            `\n¡Mil gracias por tu confianza y preferencia! ${emoji.abrazo}${emoji.corazonBrillante}`;
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
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-rose-dark">{formatCOP(g.saldo)}</p>
                  {g.abonado > 0 && (
                    <p className="text-xs text-muted">
                      de {formatCOP(g.total)} · abonado {formatCOP(g.abonado)}
                    </p>
                  )}
                  {!verPagadas && (
                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${s.clase}`}>
                      {s.texto}
                    </span>
                  )}
                </div>
              </div>

              {/* Historial de abonos */}
              {abonosG.length > 0 && (
                <ul className="mt-3 space-y-1 rounded-xl border border-line bg-white/60 p-3 text-sm">
                  {abonosG.map((a) => (
                    <li key={a.id} className="flex items-center justify-between border-b border-line/40 py-1 last:border-0">
                      <span className="text-muted">
                        {a.fecha} · {ETIQUETA_MEDIO[a.medio_pago] ?? a.medio_pago}
                        {a.notas ? ` · ${a.notas}` : ""}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-green-700">{formatCOP(a.valor)}</span>
                        <button
                          onClick={() => borrarAbono(g, a.id)}
                          className="text-xs text-rose-dark hover:underline"
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {!verPagadas && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <button
                    onClick={() => (abre ? setAbriendo(null) : abrir(g))}
                    className="font-medium text-rose hover:underline"
                  >
                    {abre ? "Cancelar" : "Registrar abono / pago"}
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
                    <label className="mb-1 block text-xs text-muted">Valor del abono</label>
                    <input
                      type="number"
                      min="0"
                      value={aValor}
                      onChange={(e) => setAValor(e.target.value)}
                      className={`${input} w-32`}
                      placeholder="Valor"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">¿Cómo pagó?</label>
                    <select
                      value={aMedio}
                      onChange={(e) => setAMedio(e.target.value as MedioPago)}
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
                    <label className="mb-1 block text-xs text-muted">Fecha</label>
                    <input
                      type="date"
                      value={aFecha}
                      onChange={(e) => setAFecha(e.target.value)}
                      className={input}
                    />
                  </div>
                  <div className="min-w-[8rem] flex-1">
                    <label className="mb-1 block text-xs text-muted">Nota (opcional)</label>
                    <input
                      value={aNotas}
                      onChange={(e) => setANotas(e.target.value)}
                      className={`${input} w-full`}
                    />
                  </div>
                  <button
                    onClick={() => registrar(g)}
                    className="btn-primario !py-2 !text-xs"
                  >
                    Guardar abono
                  </button>
                  {Number(aValor) >= g.saldo && g.saldo > 0 && (
                    <p className="w-full text-xs text-green-700">
                      ✓ Este abono salda la deuda por completo.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
