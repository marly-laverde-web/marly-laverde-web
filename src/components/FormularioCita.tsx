"use client";

import { useState } from "react";
import { site, waLink } from "@/data/config";
import { serviciosActivos, categoriasServicios } from "@/data/servicios";
import { IconWhatsApp } from "./Icons";

export default function FormularioCita() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  const activos = serviciosActivos();
  // Fecha mínima = hoy (no se pueden pedir citas en el pasado)
  const hoy = new Date().toISOString().split("T")[0];

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !servicio) {
      setError("Por favor completa tu nombre y el servicio que deseas.");
      return;
    }
    setError("");

    const lineas = [
      "¡Hola Marly Laverde Estudio de Belleza! 👋",
      "Quiero solicitar una cita:",
      "",
      `👤 Nombre: ${nombre}`,
      telefono ? `📱 Teléfono: ${telefono}` : "",
      `💇 Servicio: ${servicio}`,
      fecha ? `📅 Fecha preferida: ${fecha}` : "",
      hora ? `⏰ Hora preferida: ${hora}` : "",
      notas ? `📝 Notas: ${notas}` : "",
      "",
      "Quedo atenta a la confirmación. ¡Gracias!",
    ].filter(Boolean);

    const url = waLink(lineas.join("\n"));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const inputBase =
    "w-full rounded-xl border border-line bg-white/80 px-4 py-3 text-ink outline-none transition-colors focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div>
        <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-ink">
          Nombre completo <span className="text-rose">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className={inputBase}
          required
        />
      </div>

      <div>
        <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-ink">
          Teléfono (opcional)
        </label>
        <input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ej: 300 123 4567"
          className={inputBase}
        />
      </div>

      <div>
        <label htmlFor="servicio" className="mb-1.5 block text-sm font-medium text-ink">
          Servicio que deseas <span className="text-rose">*</span>
        </label>
        <select
          id="servicio"
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          className={inputBase}
          required
        >
          <option value="">Selecciona un servicio…</option>
          {categoriasServicios.map((cat) => {
            const items = activos.filter((s) => s.categoria === cat.nombre);
            if (items.length === 0) return null;
            return (
              <optgroup key={cat.nombre} label={cat.nombre}>
                {items.map((s) => (
                  <option key={s.id} value={`${s.nombre} (${s.categoria})`}>
                    {s.nombre}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fecha" className="mb-1.5 block text-sm font-medium text-ink">
            Fecha preferida
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            min={hoy}
            onChange={(e) => setFecha(e.target.value)}
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="hora" className="mb-1.5 block text-sm font-medium text-ink">
            Hora preferida
          </label>
          <input
            id="hora"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className={inputBase}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notas" className="mb-1.5 block text-sm font-medium text-ink">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          placeholder="Cuéntanos cualquier detalle importante…"
          className={inputBase}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-soft/60 px-4 py-3 text-sm text-rose-dark">
          {error}
        </p>
      )}

      <button type="submit" className="btn-whatsapp w-full">
        <IconWhatsApp className="h-5 w-5" />
        Enviar solicitud por WhatsApp
      </button>

      <p className="text-center text-xs text-muted">
        Al enviar se abrirá WhatsApp con tu solicitud lista. La cita queda
        confirmada cuando {site.nombre} responda tu mensaje.
      </p>
    </form>
  );
}
