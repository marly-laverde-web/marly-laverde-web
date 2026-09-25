"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

export interface DatosCompra {
  fecha: string;
  descripcion: string;
  categoria: string;
  valor: number;
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

export async function registrarCompra(d: DatosCompra): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.descripcion.trim()) return { ok: false, error: "Escribe qué se compró." };
  if (!d.fecha) return { ok: false, error: "Selecciona la fecha." };
  if (!d.valor || d.valor <= 0) return { ok: false, error: "Escribe un valor válido." };

  const { error } = await supabase.from("compras").insert({
    fecha: d.fecha,
    descripcion: d.descripcion.trim(),
    categoria: d.categoria.trim(),
    valor: d.valor,
    notas: d.notas.trim(),
  });

  if (error) return { ok: false, error: "No se pudo registrar la compra." };
  revalidatePath("/admin/compras");
  revalidatePath("/admin/reportes");
  return { ok: true };
}

export async function eliminarCompra(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("compras").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/admin/compras");
  revalidatePath("/admin/reportes");
  return { ok: true };
}
