"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export interface DatosServicio {
  id?: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number | null;
  duracion_min: number;
  intervalo_retoque_dias: number | null;
  destacado: boolean;
  activo: boolean;
  imagen_url: string | null;
}

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
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
  revalidatePath("/");
  revalidatePath("/agendar");
}

export async function guardarServicio(d: DatosServicio): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.nombre.trim() || !d.categoria.trim()) {
    return { ok: false, error: "El nombre y la categoría son obligatorios." };
  }

  const payload = {
    nombre: d.nombre.trim(),
    categoria: d.categoria.trim(),
    descripcion: d.descripcion.trim(),
    precio: d.precio,
    duracion_min: d.duracion_min || 60,
    intervalo_retoque_dias: d.intervalo_retoque_dias,
    destacado: d.destacado,
    activo: d.activo,
    imagen_url: d.imagen_url || null,
  };

  const { error } = d.id
    ? await supabase.from("servicios").update(payload).eq("id", d.id)
    : await supabase.from("servicios").insert(payload);

  if (error) return { ok: false, error: "No se pudo guardar el servicio." };
  revalidar();
  return { ok: true };
}

export async function eliminarServicio(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("servicios").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}
