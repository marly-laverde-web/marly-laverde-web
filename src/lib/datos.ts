import { crearClienteServidor } from "./supabase/server";
import { supabaseConfigurado } from "./supabase/env";
import {
  serviciosActivos as serviciosSemilla,
  type Servicio,
  type CategoriaServicio,
} from "@/data/servicios";
import {
  productosActivos as productosSemilla,
  type Producto,
} from "@/data/productos";
import { galeria as galeriaSemilla, type FotoGaleria } from "@/data/galeria";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapServicio(row: any): Servicio {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria as CategoriaServicio,
    descripcion: row.descripcion ?? "",
    precio: row.precio,
    duracionMin: row.duracion_min,
    intervaloRetoqueDias: row.intervalo_retoque_dias ?? undefined,
    destacado: row.destacado,
    activo: row.activo,
    imagen: row.imagen_url ?? undefined,
  };
}

function mapProducto(row: any): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria ?? "General",
    descripcion: row.descripcion ?? "",
    precio: row.precio,
    referencia: row.referencia ?? undefined,
    disponible: row.disponible,
    activo: row.activo,
    destacado: row.destacado,
    imagen: row.imagen_url ?? undefined,
  };
}

function mapFoto(row: any): FotoGaleria {
  return {
    id: row.id,
    titulo: row.titulo ?? "",
    categoria: row.categoria ?? "General",
    imagen: row.imagen_url ?? undefined,
  };
}

/** Catálogo de servicios activos (DB o datos de ejemplo). */
export async function obtenerServicios(): Promise<Servicio[]> {
  if (!supabaseConfigurado()) return serviciosSemilla();
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });
  if (error || !data) return serviciosSemilla();
  return data.map(mapServicio);
}

/** Catálogo de productos activos. */
export async function obtenerProductos(): Promise<Producto[]> {
  if (!supabaseConfigurado()) return productosSemilla();
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });
  if (error || !data) return productosSemilla();
  return data.map(mapProducto);
}

/** Fotos de la galería. */
export async function obtenerGaleria(): Promise<FotoGaleria[]> {
  if (!supabaseConfigurado()) return galeriaSemilla;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("galeria")
    .select("*")
    .order("orden", { ascending: true });
  if (error || !data || data.length === 0) return galeriaSemilla;
  return data.map(mapFoto);
}
