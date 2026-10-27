import { describe, expect, it } from "vitest";
import { normalizarContenido, textoPlano, type NodoContenido } from "@/backend/services/contenidoNota";

const texto = (t: string, marks?: NodoContenido["marks"]): NodoContenido =>
  marks ? { type: "text", text: t, marks } : { type: "text", text: t };
const parrafo = (...content: NodoContenido[]): NodoContenido => ({ type: "paragraph", content });

describe("normalizarContenido (spec editor-notas: alcance inicial)", () => {
  it("rechaza lo que no es un documento", () => {
    expect(normalizarContenido(null)).toBeNull();
    expect(normalizarContenido("hola")).toBeNull();
    expect(normalizarContenido({ type: "paragraph" })).toBeNull();
  });

  it("conserva subtítulo, listas y cita en bloque (escenario «Formato básico conservado»)", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [texto("Ideas clave")] },
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [parrafo(texto("Lucha de clases"))] }],
        },
        { type: "orderedList", attrs: { start: 1 }, content: [{ type: "listItem", content: [parrafo(texto("Uno"))] }] },
        { type: "blockquote", content: [parrafo(texto("La historia de toda sociedad…"))] },
      ],
    };
    expect(normalizarContenido(doc)).toEqual(doc);
  });

  it("conserva negrita, cursiva y enlaces web", () => {
    const doc = {
      type: "doc",
      content: [
        parrafo(
          texto("negrita", [{ type: "bold" }]),
          texto("cursiva", [{ type: "italic" }]),
          texto("enlace", [{ type: "link", attrs: { href: "https://ejemplo.com" } }]),
        ),
      ],
    };
    expect(normalizarContenido(doc)).toEqual(doc);
  });

  it("quita enlaces que no son http/https (escenario «Enlace no web rechazado»)", () => {
    const resultado = normalizarContenido({
      type: "doc",
      content: [parrafo(texto("peligro", [{ type: "link", attrs: { href: "javascript:alert(1)" } }]))],
    });
    expect(resultado).toEqual({ type: "doc", content: [parrafo(texto("peligro"))] });
  });

  it("descarta funciones exploratorias que no están en el alcance", () => {
    const resultado = normalizarContenido({
      type: "doc",
      content: [
        { type: "horizontalRule" },
        { type: "image", attrs: { src: "https://x/y.png" } },
        parrafo(texto("subrayado", [{ type: "underline" }, { type: "italic" }])),
      ],
    });
    expect(resultado).toEqual({
      type: "doc",
      content: [parrafo(texto("subrayado", [{ type: "italic" }]))],
    });
  });

  it("limita los títulos a los niveles 2 y 3, porque el 1 es el título de la nota", () => {
    const resultado = normalizarContenido({
      type: "doc",
      content: [{ type: "heading", attrs: { level: 1 }, content: [texto("Grande")] }],
    });
    expect(resultado?.content?.[0].attrs).toEqual({ level: 2 });
  });

  it("descarta atributos desconocidos", () => {
    const resultado = normalizarContenido({
      type: "doc",
      content: [{ type: "paragraph", attrs: { onclick: "x" }, content: [texto("hola")] }],
    });
    expect(resultado).toEqual({ type: "doc", content: [parrafo(texto("hola"))] });
  });
});

describe("textoPlano", () => {
  it("pone un bloque por línea", () => {
    const doc = normalizarContenido({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [texto("Título")] },
        parrafo(texto("Primera "), texto("frase", [{ type: "bold" }])),
        { type: "bulletList", content: [{ type: "listItem", content: [parrafo(texto("Elemento"))] }] },
      ],
    })!;
    expect(textoPlano(doc)).toBe("Título\nPrimera frase\nElemento");
  });

  it("devuelve cadena vacía para un documento vacío", () => {
    expect(textoPlano(normalizarContenido({ type: "doc", content: [] })!)).toBe("");
  });
});

describe("documento vacío", () => {
  it("siempre tiene un párrafo para poder aplicar formatos de bloque", () => {
    expect(normalizarContenido({ type: "doc", content: [] })).toEqual({
      type: "doc",
      content: [{ type: "paragraph" }],
    });
    expect(normalizarContenido({ type: "doc", content: [{ type: "image" }] })?.content).toEqual([
      { type: "paragraph" },
    ]);
  });
});
