import { crearClienteServidor } from "@/lib/supabase/server";
import AdminInventario from "@/components/admin/AdminInventario";

export const dynamic = "force-dynamic";

export default async function AdminInventarioPage() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("productos")
    .select("id, nombre, categoria, precio, costo, stock, activo")
    .order("nombre", { ascending: true });

  return <AdminInventario productos={data ?? []} />;
}
