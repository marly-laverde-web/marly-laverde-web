import { crearClienteServidor } from "@/lib/supabase/server";
import { ahoraColombia } from "@/lib/disponibilidad";
import AdminConfiguracion from "@/components/admin/AdminConfiguracion";
import type { Horario } from "@/lib/tipos";

export const dynamic = "force-dynamic";

const HORARIO_DEFECTO = (dia: number): Horario => ({
  dia_semana: dia,
  abierto: dia !== 0,
  hora_inicio: "09:00",
  hora_fin: "19:00",
});

export default async function AdminConfiguracionPage() {
  const supabase = await crearClienteServidor();
  const hoy = ahoraColombia().fecha;

  const [{ data: horariosDB }, { data: config }, { data: bloqueos }, { data: profesionales }] =
    await Promise.all([
      supabase.from("horarios").select("*").order("dia_semana", { ascending: true }),
      supabase.from("configuracion").select("*").eq("id", 1).single(),
      supabase
        .from("bloqueos")
        .select("*")
        .gte("fecha", hoy)
        .order("fecha", { ascending: true }),
      supabase.from("profesionales").select("*").order("nombre", { ascending: true }),
    ]);

  // Asegurar que existan los 7 días
  const horarios: Horario[] = [];
  for (let d = 0; d < 7; d++) {
    const existente = (horariosDB ?? []).find((h) => h.dia_semana === d);
    horarios.push(
      existente
        ? {
            dia_semana: d,
            abierto: existente.abierto,
            hora_inicio: existente.hora_inicio?.slice(0, 5) ?? "09:00",
            hora_fin: existente.hora_fin?.slice(0, 5) ?? "19:00",
          }
        : HORARIO_DEFECTO(d)
    );
  }

  return (
    <AdminConfiguracion
      horarios={horarios}
      intervalo={config?.intervalo_slots ?? 30}
      anticipacion={config?.anticipacion_horas ?? 2}
      bloqueos={bloqueos ?? []}
      profesionales={profesionales ?? []}
    />
  );
}
