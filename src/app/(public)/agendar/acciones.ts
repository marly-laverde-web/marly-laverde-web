"use server";

import { crearClienteServicio, servicioConfigurado } from "@/lib/supabase/admin";
import { obtenerDisponibilidad } from "@/lib/disponibilidad";

export interface DatosCita {
  servicioId: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  notas: string;
}

export interface RespuestaCita {
  ok: boolean;
  error?: string;
}

/** Crea una cita solicitada por una clienta desde el sitio público. */
export async function crearCitaPublica(datos: DatosCita): Promise<RespuestaCita> {
  if (!servicioConfigurado()) {
    return { ok: false, error: "La agenda en línea no está disponible." };
  }
  if (!datos.nombre.trim()) {
    return { ok: false, error: "Escribe tu nombre." };
  }
  if (!datos.telefono.trim()) {
    return { ok: false, error: "El teléfono es obligatorio para agendar." };
  }
  if (!datos.servicioId || !datos.fecha || !datos.hora) {
    return { ok: false, error: "Selecciona servicio, fecha y hora." };
  }

  const supabase = crearClienteServicio();

  // Datos del servicio
  const { data: servicio } = await supabase
    .from("servicios")
    .select("nombre, duracion_min, activo")
    .eq("id", datos.servicioId)
    .single();

  if (!servicio || servicio.activo === false) {
    return { ok: false, error: "El servicio ya no está disponible." };
  }

  // Verificar que la hora siga libre (evita reservas dobles)
  const disp = await obtenerDisponibilidad(datos.servicioId, datos.fecha);
  if (!disp.horas.includes(datos.hora)) {
    return {
      ok: false,
      error: "Ese horario ya no está disponible. Por favor elige otro.",
    };
  }

  const { error } = await supabase.from("citas").insert({
    cliente_nombre: datos.nombre.trim(),
    cliente_telefono: datos.telefono.trim(),
    servicio_id: datos.servicioId,
    servicio_nombre: servicio.nombre,
    fecha: datos.fecha,
    hora_inicio: datos.hora,
    duracion_min: servicio.duracion_min,
    estado: "pendiente",
    notas: datos.notas.trim(),
  });

  if (error) {
    return { ok: false, error: "No se pudo registrar la cita. Intenta de nuevo." };
  }

  return { ok: true };
}
