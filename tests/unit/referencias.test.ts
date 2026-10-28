import { describe, expect, it } from "vitest";
import { normalizarContenido, textoPlano, type NodoContenido } from "@/backend/services/contenidoNota";
import { esIdentificador, idsReferenciados } from "@/backend/services/referencias";

// Tarea 2.1 (editor-fase2-referencias): nodo de referencia en el filtro del servidor (design D1).
const ID = "3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const OTRO = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const ref = (attrs: Record<string, unknown>): NodoContenido => ({ type: "referencia", attrs });
const doc = (...content: NodoContenido[]) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Ver " }, ...content] }],
});

describe("referencias en el contenido (spec editor-notas)", () => {
  it("conserva una referencia a una nota con solo tipo e identificador", () => {
    expect(normalizarContenido(doc(ref({ tipo: "nota", id: ID })))).toEqual(doc(ref({ tipo: "nota", id: ID })));
  });

  it("no guarda el título ni otros atributos", () => {
    const limpio = normalizarContenido(doc(ref({ tipo: "nota", id: ID, titulo: "Copia", onclick: "x" })));
    expect(limpio).toEqual(doc(ref({ tipo: "nota", id: ID })));
  });

  it("guarda el identificador en minúsculas", () => {
    expect(normalizarContenido(doc(ref({ tipo: "nota", id: ID.toUpperCase() })))).toEqual(doc(ref({ tipo: "nota", id: ID })));
  });

  it("descarta referencias no válidas (escenario «Referencia no válida descartada»)", () => {
    for (const attrs of [{ tipo: "nota", id: "no-es-uuid" }, { tipo: "libro", id: ID }, { id: ID }, {}]) {
      expect(normalizarContenido(doc(ref(attrs)))).toEqual(doc());
    }
    expect(normalizarContenido(doc({ type: "referencia" }))).toEqual(doc());
  });

  it("el título referido no entra en el texto plano", () => {
    expect(textoPlano(normalizarContenido(doc(ref({ tipo: "nota", id: ID })))!)).toBe("Ver");
  });
});

describe("idsReferenciados", () => {
  it("devuelve cada nota una sola vez, también en bloques anidados", () => {
    const d = {
      type: "doc",
      content: [
        { type: "paragraph", content: [ref({ tipo: "nota", id: ID }), ref({ tipo: "nota", id: ID })] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [ref({ tipo: "nota", id: OTRO })] }] }] },
        { type: "paragraph", content: [ref({ tipo: "libro", id: OTRO.replace("a", "b") })] },
      ],
    };
    expect(idsReferenciados(d)).toEqual([ID, OTRO]);
  });

  it("reconoce identificadores", () => {
    expect(esIdentificador(ID)).toBe(true);
    expect(esIdentificador("1; drop table notas")).toBe(false);
    expect(esIdentificador(3)).toBe(false);
  });
});
