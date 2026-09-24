"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { MedioPago } from "@/lib/tipos";

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

export interface DatosVenta {
  descripcion: string;
  cliente_nombre: string;
  cantidad: number;
  total: number;
  medio_pago: MedioPago;
  cita_id: string | null;
  notas: string;
}

export async function registrarVenta(d: DatosVenta): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.descripcion.trim()) return { ok: false, error: "Escribe qué se vendió." };
  if (!d.total || d.total <= 0) return { ok: false, error: "Escribe un valor válido." };

  const { error } = await supabase.from("ventas").insert({
    descripcion: d.descripcion.trim(),
    cliente_nombre: d.cliente_nombre.trim(),
    cantidad: d.cantidad || 1,
    total: d.total,
    medio_pago: d.medio_pago,
    cita_id: d.cita_id,
    notas: d.notas.trim(),
  });

  if (error) return { ok: false, error: "No se pudo registrar la venta." };

  // Si viene de una cita, marcarla como atendida
  if (d.cita_id) {
    await supabase.from("citas").update({ estado: "atendida" }).eq("id", d.cita_id);
  }

  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
  return { ok: true };
}

export async function eliminarVenta(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("ventas").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
  return { ok: true };
}
