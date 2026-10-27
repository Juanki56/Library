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

  it("descarta lo que pertenece a fases futuras (imágenes) y conserva lo aprobado", () => {
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
      content: [{ type: "horizontalRule" }, parrafo(texto("subrayado", [{ type: "underline" }, { type: "italic" }]))],
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

describe("formatos de la fase 1 (spec editor-notas)", () => {
  it("conserva subrayado, resaltado, separador y lista de tareas con su casilla (escenario «Formatos nuevos conservados»)", () => {
    const doc = {
      type: "doc",
      content: [
        parrafo(texto("subrayado", [{ type: "underline" }]), texto("resaltado", [{ type: "highlight" }])),
        { type: "horizontalRule" },
        {
          type: "taskList",
          content: [
            { type: "taskItem", attrs: { checked: true }, content: [parrafo(texto("Leer el Manifiesto"))] },
            { type: "taskItem", attrs: { checked: false }, content: [parrafo(texto("Resumir el capítulo I"))] },
          ],
        },
      ],
    };
    expect(normalizarContenido(doc)).toEqual(doc);
  });

  it("descarta formatos fuera de alcance y atributos no permitidos (escenario «Formato no permitido descartado»)", () => {
    const resultado = normalizarContenido({
      type: "doc",
      content: [
        { type: "codeBlock", content: [texto("x = 1")] },
        { type: "image", attrs: { src: "https://x/y.png" } },
        parrafo(texto("rojo", [{ type: "highlight", attrs: { color: "#ff0000" } }])),
        { type: "taskList", content: [{ type: "taskItem", attrs: { checked: "sí", onclick: "x" }, content: [parrafo(texto("t"))] }] },
      ],
    });
    expect(resultado).toEqual({
      type: "doc",
      content: [
        parrafo(texto("rojo", [{ type: "highlight" }])),
        { type: "taskList", content: [{ type: "taskItem", attrs: { checked: false }, content: [parrafo(texto("t"))] }] },
      ],
    });
  });

  it("incluye el texto de las tareas en el texto plano", () => {
    const doc = normalizarContenido({
      type: "doc",
      content: [{ type: "taskList", content: [{ type: "taskItem", attrs: { checked: true }, content: [parrafo(texto("Leer"))] }] }],
    })!;
    expect(textoPlano(doc)).toBe("Leer");
  });
});

describe("compatibilidad con notas existentes (escenario «Nota antigua»)", () => {
  it("una nota del formato anterior sale idéntica del filtro", () => {
    const antigua = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [texto("Idea central")] },
        parrafo(texto("La historia es la historia de la "), texto("lucha de clases", [{ type: "bold" }]), texto(".")),
        { type: "bulletList", content: [{ type: "listItem", content: [parrafo(texto("Burguesía"))] }] },
        { type: "orderedList", attrs: { start: 1 }, content: [{ type: "listItem", content: [parrafo(texto("Uno"))] }] },
        { type: "blockquote", content: [parrafo(texto("Cita", [{ type: "italic" }]))] },
        parrafo(texto("enlace", [{ type: "link", attrs: { href: "https://ejemplo.com" } }])),
      ],
    };
    expect(normalizarContenido(antigua)).toEqual(antigua);
  });
});
