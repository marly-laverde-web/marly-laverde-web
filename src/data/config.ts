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
 */
export function waLink(mensaje?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Construye un enlace de WhatsApp hacia el número de una clienta.
 * Normaliza números colombianos (agrega 57 si hace falta).
 */
export function waLinkTelefono(telefono: string, mensaje?: string): string {
  let numero = (telefono || "").replace(/\D/g, "");
  if (numero.length === 10 && numero.startsWith("3")) numero = "57" + numero;
  const base = `https://wa.me/${numero}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}

/** Mensaje genérico para el botón flotante y CTAs principales. */
export const mensajeWhatsAppGeneral =
  "¡Hola Marly Laverde Estudio de Belleza! 👋 Me gustaría recibir información sobre sus servicios.";
