// Referencias a otros elementos dentro del contenido de una nota (cambio editor-fase2-referencias,
// design D1). Funciones puras: las usa el filtro del servidor y también el editor.

// Tipos de elemento que se pueden referenciar. Ampliable sin convertir las notas existentes.
export const TIPOS_REFERENCIA = ["nota"] as const;
export type TipoReferencia = (typeof TIPOS_REFERENCIA)[number];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function esIdentificador(valor: unknown): valor is string {
  return typeof valor === "string" && UUID.test(valor);
}

export function esTipoReferencia(valor: unknown): valor is TipoReferencia {
  return TIPOS_REFERENCIA.includes(valor as TipoReferencia);
}

type Nodo = { type?: string; attrs?: Record<string, unknown>; content?: Nodo[] };

// Identificadores distintos de las notas referenciadas en un documento, en orden de aparición.
export function idsReferenciados(documento: Nodo): string[] {
  const ids = new Set<string>();
  const recorrer = (nodo: Nodo) => {
    if (nodo.type === "referencia" && nodo.attrs?.tipo === "nota" && esIdentificador(nodo.attrs.id)) {
      ids.add(nodo.attrs.id.toLowerCase());
    }
    nodo.content?.forEach(recorrer);
  };
  recorrer(documento);
  return [...ids];
}
