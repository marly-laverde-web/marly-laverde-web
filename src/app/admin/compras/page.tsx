import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminCompras from "@/components/admin/AdminCompras";

export const dynamic = "force-dynamic";

export default async function AdminComprasPage() {
  const supabase = await crearClienteServidor();
  const hoy = ahoraColombia().fecha;
  const inicioMes = `${hoy.slice(0, 7)}-01`;

  const { data: compras } = await supabase
    .from("compras")
    .select("*")
    .gte("fecha", inicioMes)
    .order("fecha", { ascending: false });

  return <AdminCompras compras={compras ?? []} hoy={hoy} />;
}
