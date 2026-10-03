/**
 * =============================================================
 *  CONFIGURACIÓN GENERAL DEL ESTUDIO
 * =============================================================
 *  Este archivo contiene los datos del negocio.
 *  Puedes editar aquí el teléfono, redes sociales, horarios, etc.
 *  No necesitas saber programar: solo cambia el texto entre comillas.
 * =============================================================
 */

export const site = {
  nombre: "Marly Laverde",
  subtitulo: "Estudio de Belleza",
  eslogan: "Colorimetría y tratamientos capilares que realzan tu belleza natural",
  descripcion:
    "Estudio de belleza especializado en colorimetría y tratamientos capilares. También ofrecemos manicure, pedicure, maquillaje, diseño de cejas y pestañas, y peinados.",

  // --- Contacto ---
  // Número en formato internacional SIN espacios ni signos (para WhatsApp).
  // Colombia = 57. Ej: 573167664920
  whatsapp: "573167664920",
  // Cómo se muestra el número en pantalla:
  telefonoVisible: "+57 316 766 4920",

  // Correo electrónico (opcional; deja "" para ocultarlo)
  email: "marlylaverdeestudiodebelleza@gmail.com",

  // Dirección física (opcional; deja "" para ocultarla hasta que la definas)
  direccion: "Calle 8 No. 12 C 58, Barrio Estero",
  ciudad: "Villavicencio",

  // --- Horarios (edita a tu gusto; deja "" para ocultar una fila) ---
  horarios: [
    { dia: "Lunes a Viernes", horas: "9:00 a. m. – 6:00 p. m." },
    { dia: "Sábados", horas: "8:00 a. m. – 4:00 p. m." },
    { dia: "Domingos y festivos", horas: "Con cita previa" },
  ],

  // --- Redes sociales (deja "" para ocultar el ícono) ---
  redes: {
    instagram:
      "https://www.instagram.com/marly_laverde_estudiodebelleza",
    facebook: "https://www.facebook.com/share/1EYA1bHNP1/",
    tiktok: "https://www.tiktok.com/@marlylaverdeestudiodebel",
  },
} as const;

/**
 * Construye un enlace de WhatsApp con un mensaje ya escrito.
 * Uso: waLink("Hola, quiero información sobre colorimetría")
 *
 * Nota: usamos api.whatsapp.com/send en vez de wa.me porque el
 * redireccionamiento de wa.me daña los emojis de 4 bytes (los convierte en "�").
 */
export function waLink(mensaje?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${site.whatsapp}`;
  if (!mensaje) return base;
  return `${base}&text=${encodeURIComponent(mensaje)}`;
}

/**
 * Construye un enlace de WhatsApp hacia el número de una clienta.
 * Normaliza números colombianos (agrega 57 si hace falta).
 * Usa api.whatsapp.com/send (no wa.me) para no dañar los emojis.
 */
export function waLinkTelefono(telefono: string, mensaje?: string): string {
  let numero = (telefono || "").replace(/\D/g, "");
  if (numero.length === 10 && numero.startsWith("3")) numero = "57" + numero;
  const base = `https://api.whatsapp.com/send?phone=${numero}`;
  if (!mensaje) return base;
  return `${base}&text=${encodeURIComponent(mensaje)}`;
}

/** Devuelve solo el primer nombre (p. ej. "Ingrid Rincón" → "Ingrid"). */
export function primerNombre(nombre?: string | null): string {
  return (nombre || "").trim().split(/\s+/)[0] || "";
}

/**
 * Emojis escritos como secuencias de escape ASCII para evitar que se dañen
 * (aparezcan como "�") por problemas de codificación en el editor o el build.
 */
export const emoji = {
  flor: "\u{1F338}", // 🌸
  destellos: "\u{2728}", // ✨
  corazon: "\u{1F495}", // 💕
  corazonBrillante: "\u{1F496}", // 💖
  unas: "\u{1F485}", // 💅
  calendario: "\u{1F4C5}", // 📅
  reloj: "\u{23F0}", // ⏰
  abrazo: "\u{1F917}", // 🤗
  fiesta: "\u{1F389}", // 🎉
  pastel: "\u{1F382}", // 🎂
  corona: "\u{1F451}", // 👑
  festejo: "\u{1F973}", // 🥳
  dinero: "\u{1F4B0}", // 💰
};

/** Mensaje genérico para el botón flotante y CTAs principales. */
export const mensajeWhatsAppGeneral =
  "¡Hola Marly Laverde Estudio de Belleza! 👋 Me gustaría recibir información sobre sus servicios.";
