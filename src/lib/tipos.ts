/** Tipos compartidos de la plataforma. */

export type EstadoCita =
  | "pendiente"
  | "confirmada"
  | "atendida"
  | "cancelada"
  | "no_asistio";

export const ESTADOS_CITA: { valor: EstadoCita; etiqueta: string; color: string }[] = [
  { valor: "pendiente", etiqueta: "Pendiente", color: "#c4a05a" },
  { valor: "confirmada", etiqueta: "Confirmada", color: "#3b82f6" },
  { valor: "atendida", etiqueta: "Atendida", color: "#16a34a" },
  { valor: "cancelada", etiqueta: "Cancelada", color: "#9ca3af" },
  { valor: "no_asistio", etiqueta: "No asistió", color: "#dc2626" },
];

export type MedioPago = "efectivo" | "transferencia" | "datafono";

export const MEDIOS_PAGO: { valor: MedioPago; etiqueta: string }[] = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "transferencia", etiqueta: "Transferencia" },
  { valor: "datafono", etiqueta: "Datáfono" },
];

export interface Cita {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  servicio_id: string | null;
  servicio_nombre: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM(:SS)
  duracion_min: number;
  estado: EstadoCita;
  notas: string;
  created_at: string;
}

export interface Venta {
  id: string;
  fecha: string;
  cliente_nombre: string;
  descripcion: string;
  cantidad: number;
  total: number;
  medio_pago: MedioPago;
  cita_id: string | null;
  notas: string;
}

export type EstadoRetoque = "pendiente" | "recordada" | "agendada" | "cancelada";

export const ESTADOS_RETOQUE: {
  valor: EstadoRetoque;
  etiqueta: string;
  color: string;
}[] = [
  { valor: "pendiente", etiqueta: "Pendiente", color: "#c4a05a" },
  { valor: "recordada", etiqueta: "Recordada", color: "#3b82f6" },
  { valor: "agendada", etiqueta: "Agendada", color: "#16a34a" },
  { valor: "cancelada", etiqueta: "Cancelada", color: "#9ca3af" },
];

export interface Retoque {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  servicio_id: string | null;
  servicio_nombre: string;
  fecha_retoque: string; // YYYY-MM-DD
  estado: EstadoRetoque;
  cita_origen_id: string | null;
  notas: string;
  created_at: string;
}

export interface FacturaPagar {
  id: string;
  proveedor: string;
  numero: string;
  descripcion: string;
  fecha_compra: string | null;
  fecha_vencimiento: string;
  valor_total: number;
  estado: "pendiente" | "pagada";
  notas: string;
  created_at: string;
}

export interface Abono {
  id: string;
  factura_id: string;
  fecha: string;
  valor: number;
  notas: string;
  created_at: string;
}

export interface Compra {
  id: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  categoria: string;
  valor: number;
  notas: string;
  created_at: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  fecha_nacimiento: string | null; // YYYY-MM-DD
  notas: string;
  created_at: string;
}

export interface Horario {
  dia_semana: number; // 0=Dom ... 6=Sab
  abierto: boolean;
  hora_inicio: string;
  hora_fin: string;
}

export interface Configuracion {
  id: number;
  intervalo_slots: number;
  anticipacion_horas: number;
}

export const NOMBRES_DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
