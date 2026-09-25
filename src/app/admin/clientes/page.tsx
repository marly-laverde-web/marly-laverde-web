import { crearClienteServidor } from "@/lib/supabase/server";
import AdminClientes from "@/components/admin/AdminClientes";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const supabase = await crearClienteServidor();

  const [{ data: clientes }, { data: citas }, { data: ventas }, { data: retoques }] =
    await Promise.all([
      supabase.from("clientes").select("*").order("nombre", { ascending: true }),
      supabase
        .from("citas")
        .select("cliente_nombre, cliente_telefono, servicio_nombre, fecha, hora_inicio, estado")
        .order("fecha", { ascending: false }),
      supabase
        .from("ventas")
        .select("cliente_nombre, cliente_telefono, descripcion, total, fecha")
        .order("fecha", { ascending: false }),
      supabase
        .from("retoques")
        .select("cliente_telefono, servicio_nombre, fecha_retoque, estado")
        .in("estado", ["pendiente", "recordada"]),
    ]);

  return (
    <AdminClientes
      clientes={clientes ?? []}
      citas={citas ?? []}
      ventas={ventas ?? []}
      retoques={retoques ?? []}
    />
  );
}
