// Imágenes y vídeos de las notas (cambio editor-fase3-imagenes-videos, design D1 y D6).
// Funciones puras: las usan el filtro del servidor, el servicio de imágenes y el editor.

export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;
export const LONGITUD_TEXTO_IMAGEN = 500; // texto alternativo y pie

export const ERROR_IMAGEN_GRANDE = "La imagen no puede superar 5 MB.";
export const ERROR_IMAGEN_TIPO = "Solo se admiten imágenes PNG, JPEG, GIF o WebP.";
export const ERROR_VIDEO = "Solo se admiten vídeos de YouTube o Vimeo.";

export const TIPOS_IMAGEN = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
} as const;
export type ExtensionImagen = keyof typeof TIPOS_IMAGEN;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const RUTA = new RegExp(`^${UUID}/${UUID}/${UUID}\\.(png|jpg|gif|webp)$`);

// Ruta de una imagen subida: <usuario>/<nota>/<archivo>.<ext>, sin nada más.
export function esRutaImagen(valor: unknown): valor is string {
  return typeof valor === "string" && RUTA.test(valor);
}

// Tipo real de una imagen a partir de sus primeros bytes; el tipo que declara el navegador no basta.
export function extensionPorFirma(bytes: Uint8Array): ExtensionImagen | null {
  const empieza = (...firma: number[]) => firma.every((b, i) => bytes[i] === b);
  if (empieza(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (empieza(0xff, 0xd8, 0xff)) return "jpg";
  if (empieza(0x47, 0x49, 0x46, 0x38) && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) return "gif";
  const riff = empieza(0x52, 0x49, 0x46, 0x46);
  const webp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (riff && webp) return "webp";
  return null;
}

// Dirección con la que la app sirve una imagen privada (design D4).
export function direccionImagen(ruta: string): string {
  return `/imagen?ruta=${encodeURIComponent(ruta)}`;
}

export type ProveedorVideo = "youtube" | "vimeo";
export type Video = { proveedor: ProveedorVideo; id: string };

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;
const ID_VIMEO = /^\d{1,12}$/;

export function esVideo(proveedor: unknown, id: unknown): boolean {
  if (typeof id !== "string") return false;
  if (proveedor === "youtube") return ID_YOUTUBE.test(id);
  if (proveedor === "vimeo") return ID_VIMEO.test(id);
  return false;
}

// Reconoce un enlace de YouTube o Vimeo y devuelve solo proveedor e identificador.
export function reconocerVideo(enlace: string): Video | null {
  let url: URL;
  try {
    url = new URL(enlace.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const partes = url.pathname.split("/").filter(Boolean);

  let video: Video | null = null;
  if (host === "youtu.be") {
    video = { proveedor: "youtube", id: partes[0] ?? "" };
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (partes[0] === "watch") video = { proveedor: "youtube", id: url.searchParams.get("v") ?? "" };
    else if (["shorts", "embed", "live"].includes(partes[0])) video = { proveedor: "youtube", id: partes[1] ?? "" };
  } else if (host === "vimeo.com") {
    video = { proveedor: "vimeo", id: partes.find((p) => ID_VIMEO.test(p)) ?? "" };
  } else if (host === "player.vimeo.com" && partes[0] === "video") {
    video = { proveedor: "vimeo", id: partes[1] ?? "" };
  }
  return video && esVideo(video.proveedor, video.id) ? video : null;
}

export function reproductorVideo({ proveedor, id }: Video): string {
  return proveedor === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${id}`
    : `https://player.vimeo.com/video/${id}`;
}

export function enlaceVideo({ proveedor, id }: Video): string {
  return proveedor === "youtube" ? `https://www.youtube.com/watch?v=${id}` : `https://vimeo.com/${id}`;
}

export const NOMBRE_PROVEEDOR: Record<ProveedorVideo, string> = { youtube: "YouTube", vimeo: "Vimeo" };

type Nodo = { type?: string; attrs?: Record<string, unknown>; content?: Nodo[] };

// Rutas de las imágenes subidas que aparecen en un documento (para la limpieza, design D8).
export function rutasImagenes(documento: Nodo): string[] {
  const rutas = new Set<string>();
  const recorrer = (nodo: Nodo) => {
    if (nodo.type === "imagen" && nodo.attrs?.origen === "archivo" && esRutaImagen(nodo.attrs.ruta)) {
      rutas.add(nodo.attrs.ruta);
    }
    nodo.content?.forEach(recorrer);
  };
  recorrer(documento);
  return [...rutas];
}
