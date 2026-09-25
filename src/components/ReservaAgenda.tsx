"use client";

import { useEffect, useState } from "react";
import type { Servicio } from "@/data/servicios";
import { categoriasServicios } from "@/data/servicios";
import { site, waLink } from "@/data/config";
import { formatCOP, formatDuracion } from "@/lib/format";
import { crearCitaPublica } from "@/app/(public)/agendar/acciones";
import { IconWhatsApp, IconClock, IconSparkle } from "./Icons";

export default function ReservaAgenda({ servicios }: { servicios: Servicio[] }) {
  const [serviciosSel, setServiciosSel] = useState<string[]>([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");

  const [horas, setHoras] = useState<string[]>([]);
  const [motivo, setMotivo] = useState("");
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  // Servicios seleccionados (en orden), duración y precio total
  const seleccionados = serviciosSel
    .map((id) => servicios.find((s) => s.id === id))
    .filter(Boolean) as Servicio[];
  const duracionTotal = seleccionados.reduce((a, s) => a + s.duracionMin, 0);
  const precioTotal = seleccionados
    .map((s) => s.precio)
    .filter((p): p is number => p !== null)
    .reduce((a, p) => a + p, 0);
  const hayValoracion = seleccionados.some((s) => s.precio === null);

  // Fecha mínima: hoy
  const h = new Date();
  const hoy = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(
    h.getDate()
  ).padStart(2, "0")}`;

  const claveSel = serviciosSel.join(",");

  // Al cambiar servicios o fecha, consultar horas disponibles
  useEffect(() => {
    setHora("");
    if (serviciosSel.length === 0 || !fecha) {
      setHoras([]);
      setMotivo("");
      return;
    }
    let cancelado = false;
    setCargandoHoras(true);
    setMotivo("");
    fetch(`/api/disponibilidad?servicios=${claveSel}&fecha=${fecha}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelado) return;
        setHoras(d.horas ?? []);
        setMotivo(d.motivo ?? "");
      })
      .catch(() => {
        if (!cancelado) setMotivo("No se pudo consultar la disponibilidad.");
      })
      .finally(() => {
        if (!cancelado) setCargandoHoras(false);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveSel, fecha]);

  function agregarServicio(id: string) {
    if (!id || serviciosSel.includes(id)) return;
    setServiciosSel((prev) => [...prev, id]);
  }
  function quitarServicio(id: string) {
    setServiciosSel((prev) => prev.filter((x) => x !== id));
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (serviciosSel.length === 0) return setError("Elige al menos un servicio.");
    if (!nombre.trim()) return setError("Por favor escribe tu nombre.");
    if (!telefono.trim())
      return setError("El teléfono es obligatorio para agendar.");
    if (!hora) return setError("Selecciona una hora disponible.");

    setEnviando(true);
    const res = await crearCitaPublica({
      servicioIds: serviciosSel,
      fecha,
      hora,
      nombre,
      telefono,
      notas,
    });
    setEnviando(false);

    if (res.ok) {
      setExito(true);
    } else {
      setError(res.error ?? "Ocurrió un error. Intenta de nuevo.");
      if (serviciosSel.length && fecha) {
        fetch(`/api/disponibilidad?servicios=${claveSel}&fecha=${fecha}`)
          .then((r) => r.json())
          .then((d) => setHoras(d.horas ?? []));
      }
    }
  }

  const inputBase =
    "w-full rounded-xl border border-line bg-white/80 px-4 py-3 text-ink outline-none transition-colors focus:border-rose focus:ring-2 focus:ring-rose/20";

  /* ---------- Pantalla de éxito ---------- */
  if (exito) {
    const nombresSel = seleccionados.map((s) => s.nombre).join(" + ");
    const resumen = `¡Hola ${site.nombre}! 👋 Acabo de solicitar una cita:
👤 ${nombre}
💇 ${nombresSel}
📅 ${fecha} a las ${hora}
Quedo atenta a la confirmación. ¡Gracias!`;
    return (
      <div className="rounded-2xl border border-line bg-white/70 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <IconSparkle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-5 font-serif text-2xl text-ink">¡Solicitud enviada!</h3>
        <p className="mt-3 text-muted">
          Tu cita de <strong className="text-ink">{nombresSel}</strong> quedó
          registrada para el <strong className="text-ink">{fecha}</strong> a las{" "}
          <strong className="text-ink">{hora}</strong>.
        </p>
        <p className="mt-2 text-sm text-muted">
          {site.nombre} confirmará tu cita muy pronto. Si quieres, avísale por
          WhatsApp:
        </p>
        <a
          href={waLink(resumen)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp mt-6"
        >
          <IconWhatsApp className="h-5 w-5" />
          Avisar por WhatsApp
        </a>
      </div>
    );
  }

  /* ---------- Formulario de reserva ---------- */
  return (
    <form onSubmit={confirmar} className="space-y-6">
      {/* Paso 1: servicios */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          1. Elige tus servicios <span className="text-rose">*</span>
        </label>

        {/* Servicios ya elegidos */}
        {seleccionados.length > 0 && (
          <ul className="mb-3 space-y-2">
            {seleccionados.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-line bg-white/80 px-3 py-2"
              >
                <span className="text-sm">
                  <span className="font-medium text-ink">{s.nombre}</span>
                  <span className="text-muted">
                    {" "}
                    · {formatDuracion(s.duracionMin)} ·{" "}
                    {s.precio === null ? "según valoración" : formatCOP(s.precio)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => quitarServicio(s.id)}
                  className="ml-2 px-1 text-rose-dark hover:text-rose"
                  aria-label={`Quitar ${s.nombre}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <select
          value=""
          onChange={(e) => agregarServicio(e.target.value)}
          className={inputBase}
        >
          <option value="">
            {seleccionados.length ? "+ Agregar otro servicio…" : "Selecciona un servicio…"}
          </option>
          {categoriasServicios.map((cat) => {
            const items = servicios.filter(
              (s) => s.categoria === cat.nombre && !serviciosSel.includes(s.id)
            );
            if (items.length === 0) return null;
            return (
              <optgroup key={cat.nombre} label={cat.nombre}>
                {items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} —{" "}
                    {s.precio === null ? "Valoración" : formatCOP(s.precio)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>

        {seleccionados.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <IconClock className="h-3.5 w-3.5" />
              Duración total: {formatDuracion(duracionTotal)}
            </span>
            <span>
              Total: {formatCOP(precioTotal)}
              {hayValoracion ? " + servicios a valorar" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Paso 2: fecha */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          2. Elige la fecha <span className="text-rose">*</span>
        </label>
        <input
          type="date"
          value={fecha}
          min={hoy}
          onChange={(e) => setFecha(e.target.value)}
          className={inputBase}
          disabled={serviciosSel.length === 0}
          required
        />
      </div>

      {/* Paso 3: hora */}
      {serviciosSel.length > 0 && fecha && (
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            3. Elige la hora <span className="text-rose">*</span>
          </label>
          {cargandoHoras ? (
            <p className="text-sm text-muted">Consultando disponibilidad…</p>
          ) : horas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {horas.map((hh) => (
                <button
                  key={hh}
                  type="button"
                  onClick={() => setHora(hh)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    hora === hh
                      ? "border-rose bg-rose text-white"
                      : "border-line bg-white/80 text-ink hover:border-rose hover:text-rose"
                  }`}
                >
                  {hh}
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-sand/70 px-4 py-3 text-sm text-muted">
              {motivo === "Cerrado ese día" || motivo === "Día no disponible"
                ? "No atendemos ese día. Por favor elige otra fecha."
                : "No hay horarios disponibles que alcancen para esos servicios en esa fecha. Prueba con otro día o menos servicios."}
            </p>
          )}
        </div>
      )}

      {/* Paso 4: datos */}
      {hora && (
        <div className="space-y-5 border-t border-line pt-6">
          <p className="text-sm font-medium text-ink">4. Tus datos</p>
          <div>
            <label htmlFor="r-nombre" className="mb-1.5 block text-sm text-ink">
              Nombre completo <span className="text-rose">*</span>
            </label>
            <input
              id="r-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputBase}
              required
            />
          </div>
          <div>
            <label htmlFor="r-tel" className="mb-1.5 block text-sm text-ink">
              Teléfono (WhatsApp) <span className="text-rose">*</span>
            </label>
            <input
              id="r-tel"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 300 123 4567"
              className={inputBase}
              required
            />
          </div>
          <div>
            <label htmlFor="r-notas" className="mb-1.5 block text-sm text-ink">
              Notas (opcional)
            </label>
            <textarea
              id="r-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className={inputBase}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-rose-soft/60 px-4 py-3 text-sm text-rose-dark">
          {error}
        </p>
      )}

      {hora && (
        <button type="submit" disabled={enviando} className="btn-primario w-full">
          {enviando ? "Enviando…" : "Confirmar cita"}
        </button>
      )}
    </form>
  );
}
