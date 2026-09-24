"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoRetoque } from "@/lib/tipos";

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

function revalidar() {
  revalidatePath("/admin/retoques");
  revalidatePath("/admin");
}

export async function actualizarEstadoRetoque(
  id: string,
  estado: EstadoRetoque
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("retoques").update({ estado }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar." };
  revalidar();
  return { ok: true };
}

export async function modificarFechaRetoque(
  id: string,
  fecha: string
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!fecha) return { ok: false, error: "Selecciona una fecha." };
  const { error } = await supabase
    .from("retoques")
    .update({ fecha_retoque: fecha, estado: "pendiente" })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo modificar la fecha." };
  revalidar();
  return { ok: true };
}

export async function eliminarRetoque(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("retoques").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}
