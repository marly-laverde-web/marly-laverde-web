import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminReportes from "@/components/admin/AdminReportes";

export const dynamic = "force-dynamic";

export default async function AdminReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const hoy = ahoraColombia().fecha;
  const desde = params.desde || `${hoy.slice(0, 7)}-01`;
  const hasta = params.hasta || hoy;

  const supabase = await crearClienteServidor();

  const [{ data: ventas }, { data: citas }] = await Promise.all([
    supabase
      .from("ventas")
      .select("*")
      .gte("fecha", `${desde}T00:00:00-05:00`)
      .lte("fecha", `${hasta}T23:59:59-05:00`)
      .order("fecha", { ascending: false }),
    supabase
      .from("citas")
      .select("servicio_nombre, estado, fecha")
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .eq("estado", "atendida"),
  ]);

  return (
    <AdminReportes
      ventas={ventas ?? []}
      citas={citas ?? []}
      desde={desde}
      hasta={hasta}
    />
  );
}
