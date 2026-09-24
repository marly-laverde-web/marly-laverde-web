/**
 * =============================================================
 *  CATÁLOGO DE PRODUCTOS
 * =============================================================
 *  IMPORTANTE: Los productos y precios son EJEMPLOS.
 *  Reemplázalos por los productos reales que vende el estudio.
 *
 *  Para cada producto puedes editar:
 *   - nombre        : nombre del producto
 *   - categoria     : agrupación del producto
 *   - descripcion   : texto corto
 *   - precio        : número en pesos (ej: 55000). Usa null para "Consultar"
 *   - referencia    : código interno (opcional)
 *   - disponible    : false para marcarlo como agotado
 *   - activo        : false para ocultarlo
 *   - imagen        : (opcional) ruta o URL de foto; "" muestra diseño por defecto
 * =============================================================
 */

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number | null;
  referencia?: string;
  disponible?: boolean;
  activo?: boolean;
  imagen?: string;
  destacado?: boolean;
}

export const productos: Producto[] = [
  {
    id: "prod-shampoo-matizador",
    nombre: "Shampoo matizador",
    categoria: "Cuidado del color",
    descripcion:
      "Neutraliza tonos amarillos y mantiene tu rubio o gris impecable.",
    precio: 55000,
    disponible: true,
    destacado: true,
  },
  {
    id: "prod-mascarilla",
    nombre: "Mascarilla de nutrición",
    categoria: "Tratamiento",
    descripcion: "Hidratación intensa para cabello seco o procesado.",
    precio: 60000,
    disponible: true,
    destacado: true,
  },
  {
    id: "prod-protector-termico",
    nombre: "Protector térmico",
    categoria: "Styling",
    descripcion: "Protege el cabello del calor de la plancha y el secador.",
    precio: 45000,
    disponible: true,
  },
  {
    id: "prod-serum",
    nombre: "Sérum de brillo",
    categoria: "Styling",
    descripcion: "Acabado sedoso y antifrizz sin apelmazar.",
    precio: 48000,
    disponible: true,
    destacado: true,
  },
  {
    id: "prod-aceite",
    nombre: "Aceite capilar reparador",
    categoria: "Tratamiento",
    descripcion: "Repara puntas abiertas y aporta suavidad.",
    precio: 52000,
    disponible: true,
  },
  {
    id: "prod-shampoo-fortalecedor",
    nombre: "Shampoo fortalecedor",
    categoria: "Cuidado diario",
    descripcion: "Limpieza suave que fortalece el cabello desde la raíz.",
    precio: 50000,
    disponible: true,
  },
];

/** Devuelve solo los productos activos. */
export function productosActivos(): Producto[] {
  return productos.filter((p) => p.activo !== false);
}
