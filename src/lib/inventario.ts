import "server-only";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ItemConProducto {
  producto_id?: string | null;
  cantidad: number;
}

/**
 * Descuenta del stock los productos vendidos.
 * Recibe el cliente de Supabase ya autenticado y la lista de ítems vendidos.
 */
export async function descontarStock(
  supabase: any,
  items: ItemConProducto[]
): Promise<void> {
  const productos = items.filter((it) => it.producto_id);
  for (const it of productos) {
    const { data: p } = await supabase
      .from("productos")
      .select("stock")
      .eq("id", it.producto_id)
      .single();
    if (!p) continue;
    const nuevo = Math.max(0, (p.stock ?? 0) - (it.cantidad || 1));
    await supabase.from("productos").update({ stock: nuevo }).eq("id", it.producto_id);
  }
}
