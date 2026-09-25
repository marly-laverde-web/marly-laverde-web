import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminVentas from "@/components/admin/AdminVentas";

export const dynamic = "force-dynamic";

export default async function AdminVentasPage({
  searchParams,
}: {
  searchParams: Promise<{
    cita?: string;
    cliente?: string;
    tel?: string;
    desc?: string;
    total?: string;
  }>;
}) {
  const params = await searchParams;
  const hoy = ahoraColombia().fecha; // YYYY-MM-DD
  const inicioMes = `${hoy.slice(0, 7)}-01T00:00:00-05:00`;

  const supabase = await crearClienteServidor();

  const [{ data: ventas }, { data: servicios }, { data: productos }] =
    await Promise.all([
      supabase
        .from("ventas")
        .select("*")
        .gte("fecha", inicioMes)
        .order("fecha", { ascending: false }),
      supabase.from("servicios").select("nombre, precio").eq("activo", true),
      supabase.from("productos").select("id, nombre, precio, costo").eq("activo", true),
    ]);

  const catalogo = [
    ...(servicios ?? []).map((s) => ({
      nombre: s.nombre,
      precio: s.precio,
      productoId: null as string | null,
      costo: 0,
    })),
    ...(productos ?? []).map((p) => ({
      nombre: p.nombre,
      precio: p.precio,
      productoId: p.id as string,
      costo: p.costo ?? 0,
    })),
  ];

  return (
    <AdminVentas
      ventas={ventas ?? []}
      catalogo={catalogo}
      hoy={hoy}
      prefill={{
        cita: params.cita ?? null,
        cliente: params.cliente ?? "",
        tel: params.tel ?? "",
        desc: params.desc ?? "",
        total: params.total ?? "",
      }}
    />
  );
}
