import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminAgenda from "@/components/admin/AdminAgenda";

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const fecha = params.fecha || ahoraColombia().fecha;

  const supabase = await crearClienteServidor();

  const [{ data: citas }, { data: servicios }] = await Promise.all([
    supabase
      .from("citas")
      .select("*")
      .eq("fecha", fecha)
      .order("hora_inicio", { ascending: true }),
    supabase
      .from("servicios")
      .select("id, nombre, categoria, duracion_min, precio, intervalo_retoque_dias")
      .eq("activo", true)
      .order("categoria", { ascending: true })
      .order("nombre", { ascending: true }),
  ]);

  return (
    <AdminAgenda fecha={fecha} citas={citas ?? []} servicios={servicios ?? []} />
  );
}
