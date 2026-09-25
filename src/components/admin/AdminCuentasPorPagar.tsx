"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/format";
import {
  guardarFactura,
  eliminarFactura,
  registrarAbono,
  eliminarAbono,
} from "@/app/admin/cuentas-por-pagar/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

function diasHasta(fecha: string, hoy: string) {
  const [ay, am, ad] = fecha.split("-").map(Number);
  const [hy, hm, hd] = hoy.split("-").map(Number);
  return Math.round(
    (Date.UTC(ay, am - 1, ad) - Date.UTC(hy, hm - 1, hd)) / 86400000
  );
}

interface FormState {
  id?: string;
  proveedor: string;
  numero: string;
  descripcion: string;
  fecha_compra: string;
  fecha_vencimiento: string;
  valor_total: string;
  notas: string;
}

const vacio: FormState = {
  proveedor: "",
  numero: "",
  descripcion: "",
  fecha_compra: "",
  fecha_vencimiento: "",
  valor_total: "",
  notas: "",
};

export default function AdminCuentasPorPagar({
  facturas,
  abonos,
  hoy,
}: {
  facturas: any[];
  abonos: any[];
  hoy: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "pagadas">("pendientes");
  const [busqueda, setBusqueda] = useState("");
  const [expandida, setExpandida] = useState<string | null>(null);

  // Formulario de abono
  const [aFecha, setAFecha] = useState(hoy);
  const [aValor, setAValor] = useState("");
  const [aNotas, setANotas] = useState("");

  // Abonos y saldo por factura
  function abonadoDe(id: string) {
    return abonos
      .filter((a) => a.factura_id === id)
      .reduce((s, a) => s + (a.valor ?? 0), 0);
  }

  const conDatos = useMemo(() => {
    return facturas.map((f) => {
      const abonado = abonadoDe(f.id);
      const saldo = Math.max(0, (f.valor_total ?? 0) - abonado);
      const dias = diasHasta(f.fecha_vencimiento, hoy);
      return { ...f, abonado, saldo, dias };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facturas, abonos, hoy]);

  const totalDeuda = conDatos
    .filter((f) => f.estado === "pendiente")
    .reduce((s, f) => s + f.saldo, 0);
  const nPendientes = conDatos.filter((f) => f.estado === "pendiente").length;
  const nVencidas = conDatos.filter(
    (f) => f.estado === "pendiente" && f.dias < 0
  ).length;

  const filtradas = conDatos.filter((f) => {
    if (filtro === "pendientes" && f.estado !== "pendiente") return false;
    if (filtro === "pagadas" && f.estado !== "pagada") return false;
    if (busqueda.trim() && !f.proveedor.toLowerCase().includes(busqueda.toLowerCase()))
      return false;
    return true;
  });

  function semaforo(f: any): { texto: string; clase: string } {
    if (f.estado === "pagada")
      return { texto: "Pagada", clase: "bg-gray-200 text-gray-600" };
    if (f.dias < 0)
      return {
        texto: `Vencida hace ${Math.abs(f.dias)} día(s)`,
        clase: "bg-red-100 text-red-700",
      };
    if (f.dias === 0)
      return { texto: "¡Vence hoy!", clase: "bg-red-100 text-red-700" };
    if (f.dias <= 2)
      return { texto: `Vence en ${f.dias} día(s)`, clase: "bg-red-100 text-red-700" };
    if (f.dias <= 7)
      return { texto: `En ${f.dias} días`, clase: "bg-yellow-100 text-yellow-800" };
    return { texto: `En ${f.dias} días`, clase: "bg-green-100 text-green-700" };
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError("");
    const res = await guardarFactura({
      id: form.id,
      proveedor: form.proveedor,
      numero: form.numero,
      descripcion: form.descripcion,
      fecha_compra: form.fecha_compra || null,
      fecha_vencimiento: form.fecha_vencimiento,
      valor_total: Number(form.valor_total) || 0,
      notas: form.notas,
    });
    setGuardando(false);
    if (res.ok) {
      setForm(null);
      router.refresh();
    } else setError(res.error ?? "Error al guardar.");
  }

  function abrirEditar(f: any) {
    setError("");
    setForm({
      id: f.id,
      proveedor: f.proveedor,
      numero: f.numero ?? "",
      descripcion: f.descripcion ?? "",
      fecha_compra: f.fecha_compra ?? "",
      fecha_vencimiento: f.fecha_vencimiento,
      valor_total: String(f.valor_total),
      notas: f.notas ?? "",
    });
  }

  async function borrarFactura(id: string, proveedor: string) {
    if (!confirm(`¿Eliminar la factura de "${proveedor}" y sus abonos?`)) return;
    const res = await eliminarFactura(id);
    if (res.ok) router.refresh();
    else alert(res.error);
  }

  async function abonar(facturaId: string) {
    if (!aValor) return;
    const res = await registrarAbono({
      facturaId,
      fecha: aFecha,
      valor: Number(aValor) || 0,
      notas: aNotas,
    });
    if (res.ok) {
      setAValor("");
      setANotas("");
      setAFecha(hoy);
      router.refresh();
    } else alert(res.error);
  }

  async function borrarAbono(id: string) {
    if (!confirm("¿Eliminar este abono?")) return;
    const res = await eliminarAbono(id);
    if (res.ok) router.refresh();
    else alert(res.error);
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Cuentas por pagar"
        descripcion="Facturas de proveedores a crédito, con abonos y alertas de vencimiento."
        accion={{ texto: "+ Nueva factura", onClick: () => setForm({ ...vacio }) }}
      />

      {/* Resumen */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Total por pagar</p>
          <p className="mt-1 font-serif text-2xl text-rose-dark">{formatCOP(totalDeuda)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Facturas pendientes</p>
          <p className="mt-1 font-serif text-2xl text-ink">{nPendientes}</p>
        </div>
        <div
          className={`rounded-2xl border p-5 ${
            nVencidas > 0 ? "border-red-300 bg-red-50/60" : "border-line bg-white/70"
          }`}
        >
          <p className="text-xs uppercase tracking-wider text-muted">Vencidas (en mora)</p>
          <p
            className={`mt-1 font-serif text-2xl ${
              nVencidas > 0 ? "text-red-700" : "text-ink"
            }`}
          >
            {nVencidas}
          </p>
        </div>
      </div>

      {/* Formulario */}
      {form && (
        <form onSubmit={guardar} className="mb-6 space-y-4 rounded-2xl border border-line bg-white/70 p-6">
          <h3 className="font-serif text-xl text-ink">
            {form.id ? "Editar factura" : "Nueva factura"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Proveedor *</label>
              <input className={input} value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">N.º de factura</label>
              <input className={input} value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="Opcional" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Fecha de compra</label>
              <input type="date" className={input} value={form.fecha_compra} onChange={(e) => setForm({ ...form, fecha_compra: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Fecha de vencimiento *</label>
              <input type="date" className={input} value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Valor total *</label>
              <input type="number" min="0" className={input} value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Descripción / notas</label>
              <input className={input} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: pedido de tintes" />
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

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["pendientes", "pagadas", "todas"] as const).map((op) => (
            <button
              key={op}
              onClick={() => setFiltro(op)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
                filtro === op ? "bg-rose text-white" : "border border-line bg-white text-ink"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar proveedor…"
          className={`${input} sm:max-w-xs`}
        />
      </div>

      {/* Lista de facturas */}
      <div className="space-y-3">
        {filtradas.length === 0 && (
          <p className="rounded-2xl border border-line bg-white/60 px-4 py-8 text-center text-muted">
            No hay facturas para mostrar.
          </p>
        )}
        {filtradas.map((f) => {
          const s = semaforo(f);
          const abre = expandida === f.id;
          const abonosF = abonos.filter((a) => a.factura_id === f.id);
          return (
            <div key={f.id} className="rounded-2xl border border-line bg-white/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {f.proveedor}
                    {f.numero ? <span className="text-muted"> · #{f.numero}</span> : null}
                  </p>
                  {f.descripcion && <p className="text-sm text-muted">{f.descripcion}</p>}
                  <p className="mt-1 text-xs text-muted">
                    Vence: <strong className="text-ink">{f.fecha_vencimiento}</strong>
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.clase}`}>
                  {s.texto}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted">Total</p>
                  <p className="font-medium text-ink">{formatCOP(f.valor_total)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Abonado</p>
                  <p className="font-medium text-green-700">{formatCOP(f.abonado)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Saldo</p>
                  <p className="font-semibold text-rose-dark">{formatCOP(f.saldo)}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <button
                  onClick={() => setExpandida(abre ? null : f.id)}
                  className="font-medium text-rose hover:underline"
                >
                  {abre ? "Ocultar abonos" : `Abonos (${abonosF.length})`}
                </button>
                <button onClick={() => abrirEditar(f)} className="font-medium text-ink hover:underline">
                  Editar
                </button>
                <button
                  onClick={() => borrarFactura(f.id, f.proveedor)}
                  className="font-medium text-rose-dark hover:underline"
                >
                  Eliminar
                </button>
              </div>

              {abre && (
                <div className="mt-3 rounded-xl border border-line bg-white/70 p-3">
                  {abonosF.length > 0 ? (
                    <ul className="mb-3 space-y-1 text-sm">
                      {abonosF.map((a) => (
                        <li key={a.id} className="flex items-center justify-between border-b border-line/40 py-1">
                          <span className="text-muted">
                            {a.fecha}
                            {a.notas ? ` · ${a.notas}` : ""}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="font-medium text-green-700">{formatCOP(a.valor)}</span>
                            <button onClick={() => borrarAbono(a.id)} className="text-xs text-rose-dark hover:underline">
                              ✕
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mb-3 text-sm text-muted">Sin abonos aún.</p>
                  )}

                  {f.estado === "pendiente" && (
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted">Fecha</label>
                        <input type="date" value={aFecha} onChange={(e) => setAFecha(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted">Abono</label>
                        <input type="number" min="0" value={aValor} onChange={(e) => setAValor(e.target.value)} placeholder="Valor" className="w-28 rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-muted">Nota</label>
                        <input value={aNotas} onChange={(e) => setANotas(e.target.value)} className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm" />
                      </div>
                      <button onClick={() => abonar(f.id)} className="btn-primario !py-2 !text-xs">
                        Registrar abono
                      </button>
                    </div>
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
