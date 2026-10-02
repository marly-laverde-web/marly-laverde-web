"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { descontarStock } from "@/lib/inventario";
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
  producto_id?: string | null;
  costo?: number;
}

export interface DatosVenta {
  items: ItemVenta[];
  cliente_nombre: string;
  cliente_telefono: string;
  medio_pago: MedioPago;
  profesional_nombre: string;
  fecha_pago_credito: string | null;
  cita_id: string | null;
  notas: string;
}

export async function registrarVenta(d: DatosVenta): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (d.medio_pago === "credito" && !d.fecha_pago_credito) {
    return { ok: false, error: "Indica la fecha de pago del crédito." };
  }

  const esCredito = d.medio_pago === "credito";
  const itemsValidos = d.items.filter(
    (it) => it.descripcion.trim() && it.precio > 0
  );
  const filas = itemsValidos.map((it) => ({
    descripcion: it.descripcion.trim(),
    cliente_nombre: d.cliente_nombre.trim(),
    cliente_telefono: d.cliente_telefono.trim(),
    cantidad: it.cantidad || 1,
    total: (it.cantidad || 1) * it.precio,
    medio_pago: d.medio_pago,
    cita_id: d.cita_id,
    producto_id: it.producto_id ?? null,
    costo_unitario: it.costo ?? 0,
    profesional_nombre: d.profesional_nombre.trim(),
    fecha_pago_credito: esCredito ? d.fecha_pago_credito : null,
    credito_pagado: false,
    notas: d.notas.trim(),
  }));

  if (filas.length === 0) {
    return { ok: false, error: "Agrega al menos un ítem con su valor." };
  }

  const { error } = await supabase.from("ventas").insert(filas);
  if (error) return { ok: false, error: "No se pudo registrar la venta." };

  // Descontar del inventario los productos vendidos
  await descontarStock(supabase, itemsValidos);

  // Si viene de una cita, marcarla como atendida
  if (d.cita_id) {
    await supabase.from("citas").update({ estado: "atendida" }).eq("id", d.cita_id);
  }

  revalidatePath("/admin/ventas");
  revalidatePath("/admin/reportes");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/agenda");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/cuentas-por-cobrar");
  revalidatePath("/admin");
  return { ok: true };
}

/** Marca un crédito como pagado (indica con qué medio y cuándo). */
export async function marcarCreditoPagado(
  ventaId: string,
  medio: MedioPago,
  fecha: string
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const { error } = await supabase
    .from("ventas")
    .update({
      credito_pagado: true,
      credito_medio_pago: medio,
      credito_pago_fecha: fecha,
    })
    .eq("id", ventaId);
  if (error) return { ok: false, error: "No se pudo registrar el pago." };

  revalidatePath("/admin/cuentas-por-cobrar");
  revalidatePath("/admin/ventas");
  revalidatePath("/admin/reportes");
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
