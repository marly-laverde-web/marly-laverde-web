import { crearClienteServidor } from "@/lib/supabase/server";
import AdminServicios from "@/components/admin/AdminServicios";

export const dynamic = "force-dynamic";

export default async function AdminServiciosPage() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("servicios")
    .select("*")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  return <AdminServicios inicial={data ?? []} />;
}
