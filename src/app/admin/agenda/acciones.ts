"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoCita } from "@/lib/tipos";

export interface Respuesta {
  ok: boolean;
  error?: string;
}

async function clienteAutenticado() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export interface DatosCitaAdmin {
  servicioId: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  estado: EstadoCita;
  notas: string;
}

export async function crearCitaAdmin(d: DatosCitaAdmin): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.nombre.trim() || !d.servicioId || !d.fecha || !d.hora) {
    return { ok: false, error: "Completa nombre, servicio, fecha y hora." };
  }

  const { data: servicio } = await supabase
    .from("servicios")
    .select("nombre, duracion_min")
    .eq("id", d.servicioId)
    .single();

  if (!servicio) return { ok: false, error: "Servicio no encontrado." };

  const { error } = await supabase.from("citas").insert({
    cliente_nombre: d.nombre.trim(),
    cliente_telefono: d.telefono.trim(),
    servicio_id: d.servicioId,
    servicio_nombre: servicio.nombre,
    fecha: d.fecha,
    hora_inicio: d.hora,
    duracion_min: servicio.duracion_min,
    estado: d.estado,
    notas: d.notas.trim(),
  });

  if (error) return { ok: false, error: "No se pudo crear la cita." };
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true };
}

export async function actualizarEstadoCita(
  id: string,
  estado: EstadoCita
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("citas").update({ estado }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar." };
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Da por terminado el servicio (estado "atendida") y, si se indica, programa
 * el próximo retoque para hacer seguimiento a la clienta.
 */
export async function finalizarCita(
  citaId: string,
  fechaRetoque: string | null,
  notas: string
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const { data: cita } = await supabase
    .from("citas")
    .select("*")
    .eq("id", citaId)
    .single();
  if (!cita) return { ok: false, error: "Cita no encontrada." };

  const { error } = await supabase
    .from("citas")
    .update({ estado: "atendida" })
    .eq("id", citaId);
  if (error) return { ok: false, error: "No se pudo finalizar la cita." };

  if (fechaRetoque) {
    await supabase.from("retoques").insert({
      cliente_nombre: cita.cliente_nombre,
      cliente_telefono: cita.cliente_telefono,
      servicio_id: cita.servicio_id,
      servicio_nombre: cita.servicio_nombre,
      fecha_retoque: fechaRetoque,
      estado: "pendiente",
      cita_origen_id: citaId,
      notas: notas.trim(),
    });
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/retoques");
  revalidatePath("/admin");
  return { ok: true };
}

export async function eliminarCita(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("citas").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true };
}
