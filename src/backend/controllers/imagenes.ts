import "server-only";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as imagenes from "@/backend/services/imagenes";

// Redirige a una dirección firmada y temporal si la imagen es del usuario de la sesión;
// si no (sin sesión, ajena o inexistente), 404 sin dar más detalles.
export async function servirImagen(ruta: string | null): Promise<Response> {
  const url = await imagenes.urlImagen(await crearClienteServidor(), ruta);
  if (!url) return new Response("No encontrada", { status: 404 });
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "private, max-age=3000" },
  });
}
