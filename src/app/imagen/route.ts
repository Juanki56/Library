import { servirImagen } from "@/backend/controllers/imagenes";

// Imágenes privadas de las notas (editor-fase3-imagenes-videos, design D4).
// La ruta va en la consulta: así la petición pasa por el middleware de sesión.
export const dynamic = "force-dynamic";

export function GET(peticion: Request) {
  return servirImagen(new URL(peticion.url).searchParams.get("ruta"));
}
