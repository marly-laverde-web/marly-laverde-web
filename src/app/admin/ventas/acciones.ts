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

export interface ItemVenta {
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface DatosVenta {
  items: ItemVenta[];
  cliente_nombre: string;
  cliente_telefono: string;
  medio_pago: MedioPago;
  cita_id: string | null;
  notas: string;
}

export async function registrarVenta(d: DatosVenta): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const filas = d.items
    .filter((it) => it.descripcion.trim() && it.precio > 0)
    .map((it) => ({
      descripcion: it.descripcion.trim(),
      cliente_nombre: d.cliente_nombre.trim(),
      cliente_telefono: d.cliente_telefono.trim(),
      cantidad: it.cantidad || 1,
      total: (it.cantidad || 1) * it.precio,
      medio_pago: d.medio_pago,
      cita_id: d.cita_id,
      notas: d.notas.trim(),
    }));

  if (filas.length === 0) {
    return { ok: false, error: "Agrega al menos un ítem con su valor." };
  }

  const { error } = await supabase.from("ventas").insert(filas);
  if (error) return { ok: false, error: "No se pudo registrar la venta." };

  // Si viene de una cita, marcarla como atendida
  if (d.cita_id) {
    await supabase.from("citas").update({ estado: "atendida" }).eq("id", d.cita_id);
  }

  revalidatePath("/admin/ventas");
  revalidatePath("/admin/reportes");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/agenda");
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
