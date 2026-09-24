import { crearClienteServidor } from "@/lib/supabase/server";
import AdminGaleria from "@/components/admin/AdminGaleria";

export const dynamic = "force-dynamic";

export default async function AdminGaleriaPage() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("galeria")
    .select("*")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });

  return <AdminGaleria inicial={data ?? []} />;
}
