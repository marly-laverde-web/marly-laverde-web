import { crearClienteServidor } from "@/lib/supabase/server";
import AdminProductos from "@/components/admin/AdminProductos";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("productos")
    .select("*")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  return <AdminProductos inicial={data ?? []} />;
}
