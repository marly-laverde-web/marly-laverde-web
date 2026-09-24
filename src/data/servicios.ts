/**
 * =============================================================
 *  CATÁLOGO DE SERVICIOS
 * =============================================================
 *  IMPORTANTE: Los precios y descripciones son EJEMPLOS.
 *  Reemplázalos por los valores reales del estudio.
 *
 *  Para cada servicio puedes editar:
 *   - nombre        : el nombre que verá la clienta
 *   - categoria     : debe coincidir con una de las categorías de abajo
 *   - descripcion   : texto corto explicando el servicio
 *   - precio        : número en pesos (ej: 80000). Usa null para "Consultar"
 *   - duracionMin   : duración aproximada en minutos
 *   - destacado     : true para mostrarlo en la página de inicio
 *   - activo        : false para ocultarlo temporalmente sin borrarlo
 *   - imagen        : (opcional) ruta o URL de una foto; si se deja "" se
 *                     muestra un diseño elegante por defecto
 *   - intervaloRetoqueDias : (para la Fase 2) cada cuántos días sugerir retoque
 * =============================================================
 */

export type CategoriaServicio =
  | "Colorimetría"
  | "Tratamientos capilares"
  | "Manicure"
  | "Pedicure"
  | "Maquillaje"
  | "Cejas y pestañas"
  | "Peinados";

export interface Servicio {
  id: string;
  nombre: string;
  categoria: CategoriaServicio;
  descripcion: string;
  precio: number | null;
  duracionMin: number;
  destacado?: boolean;
  activo?: boolean;
  imagen?: string;
  intervaloRetoqueDias?: number;
}

/** Orden y descripción de las categorías tal como aparecerán en la web. */
export const categoriasServicios: {
  nombre: CategoriaServicio;
  descripcion: string;
}[] = [
  {
    nombre: "Colorimetría",
    descripcion:
      "Nuestra especialidad. Color a tu medida: balayage, mechas, tintes, corrección de color y más.",
  },
  {
    nombre: "Tratamientos capilares",
    descripcion:
      "Salud y brillo para tu cabello: hidratación profunda, botox capilar, keratina y nutrición.",
  },
  {
    nombre: "Cejas y pestañas",
    descripcion: "Diseño y realce de la mirada con técnicas profesionales.",
  },
  {
    nombre: "Maquillaje",
    descripcion: "Maquillaje profesional para toda ocasión.",
  },
  {
    nombre: "Peinados",
    descripcion: "Peinados y recogidos para eventos especiales.",
  },
  {
    nombre: "Manicure",
    descripcion: "Manos cuidadas y uñas impecables.",
  },
  {
    nombre: "Pedicure",
    descripcion: "Cuidado completo para tus pies.",
  },
];

