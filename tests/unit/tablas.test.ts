import { describe, expect, it } from "vitest";
import { normalizarContenido, textoPlano, type NodoContenido } from "@/backend/services/contenidoNota";

// Tarea 1.1 (editor-fase4-organizacion-tablas): tablas en el filtro del servidor (design D3).
const parrafo = (texto?: string): NodoContenido =>
  texto ? { type: "paragraph", content: [{ type: "text", text: texto }] } : { type: "paragraph" };
const celda = (tipo: "tableHeader" | "tableCell", texto?: string, attrs: Record<string, unknown> = {}): NodoContenido => ({
  type: tipo,
  attrs: { colspan: 1, rowspan: 1, colwidth: null, ...attrs },
  content: [parrafo(texto)],
});
const fila = (...celdas: NodoContenido[]): NodoContenido => ({ type: "tableRow", content: celdas });
const tabla = (...filas: NodoContenido[]) => ({ type: "doc", content: [{ type: "table", content: filas }] });

describe("tablas (spec editor-notas: «Tablas»)", () => {
  it("conserva una tabla como la genera el editor", () => {
    const t = tabla(fila(celda("tableHeader", "Autor"), celda("tableHeader", "Obra")), fila(celda("tableCell", "Marx"), celda("tableCell")));
    expect(normalizarContenido(t)).toEqual(t);
  });

  it("descarta atributos y nodos no permitidos (escenario «Tabla manipulada»)", () => {
    const manipulada = {
      type: "doc",
      content: [
        {
          type: "table",
          attrs: { style: "x" },
          content: [
            {
              type: "tableRow",
              content: [
                { type: "tableCell", attrs: { colspan: 2, rowspan: 999, colwidth: [120, "x"], onclick: "y" }, content: [parrafo("a")] },
                { type: "paragraph", content: [{ type: "text", text: "fuera de celda" }] },
                { type: "codeBlock", content: [{ type: "text", text: "código" }] },
              ],
            },
            { type: "tableRow", content: [] },
          ],
        },
      ],
    };
    expect(normalizarContenido(manipulada)).toEqual(tabla(fila(celda("tableCell", "a", { colspan: 2 }))));
  });

  it("conserva anchos de columna válidos y da un párrafo a las celdas vacías", () => {
    const entrada = tabla(fila({ type: "tableCell", attrs: { colwidth: [150] } }));
    expect(normalizarContenido(entrada)).toEqual(tabla(fila({ type: "tableCell", attrs: { colspan: 1, rowspan: 1, colwidth: [150] }, content: [parrafo()] })));
  });

  it("una tabla sin filas desaparece y el resto se conserva", () => {
    expect(normalizarContenido({ type: "doc", content: [{ type: "table" }, parrafo("sigue")] })).toEqual({ type: "doc", content: [parrafo("sigue")] });
  });

  it("el texto de las celdas entra en el texto plano para la búsqueda", () => {
    const t = normalizarContenido(tabla(fila(celda("tableHeader", "Autor")), fila(celda("tableCell", "Marx"))))!;
    expect(textoPlano(t)).toBe("Autor\nMarx");
  });
});
