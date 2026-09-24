/**
 * =============================================================
 *  GALERÍA DE RESULTADOS
 * =============================================================
 *  Aquí van las fotos de los trabajos realizados.
 *
 *  Mientras no cargues fotos reales, se muestra un diseño elegante
 *  por defecto con el nombre de cada trabajo.
 *
 *  Para usar tus propias fotos:
 *   1. Copia las imágenes dentro de la carpeta:  public/galeria/
 *   2. En "imagen" escribe la ruta, por ejemplo: "/galeria/balayage-1.jpg"
 *
 *  IMPORTANTE: usa solo fotos con autorización de la clienta.
 * =============================================================
 */

export interface FotoGaleria {
  id: string;
  titulo: string;
  categoria: string;
  imagen?: string; // ruta como "/galeria/mi-foto.jpg" (opcional por ahora)
}

export const galeria: FotoGaleria[] = [
  { id: "g1", titulo: "Balayage luminoso", categoria: "Colorimetría" },
  { id: "g2", titulo: "Rubio perfecto", categoria: "Colorimetría" },
  { id: "g3", titulo: "Corrección de color", categoria: "Colorimetría" },
  { id: "g4", titulo: "Hidratación y brillo", categoria: "Tratamientos capilares" },
  { id: "g5", titulo: "Keratina con movimiento", categoria: "Tratamientos capilares" },
  { id: "g6", titulo: "Diseño de cejas", categoria: "Cejas y pestañas" },
  { id: "g7", titulo: "Lifting de pestañas", categoria: "Cejas y pestañas" },
  { id: "g8", titulo: "Maquillaje social", categoria: "Maquillaje" },
  { id: "g9", titulo: "Manicure semipermanente", categoria: "Manicure" },
];
