// Datos de las fichas de libros y recursos (cambio libros-recursos-menu-inicio, design D2 y D4).
// Funciones y listas puras: las usan los servicios y los formularios.

export const ESTADOS_LECTURA = {
  por_leer: "Por leer",
  leyendo: "Leyendo",
  leido: "Leído",
} as const;
export type EstadoLectura = keyof typeof ESTADOS_LECTURA;

export function esEstadoLectura(valor: unknown): valor is EstadoLectura {
  return typeof valor === "string" && Object.hasOwn(ESTADOS_LECTURA, valor);
}

export const TIPOS_RECURSO = {
  articulo: "Artículo",
  pagina_web: "Página web",
  video: "Vídeo",
  podcast: "Podcast",
  documento: "Documento o PDF",
  curso: "Curso",
  audio: "Audio",
  otro: "Otro",
} as const;
export type TipoRecurso = keyof typeof TIPOS_RECURSO;

export function esTipoRecurso(valor: unknown): valor is TipoRecurso {
  return typeof valor === "string" && Object.hasOwn(TIPOS_RECURSO, valor);
}

// ISBN-10 o ISBN-13 con su dígito de control; admite guiones y espacios.
// Devuelve el ISBN sin separadores (con X final en mayúscula) o null si no es válido.
export function normalizarIsbn(texto: string): string | null {
  const isbn = texto.replace(/[\s-]/g, "").toUpperCase();
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const suma = [...isbn].reduce((total, c, i) => total + (c === "X" ? 10 : Number(c)) * (10 - i), 0);
    return suma % 11 === 0 ? isbn : null;
  }
  if (/^\d{13}$/.test(isbn)) {
    const suma = [...isbn].reduce((total, c, i) => total + Number(c) * (i % 2 === 0 ? 1 : 3), 0);
    return suma % 10 === 0 ? isbn : null;
  }
  return null;
}

// Fecha de publicación «AAAA-MM-DD» que existe en el calendario.
export function esFechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto);
}
