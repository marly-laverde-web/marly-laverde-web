/** Formatea un precio en pesos colombianos. null => "Precio según valoración". */
export function formatCOP(valor: number | null): string {
  if (valor === null || valor === undefined) return "Precio según valoración";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

/** Convierte minutos a un texto legible: 90 => "1 h 30 min". */
export function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`;
  const horas = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
