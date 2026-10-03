import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminCuentasPorCobrar from "@/components/admin/AdminCuentasPorCobrar";

export const dynamic = "force-dynamic";

export default async function CuentasPorCobrarPage() {
  const supabase = await crearClienteServidor();
  const hoy = ahoraColombia().fecha;

  // Ventas a crédito (servicios/productos que las clientas quedaron debiendo)
  const [{ data: ventas }, { data: abonos }] = await Promise.all([
    supabase
      .from("ventas")
      .select("*")
      .eq("medio_pago", "credito")
      .order("fecha_pago_credito", { ascending: true }),
    supabase
      .from("abonos_credito")
      .select("*")
      .order("fecha", { ascending: false }),
  ]);

  return (
    <AdminCuentasPorCobrar
      ventas={ventas ?? []}
      abonos={abonos ?? []}
      hoy={hoy}
    />
  );
}
