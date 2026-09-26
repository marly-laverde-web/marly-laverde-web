"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { descontarStock } from "@/lib/inventario";
import type { EstadoCita, MedioPago } from "@/lib/tipos";

export interface ItemCobro {
  descripcion: string;
  cantidad: number;
  precio: number;
  producto_id?: string | null;
  costo?: number;
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

export interface DatosCitaAdmin {
  servicioId: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  estado: EstadoCita;
  notas: string;
}

export async function crearCitaAdmin(d: DatosCitaAdmin): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.nombre.trim() || !d.servicioId || !d.fecha || !d.hora) {
    return { ok: false, error: "Completa nombre, servicio, fecha y hora." };
  }

  const { data: servicio } = await supabase
    .from("servicios")
    .select("nombre, duracion_min")
    .eq("id", d.servicioId)
    .single();

  if (!servicio) return { ok: false, error: "Servicio no encontrado." };

  const { error } = await supabase.from("citas").insert({
    cliente_nombre: d.nombre.trim(),
    cliente_telefono: d.telefono.trim(),
    servicio_id: d.servicioId,
    servicio_nombre: servicio.nombre,
    fecha: d.fecha,
    hora_inicio: d.hora,
    duracion_min: servicio.duracion_min,
    estado: d.estado,
    notas: d.notas.trim(),
  });

  if (error) return { ok: false, error: "No se pudo crear la cita." };

  // Registrar/actualizar la ficha de la clienta
  if (d.telefono.trim()) {
    await supabase.from("clientes").upsert(
      { nombre: d.nombre.trim(), telefono: d.telefono.trim() },
      { onConflict: "telefono", ignoreDuplicates: true }
    );
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true };
}

export interface DatosEditarCita {
  citaId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  notas: string;
}

/** Reprograma o edita una cita existente (fecha, hora, servicio, datos). */
export async function actualizarCita(d: DatosEditarCita): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!d.nombre.trim() || !d.servicioId || !d.fecha || !d.hora) {
    return { ok: false, error: "Completa nombre, servicio, fecha y hora." };
  }

  const { data: servicio } = await supabase
    .from("servicios")
    .select("nombre, duracion_min")
    .eq("id", d.servicioId)
    .single();
  if (!servicio) return { ok: false, error: "Servicio no encontrado." };

  const { error } = await supabase
    .from("citas")
    .update({
      servicio_id: d.servicioId,
      servicio_nombre: servicio.nombre,
      duracion_min: servicio.duracion_min,
      fecha: d.fecha,
      hora_inicio: d.hora,
      cliente_nombre: d.nombre.trim(),
      cliente_telefono: d.telefono.trim(),
      notas: d.notas.trim(),
    })
    .eq("id", d.citaId);

  if (error) return { ok: false, error: "No se pudo actualizar la cita." };
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true };
}

export async function actualizarEstadoCita(
  id: string,
  estado: EstadoCita
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("citas").update({ estado }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar." };
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Da por terminado el servicio (estado "atendida") y, si se indica, programa
 * el próximo retoque para hacer seguimiento a la clienta.
 */
export async function finalizarCita(
  citaId: string,
  opciones: {
    items: ItemCobro[];
    medioPago: MedioPago;
    profesionalNombre: string;
    fechaRetoque: string | null;
    notasRetoque: string;
  }
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };

  const { data: cita } = await supabase
    .from("citas")
    .select("*")
    .eq("id", citaId)
    .single();
  if (!cita) return { ok: false, error: "Cita no encontrada." };

  // 1. Marcar la cita como atendida
  const { error } = await supabase
    .from("citas")
    .update({ estado: "atendida" })
    .eq("id", citaId);
  if (error) return { ok: false, error: "No se pudo finalizar la cita." };

  // 2. Registrar el cobro (una fila de venta por cada ítem con valor)
  const itemsValidos = opciones.items.filter(
    (it) => it.descripcion.trim() && it.precio > 0
  );
  const filas = itemsValidos.map((it) => ({
    descripcion: it.descripcion.trim(),
    cliente_nombre: cita.cliente_nombre,
    cliente_telefono: cita.cliente_telefono,
    cantidad: it.cantidad || 1,
    total: (it.cantidad || 1) * it.precio,
    medio_pago: opciones.medioPago,
    cita_id: citaId,
    producto_id: it.producto_id ?? null,
    costo_unitario: it.costo ?? 0,
    profesional_nombre: opciones.profesionalNombre.trim(),
  }));
  if (filas.length > 0) {
    const { error: errVenta } = await supabase.from("ventas").insert(filas);
    if (errVenta) {
      return {
        ok: false,
        error: "La cita se finalizó, pero no se pudo registrar el cobro.",
      };
    }
    // Descontar del inventario los productos vendidos
    await descontarStock(supabase, itemsValidos);
  }

  // 3. Programar el próximo retoque (opcional)
  if (opciones.fechaRetoque) {
    await supabase.from("retoques").insert({
      cliente_nombre: cita.cliente_nombre,
      cliente_telefono: cita.cliente_telefono,
      servicio_id: cita.servicio_id,
      servicio_nombre: cita.servicio_nombre,
      fecha_retoque: opciones.fechaRetoque,
      estado: "pendiente",
      cita_origen_id: citaId,
      notas: opciones.notasRetoque.trim(),
    });
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/retoques");
  revalidatePath("/admin/ventas");
  revalidatePath("/admin/reportes");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  return { ok: true };
}

export async function eliminarCita(id: string): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  const { error } = await supabase.from("citas").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true };
}
