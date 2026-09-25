"use server";

import { crearClienteServicio, servicioConfigurado } from "@/lib/supabase/admin";
import { obtenerDisponibilidad } from "@/lib/disponibilidad";

export interface DatosCita {
  servicioIds: string[];
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
  if (!datos.servicioIds?.length || !datos.fecha || !datos.hora) {
    return { ok: false, error: "Selecciona servicio, fecha y hora." };
  }

  const supabase = crearClienteServicio();

  // Datos de los servicios seleccionados
  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_min, activo")
    .in("id", datos.servicioIds);

  // Conservar el orden en que la clienta los eligió
  const ordenados = datos.servicioIds
    .map((id) => (servicios ?? []).find((s) => s.id === id))
    .filter(Boolean) as { id: string; nombre: string; duracion_min: number; activo: boolean }[];

  if (ordenados.length === 0) {
    return { ok: false, error: "El servicio ya no está disponible." };
  }
  if (ordenados.some((s) => s.activo === false)) {
    return { ok: false, error: "Uno de los servicios ya no está disponible." };
  }

  const duracionTotal = ordenados.reduce((a, s) => a + s.duracion_min, 0);
  const nombreServicios = ordenados.map((s) => s.nombre).join(" + ");

  // Verificar que la hora siga libre (evita reservas dobles)
  const disp = await obtenerDisponibilidad(datos.servicioIds, datos.fecha);
  if (!disp.horas.includes(datos.hora)) {
    return {
      ok: false,
      error: "Ese horario ya no está disponible. Por favor elige otro.",
    };
  }

  const { error } = await supabase.from("citas").insert({
    cliente_nombre: datos.nombre.trim(),
    cliente_telefono: datos.telefono.trim(),
    servicio_id: ordenados.length === 1 ? ordenados[0].id : null,
    servicio_nombre: nombreServicios,
    fecha: datos.fecha,
    hora_inicio: datos.hora,
    duracion_min: duracionTotal,
    estado: "pendiente",
    notas: datos.notas.trim(),
  });

  if (error) {
    return { ok: false, error: "No se pudo registrar la cita. Intenta de nuevo." };
  }

  // Registrar/actualizar la ficha de la clienta (sin sobrescribir si ya existe)
  if (datos.telefono.trim()) {
    await supabase.from("clientes").upsert(
      { nombre: datos.nombre.trim(), telefono: datos.telefono.trim() },
      { onConflict: "telefono", ignoreDuplicates: true }
    );
  }

  return { ok: true };
}
