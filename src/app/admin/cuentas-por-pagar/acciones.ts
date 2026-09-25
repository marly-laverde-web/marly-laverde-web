"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  revalidatePath("/admin/cuentas-por-pagar");
  revalidatePath("/admin");
}

/** Recalcula si una factura ya quedó pagada según sus abonos. */
async function recalcularEstado(supabase: any, facturaId: string) {
  const { data: f } = await supabase
    .from("facturas_pagar")
    .select("valor_total")
    .eq("id", facturaId)
    .single();
  if (!f) return;
  const { data: abonos } = await supabase
    .from("abonos")
    .select("valor")
    .eq("factura_id", facturaId);
  const pagado = (abonos ?? []).reduce((a: number, x: any) => a + (x.valor ?? 0), 0);
  const estado = pagado >= f.valor_total ? "pagada" : "pendiente";
  await supabase.from("facturas_pagar").update({ estado }).eq("id", facturaId);
}

export interface DatosFactura {
  id?: string;
  proveedor: string;
  numero: string;
  descripcion: string;
  fecha_compra: string | null;
  fecha_vencimiento: string;
  valor_total: number;
  notas: string;
}

export async function guardarFactura(d: DatosFactura): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.proveedor.trim()) return { ok: false, error: "Escribe el proveedor." };
  if (!d.fecha_vencimiento) return { ok: false, error: "Indica la fecha de vencimiento." };
  if (!d.valor_total || d.valor_total <= 0)
    return { ok: false, error: "Escribe el valor total de la factura." };

  const payload = {
    proveedor: d.proveedor.trim(),
    numero: d.numero.trim(),
    descripcion: d.descripcion.trim(),
    fecha_compra: d.fecha_compra || null,
    fecha_vencimiento: d.fecha_vencimiento,
    valor_total: d.valor_total,
    notas: d.notas.trim(),
  };

  const { error } = d.id
    ? await supabase.from("facturas_pagar").update(payload).eq("id", d.id)
    : await supabase.from("facturas_pagar").insert(payload);

  if (error) return { ok: false, error: "No se pudo guardar la factura." };
  if (d.id) await recalcularEstado(supabase, d.id);
  revalidar();
  return { ok: true };
}

export async function eliminarFactura(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("facturas_pagar").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidar();
  return { ok: true };
}

export async function registrarAbono(d: {
  facturaId: string;
  fecha: string;
  valor: number;
  notas: string;
}): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.fecha) return { ok: false, error: "Indica la fecha del abono." };
  if (!d.valor || d.valor <= 0) return { ok: false, error: "Escribe un valor válido." };

  const { error } = await supabase.from("abonos").insert({
    factura_id: d.facturaId,
    fecha: d.fecha,
    valor: d.valor,
    notas: d.notas.trim(),
  });
  if (error) return { ok: false, error: "No se pudo registrar el abono." };

  await recalcularEstado(supabase, d.facturaId);
  revalidar();
  return { ok: true };
}

export async function eliminarAbono(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const { data: abono } = await supabase
    .from("abonos")
    .select("factura_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("abonos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el abono." };

  if (abono?.factura_id) await recalcularEstado(supabase, abono.factura_id);
  revalidar();
  return { ok: true };
}
