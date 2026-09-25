import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminCuentasPorPagar from "@/components/admin/AdminCuentasPorPagar";

export const dynamic = "force-dynamic";

export default async function CuentasPorPagarPage() {
  const supabase = await crearClienteServidor();
  const hoy = ahoraColombia().fecha;

  const [{ data: facturas }, { data: abonos }] = await Promise.all([
    supabase
      .from("facturas_pagar")
      .select("*")
      .order("fecha_vencimiento", { ascending: true }),
    supabase.from("abonos").select("*").order("fecha", { ascending: false }),
  ]);

  return (
    <AdminCuentasPorPagar
      facturas={facturas ?? []}
      abonos={abonos ?? []}
      hoy={hoy}
    />
  );
}
