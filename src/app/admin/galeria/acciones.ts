"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export interface DatosFoto {
  id?: string;
  titulo: string;
  categoria: string;
  imagen_url: string;
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
  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
  revalidatePath("/");
}

export async function guardarFoto(d: DatosFoto): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.imagen_url) return { ok: false, error: "Debes subir una foto." };

  const payload = {
    titulo: d.titulo.trim(),
    categoria: d.categoria.trim() || "General",
    imagen_url: d.imagen_url,
  };

  const { error } = d.id
    ? await supabase.from("galeria").update(payload).eq("id", d.id)
    : await supabase.from("galeria").insert(payload);

  if (error) return { ok: false, error: "No se pudo guardar la foto." };
  revalidar();
  return { ok: true };
}

export async function eliminarFoto(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("galeria").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}
