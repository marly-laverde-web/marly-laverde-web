"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export interface DatosProducto {
  id?: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number | null;
  referencia: string | null;
  disponible: boolean;
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
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");
}

export async function guardarProducto(d: DatosProducto): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.nombre.trim()) return { ok: false, error: "El nombre es obligatorio." };

  const payload = {
    nombre: d.nombre.trim(),
    categoria: d.categoria.trim() || "General",
    descripcion: d.descripcion.trim(),
    precio: d.precio,
    referencia: d.referencia?.trim() || null,
    disponible: d.disponible,
    destacado: d.destacado,
    activo: d.activo,
    imagen_url: d.imagen_url || null,
  };

  const { error } = d.id
    ? await supabase.from("productos").update(payload).eq("id", d.id)
    : await supabase.from("productos").insert(payload);

  if (error) return { ok: false, error: "No se pudo guardar el producto." };
  revalidar();
  return { ok: true };
}

export async function eliminarProducto(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}
