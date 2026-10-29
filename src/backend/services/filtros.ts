// Filtros de la búsqueda global y de Citas (cambio filtros-citas-busqueda, design D2 y D3).
// Funciones puras: validan lo que llega en la dirección de la página; un valor no válido se ignora.
import { normalizar } from "./normalizar";
import { esFechaValida } from "./fichas";
import { esIdentificador } from "./referencias";

export type FiltrosBusqueda = {
  autor?: string;
  etiqueta?: string;
  desde?: string;
  hasta?: string;
  proyecto?: string;
  libro?: string;
};

export const CLAVES_FILTROS = ["autor", "etiqueta", "desde", "hasta", "proyecto", "libro"] as const;
const LONGITUD_AUTOR = 100;

export function limpiarFiltros(entrada: Record<string, unknown>): FiltrosBusqueda {
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const filtros: FiltrosBusqueda = {};
  const autor = texto(entrada.autor).slice(0, LONGITUD_AUTOR);
  if (autor) filtros.autor = autor;
  for (const clave of ["etiqueta", "proyecto", "libro"] as const) {
    const valor = texto(entrada[clave]);
    if (esIdentificador(valor)) filtros[clave] = valor.toLowerCase();
  }
  for (const clave of ["desde", "hasta"] as const) {
    const valor = texto(entrada[clave]);
    if (esFechaValida(valor)) filtros[clave] = valor;
  }
  return filtros;
}

export function hayFiltros(filtros: FiltrosBusqueda): boolean {
  return CLAVES_FILTROS.some((c) => filtros[c] !== undefined);
}

// Citas: «-» es «Sin autor»; cualquier otro texto se compara sin mayúsculas ni tildes.
export const SIN_AUTOR = "-";

type CitaConAutor = { autor: string | null; tipo: string };

export function filtrarCitas<T extends CitaConAutor>(citas: T[], { tipo, autor }: { tipo?: string; autor?: string }): T[] {
  const buscado = autor && autor !== SIN_AUTOR ? normalizar(autor) : null;
  return citas.filter((c) => {
    if (tipo && c.tipo !== tipo) return false;
    if (autor === SIN_AUTOR) return !c.autor?.trim();
    if (buscado) return c.autor !== null && normalizar(c.autor) === buscado;
    return true;
  });
}

// Autores distintos de las citas, agrupados sin mayúsculas ni tildes (se muestra la primera forma
// escrita), en orden alfabético.
export function autoresDeCitas(citas: CitaConAutor[]): string[] {
  const vistos = new Map<string, string>();
  for (const c of citas) {
    const autor = c.autor?.trim();
    if (autor && !vistos.has(normalizar(autor))) vistos.set(normalizar(autor), autor);
  }
  return [...vistos.values()].sort((a, b) => normalizar(a).localeCompare(normalizar(b), "es"));
}
