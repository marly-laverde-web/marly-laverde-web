"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export interface DatosCliente {
  id?: string;
  nombre: string;
  telefono: string;
  fecha_nacimiento: string | null;
  notas: string;
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

export async function guardarCliente(d: DatosCliente): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.nombre.trim()) return { ok: false, error: "El nombre es obligatorio." };

  const payload = {
    nombre: d.nombre.trim(),
    telefono: d.telefono.trim() || null,
    fecha_nacimiento: d.fecha_nacimiento || null,
    notas: d.notas.trim(),
  };

  const { error } = d.id
    ? await supabase.from("clientes").update(payload).eq("id", d.id)
    : await supabase.from("clientes").insert(payload);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ya existe una clienta con ese teléfono." };
    }
    return { ok: false, error: "No se pudo guardar la clienta." };
  }
  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  return { ok: true };
}

export async function eliminarCliente(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/admin/clientes");
  return { ok: true };
}
