"use client";

import { useEffect, useState } from "react";
import type { Servicio } from "@/data/servicios";
import { categoriasServicios } from "@/data/servicios";
import { site, waLink } from "@/data/config";
import { formatCOP, formatDuracion } from "@/lib/format";
import { crearCitaPublica } from "@/app/(public)/agendar/acciones";
import { IconWhatsApp, IconClock, IconSparkle } from "./Icons";

export default function ReservaAgenda({ servicios }: { servicios: Servicio[] }) {
  const [servicioId, setServicioId] = useState("");
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

  const servicio = servicios.find((s) => s.id === servicioId);

  // Fecha mínima: hoy
  const h = new Date();
  const hoy = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(
    h.getDate()
  ).padStart(2, "0")}`;

  // Al cambiar servicio o fecha, consultar horas disponibles
  useEffect(() => {
    setHora("");
    if (!servicioId || !fecha) {
      setHoras([]);
      setMotivo("");
      return;
    }
    let cancelado = false;
    setCargandoHoras(true);
    setMotivo("");
    fetch(`/api/disponibilidad?servicio=${servicioId}&fecha=${fecha}`)
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
  }, [servicioId, fecha]);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) return setError("Por favor escribe tu nombre.");
    if (!telefono.trim())
      return setError("El teléfono es obligatorio para agendar.");
    if (!hora) return setError("Selecciona una hora disponible.");

    setEnviando(true);
    const res = await crearCitaPublica({
      servicioId,
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
      // Refrescar horas por si el horario se ocupó
      if (servicioId && fecha) {
        fetch(`/api/disponibilidad?servicio=${servicioId}&fecha=${fecha}`)
          .then((r) => r.json())
          .then((d) => setHoras(d.horas ?? []));
      }
    }
  }

  const inputBase =
    "w-full rounded-xl border border-line bg-white/80 px-4 py-3 text-ink outline-none transition-colors focus:border-rose focus:ring-2 focus:ring-rose/20";

  /* ---------- Pantalla de éxito ---------- */
  if (exito && servicio) {
    const resumen = `¡Hola ${site.nombre}! 👋 Acabo de solicitar una cita:
👤 ${nombre}
💇 ${servicio.nombre}
📅 ${fecha} a las ${hora}
Quedo atenta a la confirmación. ¡Gracias!`;
    return (
      <div className="rounded-2xl border border-line bg-white/70 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <IconSparkle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-5 font-serif text-2xl text-ink">¡Solicitud enviada!</h3>
        <p className="mt-3 text-muted">
          Tu cita de <strong className="text-ink">{servicio.nombre}</strong> quedó
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
      {/* Paso 1: servicio */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          1. Elige el servicio <span className="text-rose">*</span>
        </label>
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          className={inputBase}
          required
        >
          <option value="">Selecciona un servicio…</option>
          {categoriasServicios.map((cat) => {
            const items = servicios.filter((s) => s.categoria === cat.nombre);
            if (items.length === 0) return null;
            return (
              <optgroup key={cat.nombre} label={cat.nombre}>
                {items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} — {formatCOP(s.precio)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        {servicio && (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted">
            <IconClock className="h-3.5 w-3.5" />
            Duración aproximada: {formatDuracion(servicio.duracionMin)}
          </p>
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
          disabled={!servicioId}
          required
        />
      </div>

      {/* Paso 3: hora */}
      {servicioId && fecha && (
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
                : "No hay horarios disponibles para esa fecha. Prueba con otro día."}
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
