import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminRetoques from "@/components/admin/AdminRetoques";

export const dynamic = "force-dynamic";

export default async function AdminRetoquesPage() {
  const supabase = await crearClienteServidor();
  const hoy = ahoraColombia().fecha;

  const { data } = await supabase
    .from("retoques")
    .select("*")
    .in("estado", ["pendiente", "recordada"])
    .order("fecha_retoque", { ascending: true });

  return <AdminRetoques retoques={data ?? []} hoy={hoy} />;
}
