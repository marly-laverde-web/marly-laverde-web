"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";

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

/** Suma (entrada) o resta (salida) unidades al stock de un producto. */
export async function ajustarStock(
  id: string,
  cantidad: number
): Promise<Respuesta> {
  const { supabase, user } = await clienteAutenticado();
  if (!user) return { ok: false, error: "No autorizado" };
  if (!cantidad) return { ok: false, error: "Indica una cantidad." };

  const { data: producto } = await supabase
    .from("productos")
    .select("stock")
    .eq("id", id)
    .single();
  if (!producto) return { ok: false, error: "Producto no encontrado." };

  const nuevo = Math.max(0, (producto.stock ?? 0) + cantidad);
  const { error } = await supabase
    .from("productos")
    .update({ stock: nuevo })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar el stock." };

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  return { ok: true };
}
