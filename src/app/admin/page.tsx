import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import { formatCOP } from "@/lib/format";
import { ESTADOS_CITA, NOMBRES_DIAS } from "@/lib/tipos";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

function fechaBogota(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

function fechaLegible(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${NOMBRES_DIAS[dt.getUTCDay()]} ${d}/${m}`;
}

function sumarDiasFecha(fecha: string, n: number) {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().split("T")[0];
}

export default async function DashboardPage() {
  const supabase = await crearClienteServidor();
  const hoy = ahoraColombia().fecha;
  const inicioMes = `${hoy.slice(0, 7)}-01T00:00:00-05:00`;
  const limiteRetoque = sumarDiasFecha(hoy, 3);

  const [
    { data: citasHoy },
    { data: proximas },
    { data: ventasMes },
    { count: nServicios },
    { count: nProductos },
    { data: retoquesProx },
  ] = await Promise.all([
    supabase.from("citas").select("*").eq("fecha", hoy).order("hora_inicio"),
    supabase
      .from("citas")
      .select("*")
      .gt("fecha", hoy)
      .in("estado", ["pendiente", "confirmada"])
      .order("fecha")
      .order("hora_inicio")
      .limit(5),
    supabase.from("ventas").select("total, fecha, medio_pago").gte("fecha", inicioMes),
    supabase.from("servicios").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("productos").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase
      .from("retoques")
      .select("*")
      .in("estado", ["pendiente", "recordada"])
      .lte("fecha_retoque", limiteRetoque)
      .order("fecha_retoque", { ascending: true }),
  ]);

  const totalMes = (ventasMes ?? []).reduce((a, v) => a + (v.total ?? 0), 0);
  const totalHoy = (ventasMes ?? [])
    .filter((v) => fechaBogota(v.fecha) === hoy)
    .reduce((a, v) => a + (v.total ?? 0), 0);
  const pendientes = (citasHoy ?? []).filter(
    (c) => c.estado === "pendiente"
  ).length;

  const nRetoques = (retoquesProx ?? []).length;
  const tarjetas = [
    { titulo: "Citas de hoy", valor: (citasHoy ?? []).length, sub: `${pendientes} pendientes` },
    { titulo: "Ingresos de hoy", valor: formatCOP(totalHoy), sub: "" },
    { titulo: "Ingresos del mes", valor: formatCOP(totalMes), sub: "" },
    { titulo: "Retoques por avisar", valor: nRetoques, sub: "próximos 3 días" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">Panel</h1>
        <p className="mt-1 text-sm text-muted">
          Resumen del día — {fechaLegible(hoy)}
        </p>
      </div>

      {/* Tarjetas */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.titulo} className="rounded-2xl border border-line bg-white/70 p-5">
            <p className="text-xs uppercase tracking-wider text-muted">{t.titulo}</p>
            <p className="mt-1 font-serif text-2xl text-ink">{t.valor}</p>
            {t.sub && <p className="text-xs text-muted">{t.sub}</p>}
          </div>
        ))}
      </div>

      {/* Alerta de retoques */}
      {nRetoques > 0 && (
        <div className="mb-8 rounded-2xl border border-rose/40 bg-rose-soft/30 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">
              🔔 Retoques por avisar ({nRetoques})
            </h2>
            <Link href="/admin/retoques" className="text-sm font-medium text-rose hover:underline">
              Gestionar →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {(retoquesProx ?? []).slice(0, 5).map((r: any) => (
              <li key={r.id} className="flex items-center gap-3">
                <span className="w-24 text-muted">{fechaLegible(r.fecha_retoque)}</span>
                <span className="flex-1">
                  <span className="font-medium text-ink">{r.cliente_nombre}</span>
                  <span className="text-muted"> · {r.servicio_nombre}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Citas de hoy */}
        <div className="rounded-2xl border border-line bg-white/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink">Agenda de hoy</h2>
            <Link href="/admin/agenda" className="text-sm font-medium text-rose hover:underline">
              Ver agenda →
            </Link>
          </div>
          {(citasHoy ?? []).length === 0 ? (
            <p className="text-sm text-muted">No hay citas para hoy.</p>
          ) : (
            <ul className="space-y-3">
              {(citasHoy ?? []).map((c: any) => {
                const est = ESTADOS_CITA.find((e) => e.valor === c.estado);
                return (
                  <li key={c.id} className="flex items-center gap-3 text-sm">
                    <span className="w-14 font-semibold text-ink">
                      {c.hora_inicio?.slice(0, 5)}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium text-ink">{c.cliente_nombre}</span>
                      <span className="text-muted"> · {c.servicio_nombre}</span>
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white"
                      style={{ backgroundColor: est?.color }}
                    >
                      {est?.etiqueta}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Próximas citas */}
        <div className="rounded-2xl border border-line bg-white/60 p-6">
          <h2 className="mb-4 font-serif text-xl text-ink">Próximas citas</h2>
          {(proximas ?? []).length === 0 ? (
            <p className="text-sm text-muted">No hay próximas citas.</p>
          ) : (
            <ul className="space-y-3">
              {(proximas ?? []).map((c: any) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-muted">
                    {fechaLegible(c.fecha)} {c.hora_inicio?.slice(0, 5)}
                  </span>
                  <span className="flex-1">
                    <span className="font-medium text-ink">{c.cliente_nombre}</span>
                    <span className="text-muted"> · {c.servicio_nombre}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/agenda" className="btn-secundario !py-2 !text-sm">Agenda</Link>
        <Link href="/admin/servicios" className="btn-secundario !py-2 !text-sm">Servicios</Link>
        <Link href="/admin/ventas" className="btn-secundario !py-2 !text-sm">Registrar venta</Link>
        <Link href="/admin/galeria" className="btn-secundario !py-2 !text-sm">Galería</Link>
      </div>
    </div>
  );
}