export const servicios: Servicio[] = [
  // --- COLORIMETRÍA (especialidad) ---
  {
    id: "col-balayage",
    nombre: "Balayage",
    categoria: "Colorimetría",
    descripcion:
      "Técnica de iluminación a mano alzada para un degradado natural y luminoso.",
    precio: 250000,
    duracionMin: 180,
    destacado: true,
    intervaloRetoqueDias: 90,
  },
  {
    id: "col-mechas",
    nombre: "Mechas / Iluminación",
    categoria: "Colorimetría",
    descripcion: "Mechas finas o gruesas para dar luz y dimensión a tu color.",
    precio: 220000,
    duracionMin: 180,
    destacado: true,
    intervaloRetoqueDias: 75,
  },
  {
    id: "col-tinte",
    nombre: "Tinte / Color completo",
    categoria: "Colorimetría",
    descripcion: "Aplicación de color uniforme de raíz a puntas.",
    precio: 120000,
    duracionMin: 120,
    intervaloRetoqueDias: 30,
  },
  {
    id: "col-correccion",
    nombre: "Corrección de color",
    categoria: "Colorimetría",
    descripcion:
      "Recuperamos y transformamos tu color. Valor según diagnóstico personalizado.",
    precio: null,
    duracionMin: 240,
    destacado: true,
  },
  {
    id: "col-retoque-raiz",
    nombre: "Retoque de raíz",
    categoria: "Colorimetría",
    descripcion: "Mantenimiento del color en la raíz para lucir siempre impecable.",
    precio: 90000,
    duracionMin: 90,
    intervaloRetoqueDias: 30,
  },

  // --- TRATAMIENTOS CAPILARES ---
  {
    id: "trat-hidratacion",
    nombre: "Hidratación profunda",
    categoria: "Tratamientos capilares",
    descripcion: "Devuelve la humedad y suavidad a tu cabello.",
    precio: 70000,
    duracionMin: 60,
    destacado: true,
    intervaloRetoqueDias: 21,
  },
  {
    id: "trat-botox",
    nombre: "Botox capilar",
    categoria: "Tratamientos capilares",
    descripcion: "Reconstrucción y reducción de frizz para un cabello sedoso.",
    precio: 130000,
    duracionMin: 120,
    intervaloRetoqueDias: 60,
  },
  {
    id: "trat-keratina",
    nombre: "Keratina / Alisado",
    categoria: "Tratamientos capilares",
    descripcion: "Alisado y control de volumen con acabado brillante.",
    precio: 180000,
    duracionMin: 150,
    intervaloRetoqueDias: 90,
  },

  // --- CEJAS Y PESTAÑAS ---
  {
    id: "cejas-diseno",
    nombre: "Diseño de cejas",
    categoria: "Cejas y pestañas",
    descripcion: "Diseño y depilación según la forma de tu rostro.",
    precio: 30000,
    duracionMin: 30,
    destacado: true,
    intervaloRetoqueDias: 21,
  },
  {
    id: "cejas-laminado",
    nombre: "Laminado de cejas",
    categoria: "Cejas y pestañas",
    descripcion: "Cejas peinadas y fijadas para una mirada definida.",
    precio: 60000,
    duracionMin: 45,
    intervaloRetoqueDias: 45,
  },
  {
    id: "pestanas-lifting",
    nombre: "Lifting de pestañas",
    categoria: "Cejas y pestañas",
    descripcion: "Curvatura natural que realza tu mirada sin extensiones.",
    precio: 70000,
    duracionMin: 60,
    intervaloRetoqueDias: 45,
  },

  // --- MAQUILLAJE ---
  {
    id: "maq-social",
    nombre: "Maquillaje social",
    categoria: "Maquillaje",
    descripcion: "Maquillaje profesional para eventos y ocasiones especiales.",
    precio: 90000,
    duracionMin: 60,
    destacado: true,
  },

  // --- PEINADOS ---
  {
    id: "pein-evento",
    nombre: "Peinado para evento",
    categoria: "Peinados",
    descripcion: "Recogidos y peinados para bodas, grados y celebraciones.",
    precio: 80000,
    duracionMin: 60,
  },

  // --- MANICURE ---
  {
    id: "mani-tradicional",
    nombre: "Manicure tradicional",
    categoria: "Manicure",
    descripcion: "Limpieza, cutícula y esmaltado clásico.",
    precio: 30000,
    duracionMin: 45,
    intervaloRetoqueDias: 15,
  },
  {
    id: "mani-semipermanente",
    nombre: "Manicure semipermanente",
    categoria: "Manicure",
    descripcion: "Esmaltado de larga duración con acabado brillante.",
    precio: 45000,
    duracionMin: 60,
    destacado: true,
    intervaloRetoqueDias: 21,
  },

  // --- PEDICURE ---
  {
    id: "pedi-tradicional",
    nombre: "Pedicure tradicional",
    categoria: "Pedicure",
    descripcion: "Cuidado completo de pies y esmaltado clásico.",
    precio: 40000,
    duracionMin: 60,
    intervaloRetoqueDias: 21,
  },
  {
    id: "pedi-spa",
    nombre: "Pedicure spa",
    categoria: "Pedicure",
    descripcion: "Exfoliación, hidratación y masaje relajante.",
    precio: 60000,
    duracionMin: 75,
    intervaloRetoqueDias: 30,
  },
];

/** Devuelve solo los servicios activos (activo !== false). */
export function serviciosActivos(): Servicio[] {
  return servicios.filter((s) => s.activo !== false);
}
