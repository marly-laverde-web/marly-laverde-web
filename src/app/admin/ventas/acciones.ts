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

function revalidarCredito() {
  revalidatePath("/admin/cuentas-por-cobrar");
  revalidatePath("/admin/ventas");
  revalidatePath("/admin/reportes");
  revalidatePath("/admin");
}

/**
 * Recalcula si una deuda a crédito ya quedó saldada con sus abonos.
 * Si lo abonado cubre el total, marca las ventas del grupo como pagadas.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
async function sincronizarEstadoCredito(
  supabase: any,
  grupoClave: string,
  ventaIds: string[]
) {
  if (ventaIds.length === 0) return;
  const { data: ventas } = await supabase
    .from("ventas")
    .select("total")
    .in("id", ventaIds);
  const total = (ventas ?? []).reduce((s: number, v: any) => s + (v.total ?? 0), 0);

  const { data: abonos } = await supabase
    .from("abonos_credito")
    .select("valor, fecha, medio_pago")
    .eq("grupo_clave", grupoClave)
    .order("fecha", { ascending: false });
  const abonado = (abonos ?? []).reduce((s: number, a: any) => s + (a.valor ?? 0), 0);

  const pagado = total > 0 && abonado >= total;
  const ultimo = (abonos ?? [])[0];

  await supabase
    .from("ventas")
    .update({
      credito_pagado: pagado,
      credito_pago_fecha: pagado ? ultimo?.fecha ?? null : null,
      credito_medio_pago: pagado ? ultimo?.medio_pago ?? null : null,
    })
    .in("id", ventaIds);
}

/** Registra un abono a una deuda a crédito (reduce el saldo pendiente). */
export async function registrarAbonoCredito(d: {
  grupoClave: string;
  clienteNombre: string;
  ventaIds: string[];
  fecha: string;
  valor: number;
  medio: MedioPago;
  notas: string;
}): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.fecha) return { ok: false, error: "Indica la fecha del abono." };
  if (!d.valor || d.valor <= 0)
    return { ok: false, error: "Escribe un valor de abono válido." };

  const { error } = await supabase.from("abonos_credito").insert({
    grupo_clave: d.grupoClave,
    cliente_nombre: d.clienteNombre,
    fecha: d.fecha,
    valor: d.valor,
    medio_pago: d.medio,
    notas: d.notas.trim(),
  });
  if (error) return { ok: false, error: "No se pudo registrar el abono." };

  await sincronizarEstadoCredito(supabase, d.grupoClave, d.ventaIds);
  revalidarCredito();
  return { ok: true };
}

/** Elimina un abono y recalcula el saldo de la deuda. */
export async function eliminarAbonoCredito(
  id: string,
  grupoClave: string,
  ventaIds: string[]
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const { error } = await supabase.from("abonos_credito").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el abono." };

  await sincronizarEstadoCredito(supabase, grupoClave, ventaIds);
  revalidarCredito();
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
