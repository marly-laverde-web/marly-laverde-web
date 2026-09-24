import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/**
 * Cliente de Supabase para el servidor (Server Components y Server Actions).
 * Maneja la sesión de la administradora a través de cookies.
 */
export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un Server Component: se puede ignorar si hay
          // middleware refrescando la sesión.
        }
      },
    },
  });
}
