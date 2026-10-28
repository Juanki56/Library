// Contenido de las notas: JSON del editor (design D6) limitado al alcance aprobado en la
// spec editor-notas. El servidor no confía en lo que envía el navegador:
// descarta nodos, marcas y enlaces fuera de ese alcance antes de guardar.
import { esEnlaceWeb } from "./enlaces";
import { esRutaImagen, esVideo, LONGITUD_TEXTO_IMAGEN } from "./medios";
import { esIdentificador, esTipoReferencia } from "./referencias";

export { esEnlaceWeb };

export type NodoContenido = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: NodoContenido[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

// Un documento siempre tiene al menos un bloque: sin él, el editor no puede aplicar
// formatos de bloque (subtítulos, listas, citas) antes de que se escriba algo.
export const DOCUMENTO_VACIO: NodoContenido = { type: "doc", content: [{ type: "paragraph" }] };
export const TAMANO_MAXIMO = 500_000; // caracteres de JSON por nota

const NODOS = new Set([
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "hardBreak",
  "horizontalRule",
  "taskList",
  "taskItem",
  "referencia",
  "imagen",
  "video",
]);
const MARCAS = new Set(["bold", "italic", "underline", "highlight", "link"]);
const NIVELES_TITULO = new Set([2, 3]); // el título de la nota ocupa el nivel 1
const BLOQUES = new Set(["paragraph", "heading", "listItem", "taskItem", "blockquote"]);

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function limpiarMarcas(marcas: unknown): NodoContenido["marks"] {
  if (!Array.isArray(marcas)) return undefined;
  const limpias = marcas.flatMap((m) => {
    if (!esObjeto(m) || typeof m.type !== "string" || !MARCAS.has(m.type)) return [];
    if (m.type === "link") {
      const href = esObjeto(m.attrs) ? m.attrs.href : undefined;
      return esEnlaceWeb(href) ? [{ type: "link", attrs: { href } }] : [];
    }
    return [{ type: m.type }];
  });
  return limpias.length ? limpias : undefined;
}

const textoImagen = (valor: unknown) =>
  typeof valor === "string" ? valor.trim().slice(0, LONGITUD_TEXTO_IMAGEN) : "";

// Imagen subida (ruta en el almacenamiento privado) o desde una dirección web (design D1).
function limpiarImagen(attrs: Record<string, unknown>): NodoContenido | null {
  const datos = { alt: textoImagen(attrs.alt), pie: textoImagen(attrs.pie) };
  if (attrs.origen === "archivo" && esRutaImagen(attrs.ruta)) {
    return { type: "imagen", attrs: { origen: "archivo", ruta: attrs.ruta, ...datos } };
  }
  if (attrs.origen === "web" && esEnlaceWeb(attrs.src)) {
    return { type: "imagen", attrs: { origen: "web", src: attrs.src, ...datos } };
  }
  return null;
}

function limpiarNodo(valor: unknown): NodoContenido | null {
  if (!esObjeto(valor) || typeof valor.type !== "string" || !NODOS.has(valor.type)) return null;
  const tipo = valor.type;

  if (tipo === "text") {
    if (typeof valor.text !== "string" || valor.text === "") return null;
    const marcas = limpiarMarcas(valor.marks);
    return marcas ? { type: "text", text: valor.text, marks: marcas } : { type: "text", text: valor.text };
  }

  // Referencia a otro elemento: solo tipo admitido e identificador, nunca el título (design D1).
  if (tipo === "referencia") {
    const attrs = esObjeto(valor.attrs) ? valor.attrs : {};
    if (!esTipoReferencia(attrs.tipo) || !esIdentificador(attrs.id)) return null;
    return { type: "referencia", attrs: { tipo: attrs.tipo, id: attrs.id.toLowerCase() } };
  }

  if (tipo === "imagen") return limpiarImagen(esObjeto(valor.attrs) ? valor.attrs : {});
  if (tipo === "video") {
    const attrs = esObjeto(valor.attrs) ? valor.attrs : {};
    return esVideo(attrs.proveedor, attrs.id) ? { type: "video", attrs: { proveedor: attrs.proveedor, id: attrs.id } } : null;
  }

  const nodo: NodoContenido = { type: tipo };
  if (tipo === "heading") {
    const nivel = esObjeto(valor.attrs) ? valor.attrs.level : undefined;
    nodo.attrs = { level: NIVELES_TITULO.has(nivel as number) ? nivel : 2 };
  }
  if (tipo === "orderedList" && esObjeto(valor.attrs) && typeof valor.attrs.start === "number") {
    nodo.attrs = { start: valor.attrs.start };
  }
  if (tipo === "taskItem") {
    nodo.attrs = { checked: esObjeto(valor.attrs) && valor.attrs.checked === true };
  }
  if (Array.isArray(valor.content)) {
    const hijos = valor.content.map(limpiarNodo).filter((n): n is NodoContenido => n !== null);
    if (hijos.length) nodo.content = hijos;
  }
  return nodo;
}

// Devuelve un documento válido con solo lo permitido, o null si la entrada no es un documento.
export function normalizarContenido(valor: unknown): NodoContenido | null {
  if (!esObjeto(valor) || valor.type !== "doc") return null;
  const contenido = Array.isArray(valor.content)
    ? valor.content.map(limpiarNodo).filter((n): n is NodoContenido => n !== null && n.type !== "text")
    : [];
  return contenido.length ? { type: "doc", content: contenido } : DOCUMENTO_VACIO;
}

// Texto plano para búsquedas futuras: un bloque por línea.
export function textoPlano(documento: NodoContenido): string {
  const lineas: string[] = [];
  const recorrer = (nodo: NodoContenido, actual: string[]): void => {
    if (nodo.type === "text") actual.push(nodo.text ?? "");
    else if (nodo.type === "imagen" && typeof nodo.attrs?.pie === "string") lineas.push(nodo.attrs.pie);
    else if (nodo.type === "hardBreak") actual.push("\n");
    if (BLOQUES.has(nodo.type) && !nodo.content?.some((h) => BLOQUES.has(h.type))) {
      const linea: string[] = [];
      nodo.content?.forEach((h) => recorrer(h, linea));
      lineas.push(linea.join(""));
      return;
    }
    nodo.content?.forEach((h) => recorrer(h, actual));
  };
  recorrer(documento, []);
  return lineas.map((l) => l.trim()).filter(Boolean).join("\n");
}
