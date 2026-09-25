import { crearClienteServicio, servicioConfigurado } from "./supabase/admin";

/* ---------- Utilidades de tiempo ---------- */

/** "09:30" o "09:30:00" -> 570 (minutos desde medianoche). */
export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

/** 570 -> "09:30". */
export function minutosAHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Día de la semana (0=Dom..6=Sáb) de una fecha 'YYYY-MM-DD'. */
export function diaSemanaDeFecha(fecha: string): number {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Fecha y hora actuales en la zona horaria de Colombia. */
export function ahoraColombia(): { fecha: string; minutos: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const partes = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const fecha = `${partes.year}-${partes.month}-${partes.day}`;
  const hora24 = partes.hour === "24" ? "00" : partes.hour;
  const minutos = parseInt(hora24, 10) * 60 + parseInt(partes.minute, 10);
  return { fecha, minutos };
}

interface Ocupado {
  inicio: number; // minutos
  fin: number;
}

/**
 * Calcula las horas de inicio disponibles para un servicio en una fecha.
 * (Función pura: fácil de probar y sin dependencias externas.)
 */
export function calcularHorasDisponibles(opciones: {
  fecha: string;
  duracionMin: number;
  intervaloSlots: number;
  anticipacionHoras: number;
  horaInicio: string; // apertura
  horaFin: string; // cierre
  ocupados: Ocupado[];
}): string[] {
  const {
    fecha,
    duracionMin,
    intervaloSlots,
    anticipacionHoras,
    horaInicio,
    horaFin,
    ocupados,
  } = opciones;

  const apertura = horaAMinutos(horaInicio);
  const cierre = horaAMinutos(horaFin);
  const paso = Math.max(5, intervaloSlots);

  const ahora = ahoraColombia();
  const esHoy = ahora.fecha === fecha;
  const minimoHoy = ahora.minutos + anticipacionHoras * 60;

  const disponibles: string[] = [];

  for (let t = apertura; t + duracionMin <= cierre; t += paso) {
    // No ofrecer horarios que ya pasaron (o dentro del margen de anticipación).
    if (esHoy && t < minimoHoy) continue;

    const finSlot = t + duracionMin;
    const chocaConOcupado = ocupados.some(
      (o) => t < o.fin && o.inicio < finSlot
    );
    if (!chocaConOcupado) disponibles.push(minutosAHora(t));
  }

  return disponibles;
}

export interface ResultadoDisponibilidad {
  disponible: boolean;
  horas: string[];
  motivo?: string;
}

/**
 * Obtiene la disponibilidad real consultando la base de datos.
 * Se ejecuta en el servidor con la clave de servicio (omite RLS de forma segura).
 */
export async function obtenerDisponibilidad(
  servicioIds: string[],
  fecha: string
): Promise<ResultadoDisponibilidad> {
  if (!servicioConfigurado()) {
    return { disponible: false, horas: [], motivo: "Agenda no configurada" };
  }
  if (!servicioIds || servicioIds.length === 0) {
    return { disponible: false, horas: [], motivo: "Sin servicio" };
  }

  const supabase = crearClienteServicio();

  // 1. Servicios seleccionados (la duración total es la suma)
  const { data: servicios } = await supabase
    .from("servicios")
    .select("duracion_min")
    .in("id", servicioIds);
  if (!servicios || servicios.length === 0) {
    return { disponible: false, horas: [], motivo: "Servicio no encontrado" };
  }
  const duracionMin = servicios.reduce(
    (a, s) => a + (s.duracion_min || 0),
    0
  ) as number;

  // 2. Horario del día
  const dia = diaSemanaDeFecha(fecha);
  const { data: horario } = await supabase
    .from("horarios")
    .select("*")
    .eq("dia_semana", dia)
    .single();
  if (!horario || !horario.abierto) {
    return { disponible: false, horas: [], motivo: "Cerrado ese día" };
  }

  // 3. Configuración
  const { data: config } = await supabase
    .from("configuracion")
    .select("*")
    .eq("id", 1)
    .single();
  const intervaloSlots = config?.intervalo_slots ?? 30;
  const anticipacionHoras = config?.anticipacion_horas ?? 2;

  // 4. Citas ocupadas ese día
  const { data: citas } = await supabase
    .from("citas")
    .select("hora_inicio, duracion_min, estado")
    .eq("fecha", fecha)
    .in("estado", ["pendiente", "confirmada", "atendida"]);

  const ocupados: Ocupado[] = (citas ?? []).map((c) => {
    const inicio = horaAMinutos(c.hora_inicio);
    return { inicio, fin: inicio + (c.duracion_min ?? 60) };
  });

  // 5. Bloqueos ese día
  const { data: bloqueos } = await supabase
    .from("bloqueos")
    .select("hora_inicio, hora_fin")
    .eq("fecha", fecha);

  for (const b of bloqueos ?? []) {
    if (!b.hora_inicio) {
      // Bloqueo de todo el día
      return { disponible: false, horas: [], motivo: "Día no disponible" };
    }
    ocupados.push({
      inicio: horaAMinutos(b.hora_inicio),
      fin: horaAMinutos(b.hora_fin ?? "23:59"),
    });
  }

  const horas = calcularHorasDisponibles({
    fecha,
    duracionMin,
    intervaloSlots,
    anticipacionHoras,
    horaInicio: horario.hora_inicio,
    horaFin: horario.hora_fin,
    ocupados,
  });

  return { disponible: horas.length > 0, horas };
}
