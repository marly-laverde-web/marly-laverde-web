/** Lee las variables de entorno de Supabase y verifica si están configuradas. */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Devuelve true si Supabase está configurado. Mientras sea false, el sitio
 * público funciona con datos de ejemplo y el panel muestra instrucciones.
 */
export function supabaseConfigurado(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
