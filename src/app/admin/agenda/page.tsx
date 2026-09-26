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

  const [
    { data: citas },
    { data: servicios },
    { data: productos },
    { data: clientes },
    { data: profesionales },
  ] = await Promise.all([
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
      supabase
        .from("productos")
        .select("id, nombre, precio, costo")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase
        .from("clientes")
        .select("nombre, telefono")
        .order("nombre", { ascending: true }),
      supabase.from("profesionales").select("nombre").eq("activo", true).order("nombre"),
    ]);

  return (
    <AdminAgenda
      fecha={fecha}
      citas={citas ?? []}
      servicios={servicios ?? []}
      productos={productos ?? []}
      clientes={clientes ?? []}
      profesionales={(profesionales ?? []).map((p) => p.nombre)}
    />
  );
}
