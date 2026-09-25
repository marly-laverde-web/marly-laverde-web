"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/format";
import { MEDIOS_PAGO, type MedioPago } from "@/lib/tipos";
import { registrarVenta, eliminarVenta } from "@/app/admin/ventas/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Prefill {
  cita: string | null;
  cliente: string;
  tel: string;
  desc: string;
  total: string;
}

function fechaBogota(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
}

function horaBogota(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const etiquetaMedio: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  datafono: "Datáfono",
};

export default function AdminVentas({
  ventas,
  catalogo,
  hoy,
  prefill,
}: {
  ventas: any[];
  catalogo: { nombre: string; precio: number | null }[];
  hoy: string;
  prefill: Prefill;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(Boolean(prefill.cita || prefill.desc));
  const [descripcion, setDescripcion] = useState(prefill.desc);
  const [cliente, setCliente] = useState(prefill.cliente);
  const [telefono, setTelefono] = useState(prefill.tel);
  const [cantidad, setCantidad] = useState("1");
  const [total, setTotal] = useState(prefill.total);
  const [medio, setMedio] = useState<MedioPago>("efectivo");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Resúmenes
  const totalMes = ventas.reduce((a, v) => a + (v.total ?? 0), 0);
  const totalHoy = ventas
    .filter((v) => fechaBogota(v.fecha) === hoy)
    .reduce((a, v) => a + (v.total ?? 0), 0);
  const porMedio: Record<string, number> = { efectivo: 0, transferencia: 0, datafono: 0 };
  for (const v of ventas) porMedio[v.medio_pago] = (porMedio[v.medio_pago] ?? 0) + v.total;

  function cargarCatalogo(nombre: string) {
    const item = catalogo.find((c) => c.nombre === nombre);
    if (!item) return;
    setDescripcion(item.nombre);
    if (item.precio) setTotal(String(item.precio));
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito("");
    setGuardando(true);
    const res = await registrarVenta({
      descripcion,
      cliente_nombre: cliente,
      cliente_telefono: telefono,
      cantidad: Number(cantidad) || 1,
      total: Number(total) || 0,
      medio_pago: medio,
      cita_id: prefill.cita,
      notas,
    });
    setGuardando(false);
    if (res.ok) {
      setExito("Venta registrada correctamente.");
      setDescripcion("");
      setCliente("");
      setTelefono("");
      setCantidad("1");
      setTotal("");
      setNotas("");
      // limpiar prefill de la URL
      router.replace("/admin/ventas");
      router.refresh();
    } else {
      setError(res.error ?? "Error al registrar.");
    }
  }

  async function borrar(id: string) {
    if (!confirm("¿Eliminar esta venta?")) return;
    await eliminarVenta(id);
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Ventas"
        descripcion="Registra cada cobro e identifica el medio de pago."
        accion={{
          texto: abierto ? "Cerrar" : "+ Registrar venta",
          onClick: () => setAbierto((v) => !v),
        }}
      />

      {/* Resumen */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Ventas de hoy</p>
          <p className="mt-1 font-serif text-2xl text-ink">{formatCOP(totalHoy)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Ventas del mes</p>
          <p className="mt-1 font-serif text-2xl text-ink">{formatCOP(totalMes)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">
            Por medio (mes)
          </p>
          <ul className="space-y-1 text-sm text-ink">
            <li className="flex justify-between"><span>Efectivo</span><span>{formatCOP(porMedio.efectivo)}</span></li>
            <li className="flex justify-between"><span>Transferencia</span><span>{formatCOP(porMedio.transferencia)}</span></li>
            <li className="flex justify-between"><span>Datáfono</span><span>{formatCOP(porMedio.datafono)}</span></li>
          </ul>
        </div>
      </div>

      {/* Formulario */}
      {abierto && (
        <form
          onSubmit={registrar}
          className="mb-6 space-y-4 rounded-2xl border border-line bg-white/70 p-6"
        >
          <h3 className="font-serif text-xl text-ink">Registrar venta</h3>
          {prefill.cita && (
            <p className="rounded-lg bg-sand/70 px-3 py-2 text-sm text-muted">
              Cobro de la cita de <strong className="text-ink">{prefill.cliente}</strong>.
              Al guardar, la cita se marcará como atendida.
            </p>
          )}

          {catalogo.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Cargar del catálogo (opcional)
              </label>
              <select className={input} onChange={(e) => cargarCatalogo(e.target.value)} defaultValue="">
                <option value="">Elegir servicio o producto…</option>
                {catalogo.map((c, i) => (
                  <option key={i} value={c.nombre}>
                    {c.nombre} {c.precio ? `— ${formatCOP(c.precio)}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                ¿Qué se vendió? *
              </label>
              <input
                className={input}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Balayage, Shampoo matizador…"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Cliente</label>
              <input
                className={input}
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Teléfono de la clienta
              </label>
              <input
                className={input}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Para vincular a su ficha"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Cantidad</label>
              <input
                type="number"
                min="1"
                className={input}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Valor total (pesos) *
              </label>
              <input
                type="number"
                min="0"
                className={input}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Medio de pago */}
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Medio de pago *
            </label>
            <div className="flex flex-wrap gap-2">
              {MEDIOS_PAGO.map((m) => (
                <button
                  key={m.valor}
                  type="button"
                  onClick={() => setMedio(m.valor)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    medio === m.valor
                      ? "border-rose bg-rose text-white"
                      : "border-line bg-white text-ink hover:border-rose"
                  }`}
                >
                  {m.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Notas</label>
            <input
              className={input}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-rose-dark">{error}</p>}
          {exito && <p className="text-sm text-green-700">{exito}</p>}

          <button type="submit" disabled={guardando} className="btn-primario">
            {guardando ? "Guardando…" : "Registrar venta"}
          </button>
        </form>
      )}

      {exito && !abierto && (
        <p className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
          {exito}
        </p>
      )}

      {/* Lista */}
      <h3 className="mb-3 font-serif text-lg text-ink">Ventas del mes</h3>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-sand/50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Medio</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No hay ventas registradas este mes.
                </td>
              </tr>
            )}
            {ventas.map((v) => (
              <tr key={v.id} className="border-b border-line/60 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {fechaBogota(v.fecha)} <span className="text-xs">{horaBogota(v.fecha)}</span>
                </td>
                <td className="px-4 py-3 font-medium text-ink">
                  {v.descripcion}
                  {v.cantidad > 1 && (
                    <span className="text-muted"> ×{v.cantidad}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{v.cliente_nombre || "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-sand px-2 py-0.5 text-[0.65rem] font-semibold text-ink">
                    {etiquetaMedio[v.medio_pago] ?? v.medio_pago}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-rose-dark">
                  {formatCOP(v.total)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => borrar(v.id)}
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
