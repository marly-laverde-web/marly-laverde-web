"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { site, waLinkTelefono } from "@/data/config";
import { formatDuracion, formatCOP } from "@/lib/format";
import {
  ESTADOS_CITA,
  MEDIOS_PAGO,
  NOMBRES_DIAS,
  type EstadoCita,
  type MedioPago,
} from "@/lib/tipos";
import {
  crearCitaAdmin,
  actualizarCita,
  actualizarEstadoCita,
  eliminarCita,
  finalizarCita,
  type ItemCobro,
} from "@/app/admin/agenda/acciones";
import EncabezadoAdmin from "./EncabezadoAdmin";
import { IconWhatsApp } from "@/components/Icons";

/* eslint-disable @typescript-eslint/no-explicit-any */

function hhmm(t: string) {
  return t?.slice(0, 5) ?? "";
}

function calcularFin(hora: string, dur: number) {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + dur;
  const H = Math.floor(total / 60) % 24;
  const M = total % 60;
  return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
}

function sumarDias(fecha: string, n: number) {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().split("T")[0];
}

function fechaLegible(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${NOMBRES_DIAS[dt.getUTCDay()]} ${d} / ${m} / ${y}`;
}

export default function AdminAgenda({
  fecha,
  citas,
  servicios,
  productos,
  clientes,
  profesionales,
}: {
  fecha: string;
  citas: any[];
  servicios: any[];
  productos: any[];
  clientes: any[];
  profesionales: string[];
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [servicioId, setServicioId] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [hora, setHora] = useState("");
  const [estado, setEstado] = useState<EstadoCita>("confirmada");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Finalización de cita + cobro con varios ítems + próximo retoque
  const [finalizando, setFinalizando] = useState<string | null>(null);
  const [items, setItems] = useState<ItemCobro[]>([]);
  const [medioPago, setMedioPago] = useState<MedioPago>("efectivo");
  const [profesionalCobro, setProfesionalCobro] = useState("");
  const [fechaRetoque, setFechaRetoque] = useState("");
  const [conRetoque, setConRetoque] = useState(true);
  const [notasRetoque, setNotasRetoque] = useState("");

  // Edición / reprogramación de una cita existente
  const [editando, setEditando] = useState<string | null>(null);
  const [eServicio, setEServicio] = useState("");
  const [eFecha, setEFecha] = useState("");
  const [eHora, setEHora] = useState("");
  const [eNombre, setENombre] = useState("");
  const [eTelefono, setETelefono] = useState("");
  const [eNotas, setENotas] = useState("");

  // Mostrar/ocultar las citas ya atendidas o finalizadas
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false);

  // Catálogo para agregar ítems al cobro (servicios + productos)
  const catalogoCobro = [
    ...servicios.map((s) => ({
      nombre: s.nombre,
      precio: s.precio,
      productoId: null as string | null,
      costo: 0,
    })),
    ...productos.map((p) => ({
      nombre: p.nombre,
      precio: p.precio,
      productoId: p.id as string,
      costo: p.costo ?? 0,
    })),
  ];

  function abrirFinalizar(c: any) {
    const servicio = servicios.find((s) => s.id === c.servicio_id);
    const intervalo = servicio?.intervalo_retoque_dias;
    setFinalizando(c.id);
    setItems([
      { descripcion: c.servicio_nombre, cantidad: 1, precio: servicio?.precio ?? 0 },
    ]);
    setMedioPago("efectivo");
    setProfesionalCobro(profesionales.length === 1 ? profesionales[0] : "");
    setConRetoque(Boolean(intervalo));
    setFechaRetoque(intervalo ? sumarDias(c.fecha, intervalo) : "");
    setNotasRetoque("");
  }

  function agregarDelCatalogo(idx: string) {
    if (idx === "") return;
    const c = catalogoCobro[Number(idx)];
    if (!c) return;
    setItems((prev) => [
      ...prev,
      {
        descripcion: c.nombre,
        cantidad: 1,
        precio: c.precio ?? 0,
        producto_id: c.productoId,
        costo: c.costo ?? 0,
      },
    ]);
  }
  function agregarManual() {
    setItems((prev) => [...prev, { descripcion: "", cantidad: 1, precio: 0 }]);
  }
  function actualizarItem(idx: number, campo: keyof ItemCobro, valor: any) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it))
    );
  }
  function quitarItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  const totalCobro = items.reduce(
    (a, it) => a + (it.cantidad || 1) * (it.precio || 0),
    0
  );

  async function confirmarFinalizar(c: any) {
    const res = await finalizarCita(c.id, {
      items,
      medioPago,
      profesionalNombre: profesionalCobro,
      fechaRetoque: conRetoque && fechaRetoque ? fechaRetoque : null,
      notasRetoque,
    });
    if (res.ok) {
      setFinalizando(null);
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  function abrirEditar(c: any) {
    setFinalizando(null);
    setEditando(c.id);
    setEServicio(c.servicio_id ?? "");
    setEFecha(c.fecha);
    setEHora(hhmm(c.hora_inicio));
    setENombre(c.cliente_nombre);
    setETelefono(c.cliente_telefono ?? "");
    setENotas(c.notas ?? "");
  }

  async function guardarEdicion(citaId: string) {
    const res = await actualizarCita({
      citaId,
      servicioId: eServicio,
      fecha: eFecha,
      hora: eHora,
      nombre: eNombre,
      telefono: eTelefono,
      notas: eNotas,
    });
    if (res.ok) {
      setEditando(null);
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  function irAFecha(f: string) {
    router.push(`/admin/agenda?fecha=${f}`);
  }

  // Al escribir/elegir el nombre en "Nueva cita", autocompletar el teléfono
  function onNombreCita(valor: string) {
    setNombre(valor);
    const cli = clientes.find(
      (c) => c.nombre.trim().toLowerCase() === valor.trim().toLowerCase()
    );
    if (cli && cli.telefono) setTelefono(cli.telefono);
  }
  // Al escribir/elegir el teléfono, autocompletar el nombre
  function onTelefonoCita(valor: string) {
    setTelefono(valor);
    const cli = clientes.find((c) => (c.telefono ?? "") === valor.trim());
    if (cli) setNombre(cli.nombre);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    const res = await crearCitaAdmin({
      servicioId,
      fecha,
      hora,
      nombre,
      telefono,
      estado,
      notas,
    });
    setGuardando(false);
    if (res.ok) {
      setMostrarForm(false);
      setServicioId("");
      setNombre("");
      setTelefono("");
      setHora("");
      setNotas("");
      router.refresh();
    } else {
      setError(res.error ?? "Error al crear la cita.");
    }
  }

  async function cambiarEstado(id: string, nuevo: EstadoCita) {
    await actualizarEstadoCita(id, nuevo);
    router.refresh();
  }

  async function borrar(id: string) {
    if (!confirm("¿Eliminar esta cita?")) return;
    await eliminarCita(id);
    router.refresh();
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  const categorias = Array.from(new Set(servicios.map((s) => s.categoria)));

  // Citas activas (pendiente/confirmada) vs. finalizadas (atendida/cancelada/no asistió)
  const activas = citas.filter(
    (c) => c.estado === "pendiente" || c.estado === "confirmada"
  );
  const finalizadas = citas.filter(
    (c) => c.estado !== "pendiente" && c.estado !== "confirmada"
  );

  return (
    <div>
      <EncabezadoAdmin
        titulo="Agenda"
        descripcion="Consulta y gestiona las citas del día."
        accion={{
          texto: mostrarForm ? "Cerrar" : "+ Nueva cita",
          onClick: () => setMostrarForm((v) => !v),
        }}
      />

      {/* Navegación de fecha */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/60 p-4">
        <button onClick={() => irAFecha(sumarDias(fecha, -1))} className="btn-secundario !px-3 !py-2 !text-sm">
          ← Anterior
        </button>
        <input
          type="date"
          value={fecha}
          onChange={(e) => irAFecha(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
        />
        <button onClick={() => irAFecha(sumarDias(fecha, 1))} className="btn-secundario !px-3 !py-2 !text-sm">
          Siguiente →
        </button>
        <span className="ml-auto font-serif text-lg text-ink">
          {fechaLegible(fecha)}
        </span>
      </div>

      {/* Formulario nueva cita */}
      {mostrarForm && (
        <form
          onSubmit={crear}
          className="mb-6 space-y-4 rounded-2xl border border-line bg-white/70 p-6"
        >
          <h3 className="font-serif text-xl text-ink">Nueva cita — {fechaLegible(fecha)}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Servicio *</label>
              <select
                className={input}
                value={servicioId}
                onChange={(e) => setServicioId(e.target.value)}
                required
              >
                <option value="">Selecciona…</option>
                {categorias.map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {servicios
                      .filter((s) => s.categoria === cat)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({formatDuracion(s.duracion_min)})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Hora *</label>
              <input
                type="time"
                className={input}
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Cliente *</label>
              <input
                className={input}
                value={nombre}
                onChange={(e) => onNombreCita(e.target.value)}
                list="clientes-sugeridos"
                autoComplete="off"
                placeholder="Escribe para buscar clientas…"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Teléfono</label>
              <input
                className={input}
                value={telefono}
                onChange={(e) => onTelefonoCita(e.target.value)}
                list="telefonos-sugeridos"
                autoComplete="off"
              />
            </div>
            <datalist id="clientes-sugeridos">
              {clientes.map((c, i) => (
                <option key={i} value={c.nombre}>
                  {c.telefono || ""}
                </option>
              ))}
            </datalist>
            <datalist id="telefonos-sugeridos">
              {clientes
                .filter((c) => c.telefono)
                .map((c, i) => (
                  <option key={i} value={c.telefono}>
                    {c.nombre}
                  </option>
                ))}
            </datalist>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Estado</label>
              <select
                className={input}
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoCita)}
              >
                {ESTADOS_CITA.map((es) => (
                  <option key={es.valor} value={es.valor}>
                    {es.etiqueta}
                  </option>
                ))}
              </select>
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
            {guardando ? "Guardando…" : "Crear cita"}
          </button>
        </form>
      )}

      {/* Lista de citas activas */}
      {activas.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white/60 px-4 py-10 text-center text-muted">
          {finalizadas.length > 0
            ? "No hay citas pendientes para este día."
            : "No hay citas para este día."}
        </p>
      ) : (
        <div className="space-y-3">
          {activas.map((c) => {
            const infoEstado = ESTADOS_CITA.find((e) => e.valor === c.estado);
            const servicio = servicios.find((s) => s.id === c.servicio_id);
            const precio = servicio?.precio ?? "";
            const cobroUrl = `/admin/ventas?cita=${c.id}&cliente=${encodeURIComponent(
              c.cliente_nombre
            )}&tel=${encodeURIComponent(c.cliente_telefono || "")}&desc=${encodeURIComponent(
              c.servicio_nombre
            )}${precio !== "" && precio !== null ? `&total=${precio}` : ""}`;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-white/70 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-28 shrink-0">
                  <p className="font-serif text-lg text-ink">{hhmm(c.hora_inicio)}</p>
                  <p className="text-xs text-muted">
                    a {calcularFin(c.hora_inicio, c.duracion_min)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink">{c.cliente_nombre}</p>
                  <p className="text-sm text-muted">{c.servicio_nombre}</p>
                  {c.notas && <p className="mt-1 text-xs text-muted">📝 {c.notas}</p>}
                  {c.cliente_telefono && (
                    <a
                      href={waLinkTelefono(
                        c.cliente_telefono,
                        `¡Hola ${c.cliente_nombre}! Te escribimos de ${site.nombre} ${site.subtitulo} para recordarte que tienes agendada una cita de ${c.servicio_nombre} el ${fechaLegible(
                          c.fecha
                        )} a las ${hhmm(c.hora_inicio)}. ¡Te esperamos! 💗`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#25d366]"
                    >
                      <IconWhatsApp className="h-3.5 w-3.5" />
                      {c.cliente_telefono}
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <select
                    value={c.estado}
                    onChange={(e) => cambiarEstado(c.id, e.target.value as EstadoCita)}
                    className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                    style={{ color: infoEstado?.color }}
                  >
                    {ESTADOS_CITA.map((es) => (
                      <option key={es.valor} value={es.valor}>
                        {es.etiqueta}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {c.estado !== "atendida" && c.estado !== "cancelada" && (
                      <button
                        onClick={() => abrirFinalizar(c)}
                        className="font-semibold text-green-700 hover:underline"
                      >
                        Dar por terminado
                      </button>
                    )}
                    <button
                      onClick={() => abrirEditar(c)}
                      className="font-medium text-ink hover:underline"
                    >
                      Editar
                    </button>
                    <Link href={cobroUrl} className="font-medium text-rose hover:underline">
                      Registrar cobro
                    </Link>
                    <button
                      onClick={() => borrar(c.id)}
                      className="font-medium text-rose-dark hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                </div>

                {editando === c.id && (
                  <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                    <p className="mb-3 font-medium text-ink">
                      Reprogramar / editar cita
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted">Servicio</label>
                        <select
                          value={eServicio}
                          onChange={(e) => setEServicio(e.target.value)}
                          className={input}
                        >
                          <option value="">Selecciona…</option>
                          {categorias.map((cat) => (
                            <optgroup key={cat} label={cat}>
                              {servicios
                                .filter((s) => s.categoria === cat)
                                .map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.nombre} ({formatDuracion(s.duracion_min)})
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted">Cliente</label>
                        <input
                          value={eNombre}
                          onChange={(e) => setENombre(e.target.value)}
                          className={input}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted">Fecha</label>
                        <input
                          type="date"
                          value={eFecha}
                          onChange={(e) => setEFecha(e.target.value)}
                          className={input}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted">Hora</label>
                        <input
                          type="time"
                          value={eHora}
                          onChange={(e) => setEHora(e.target.value)}
                          className={input}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted">Teléfono</label>
                        <input
                          value={eTelefono}
                          onChange={(e) => setETelefono(e.target.value)}
                          className={input}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-muted">Notas</label>
                        <input
                          value={eNotas}
                          onChange={(e) => setENotas(e.target.value)}
                          className={input}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => guardarEdicion(c.id)}
                        className="btn-primario !py-2 !text-xs"
                      >
                        Guardar cambios
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditando(null)}
                        className="text-xs text-muted hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {finalizando === c.id && (
                  <div className="mt-3 rounded-xl border border-green-200 bg-green-50/50 p-4">
                    <p className="mb-3 font-medium text-ink">
                      Finalizar y cobrar — {c.cliente_nombre}
                    </p>

                    {/* Ítems a cobrar */}
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex flex-wrap items-center gap-2">
                          <input
                            value={it.descripcion}
                            onChange={(e) => actualizarItem(idx, "descripcion", e.target.value)}
                            placeholder="Servicio / producto"
                            className="min-w-[140px] flex-1 rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                          />
                          <input
                            type="number"
                            min="1"
                            value={it.cantidad}
                            onChange={(e) => actualizarItem(idx, "cantidad", Number(e.target.value))}
                            title="Cantidad"
                            className="w-16 rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                          />
                          <input
                            type="number"
                            min="0"
                            value={it.precio}
                            onChange={(e) => actualizarItem(idx, "precio", Number(e.target.value))}
                            placeholder="Precio"
                            className="w-28 rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => quitarItem(idx)}
                            className="px-1 text-rose-dark hover:text-rose"
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Agregar ítems */}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <select
                        value=""
                        onChange={(e) => agregarDelCatalogo(e.target.value)}
                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                      >
                        <option value="">+ Agregar del catálogo…</option>
                        {catalogoCobro.map((x, i) => (
                          <option key={i} value={String(i)}>
                            {x.nombre}
                            {x.precio ? ` — ${formatCOP(x.precio)}` : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={agregarManual}
                        className="text-sm font-medium text-rose hover:underline"
                      >
                        + Ítem manual
                      </button>
                    </div>

                    {/* Total */}
                    <div className="mt-3 flex items-center justify-between border-t border-green-200 pt-2">
                      <span className="text-sm text-muted">Total a cobrar</span>
                      <span className="font-serif text-xl text-ink">
                        {formatCOP(totalCobro)}
                      </span>
                    </div>

                    {/* Medio de pago */}
                    {totalCobro > 0 && (
                      <div className="mt-3">
                        <p className="mb-1 text-sm font-medium text-ink">Medio de pago</p>
                        <div className="flex flex-wrap gap-2">
                          {MEDIOS_PAGO.map((m) => (
                            <button
                              key={m.valor}
                              type="button"
                              onClick={() => setMedioPago(m.valor)}
                              className={`rounded-lg border px-3 py-1.5 text-sm ${
                                medioPago === m.valor
                                  ? "border-rose bg-rose text-white"
                                  : "border-line bg-white text-ink hover:border-rose"
                              }`}
                            >
                              {m.etiqueta}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Profesional */}
                    {profesionales.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1 text-sm font-medium text-ink">
                          Profesional que atendió
                        </p>
                        <select
                          value={profesionalCobro}
                          onChange={(e) => setProfesionalCobro(e.target.value)}
                          className={input}
                        >
                          <option value="">Sin especificar</option>
                          {profesionales.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Próximo retoque */}
                    <label className="mt-4 flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={conRetoque}
                        onChange={(e) => setConRetoque(e.target.checked)}
                      />
                      Programar próximo retoque
                    </label>
                    {conRetoque && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          type="date"
                          value={fechaRetoque}
                          min={fecha}
                          onChange={(e) => setFechaRetoque(e.target.value)}
                          className={input}
                        />
                        <input
                          value={notasRetoque}
                          onChange={(e) => setNotasRetoque(e.target.value)}
                          className={input}
                          placeholder="Nota del retoque (opcional)"
                        />
                      </div>
                    )}

                    {/* Botones */}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => confirmarFinalizar(c)}
                        className="btn-primario !py-2 !text-xs"
                      >
                        {totalCobro > 0
                          ? `Finalizar y cobrar ${formatCOP(totalCobro)}`
                          : "Finalizar cita"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFinalizando(null)}
                        className="text-xs text-muted hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Citas atendidas / finalizadas (fuera de la agenda activa) */}
      {finalizadas.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setMostrarFinalizadas((v) => !v)}
            className="text-sm font-medium text-muted hover:text-ink"
          >
            {mostrarFinalizadas ? "▾ Ocultar" : "▸ Ver"} atendidas / finalizadas de
            hoy ({finalizadas.length})
          </button>
          {mostrarFinalizadas && (
            <div className="mt-3 space-y-2">
              {finalizadas.map((c) => {
                const est = ESTADOS_CITA.find((e) => e.valor === c.estado);
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white/40 px-4 py-3"
                  >
                    <span className="w-14 text-sm font-medium text-ink">
                      {hhmm(c.hora_inicio)}
                    </span>
                    <span className="flex-1 text-sm">
                      <span className="font-medium text-ink">{c.cliente_nombre}</span>
                      <span className="text-muted"> · {c.servicio_nombre}</span>
                    </span>
                    <select
                      value={c.estado}
                      onChange={(e) =>
                        cambiarEstado(c.id, e.target.value as EstadoCita)
                      }
                      className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold"
                      style={{ color: est?.color }}
                      title="Cambiar estado (para reabrir la cita)"
                    >
                      {ESTADOS_CITA.map((es) => (
                        <option key={es.valor} value={es.valor}>
                          {es.etiqueta}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => borrar(c.id)}
                      className="text-xs font-medium text-rose-dark hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
