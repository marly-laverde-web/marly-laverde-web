"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Horario } from "@/lib/tipos";

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

export async function guardarHorarios(horarios: Horario[]): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const filas = horarios.map((h) => ({
    dia_semana: h.dia_semana,
    abierto: h.abierto,
    hora_inicio: h.hora_inicio,
    hora_fin: h.hora_fin,
  }));

  const { error } = await supabase
    .from("horarios")
    .upsert(filas, { onConflict: "dia_semana" });
  if (error) return { ok: false, error: "No se pudieron guardar los horarios." };
  revalidatePath("/admin/configuracion");
  return { ok: true };
}

export async function guardarConfig(
  intervalo_slots: number,
  anticipacion_horas: number
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const { error } = await supabase
    .from("configuracion")
    .upsert(
      { id: 1, intervalo_slots, anticipacion_horas },
      { onConflict: "id" }
    );
  if (error) return { ok: false, error: "No se pudo guardar la configuración." };
  revalidatePath("/admin/configuracion");
  return { ok: true };
}

export async function agregarBloqueo(d: {
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  motivo: string;
}): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.fecha) return { ok: false, error: "Selecciona una fecha." };

  const { error } = await supabase.from("bloqueos").insert({
    fecha: d.fecha,
    hora_inicio: d.hora_inicio || null,
    hora_fin: d.hora_fin || null,
    motivo: d.motivo.trim(),
  });
  if (error) return { ok: false, error: "No se pudo agregar el bloqueo." };
  revalidatePath("/admin/configuracion");
  return { ok: true };
}

export async function guardarProfesional(d: {
  id?: string;
  nombre: string;
  activo: boolean;
}): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.nombre.trim()) return { ok: false, error: "Escribe el nombre." };

  const payload = { nombre: d.nombre.trim(), activo: d.activo };
  const { error } = d.id
    ? await supabase.from("profesionales").update(payload).eq("id", d.id)
    : await supabase.from("profesionales").insert(payload);
  if (error) return { ok: false, error: "No se pudo guardar el profesional." };
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/ventas");
  revalidatePath("/admin/agenda");
  return { ok: true };
}

export async function eliminarProfesional(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("profesionales").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/admin/configuracion");
  return { ok: true };
}

export async function eliminarBloqueo(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("bloqueos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/admin/configuracion");
  return { ok: true };
}
