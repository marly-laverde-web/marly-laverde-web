import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminCuentasPorCobrar from "@/components/admin/AdminCuentasPorCobrar";

export const dynamic = "force-dynamic";

export default async function CuentasPorCobrarPage() {
  const supabase = await crearClienteServidor();
  const hoy = ahoraColombia().fecha;

  // Ventas a crédito (servicios/productos que las clientas quedaron debiendo)
  const { data: ventas } = await supabase
    .from("ventas")
    .select("*")
    .eq("medio_pago", "credito")
    .order("fecha_pago_credito", { ascending: true });

  return <AdminCuentasPorCobrar ventas={ventas ?? []} hoy={hoy} />;
}
