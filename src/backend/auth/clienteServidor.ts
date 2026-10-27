import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { entornoSupabase } from "./entorno";

// Cliente de Supabase con la sesión del usuario (cookies), para servidor.
// Usa la clave publicable: RLS limita cada consulta al usuario de la sesión (design D4).
export async function crearClienteServidor() {
  const { url, clavePublicable } = entornoSupabase();
  const almacen = await cookies();

  return createServerClient(url, clavePublicable, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(porGuardar) {
        try {
          porGuardar.forEach(({ name, value, options }) =>
            almacen.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component: el middleware renueva la sesión.
        }
      },
    },
  });
}
