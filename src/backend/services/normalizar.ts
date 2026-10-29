// Misma regla que public.normalizar en la base de datos: sin mayúsculas, tildes ni espacios sobrantes.
// Función pura: la usan las etiquetas, los filtros y la interfaz.
export function normalizar(texto: string): string {
  return texto.trim().replace(/\s+/g, " ").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
