import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Cliente con privilegios de servicio (service_role). SOLO se usa en el
 * servidor (route handlers y server actions) para tareas como calcular la
 * disponibilidad de la agenda y registrar citas de las clientas de forma
 * segura. NUNCA debe importarse en un componente del navegador.
 */
export function crearClienteServicio() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True si la clave de servicio está configurada. */
export function servicioConfigurado(): boolean {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
