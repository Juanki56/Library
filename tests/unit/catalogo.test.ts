import { describe, expect, it } from "vitest";
import { RELACIONES, relacionEntre, relacionesDe, type Entidad } from "@/backend/services/catalogo";
import { textoAviso } from "@/backend/services/eliminacion";

const TIPOS: Entidad[] = ["proyecto", "nota", "libro", "recurso"];

describe("catálogo de relaciones", () => {
  it("cubre los 6 pares posibles entre las 4 entidades, sin repetir", () => {
    const pares = RELACIONES.map((r) => [r.a, r.b].sort().join("-"));
    expect(new Set(pares).size).toBe(6);
  });

  it("encuentra la relación en cualquier orden", () => {
    expect(relacionEntre("nota", "proyecto")?.tabla).toBe("nota_proyecto");
    expect(relacionEntre("proyecto", "nota")?.tabla).toBe("nota_proyecto");
    expect(relacionEntre("libro", "recurso")?.tabla).toBe("recurso_libro");
  });

  it.each(TIPOS)("no permite relacionar %s consigo mismo", (tipo) => {
    expect(relacionEntre(tipo, tipo)).toBeNull();
  });

  it.each(TIPOS)("%s participa en 3 relaciones", (tipo) => {
    expect(relacionesDe(tipo)).toHaveLength(3);
  });
});

describe("aviso antes de eliminar", () => {
  it("indica cuando no hay vínculos", () => {
    expect(textoAviso({ total: 0, porTipo: {} })).toBe(
      "Este elemento no tiene vínculos con otros elementos.",
    );
  });

  it("detalla los vínculos por tipo y aclara que no se borran", () => {
    expect(textoAviso({ total: 3, porTipo: { nota: 2, libro: 1 } })).toBe(
      "Se quitarán 3 vínculos con 2 notas y 1 libro. Esos elementos no se borrarán.",
    );
  });

  it("usa singular con un solo vínculo", () => {
    expect(textoAviso({ total: 1, porTipo: { proyecto: 1 } })).toBe(
      "Se quitará 1 vínculo con 1 proyecto. Ese elemento no se borrará.",
    );
  });
});

describe("aviso con citas enlazadas (libro o recurso)", () => {
  it("añade cuántas citas perderán su enlace", () => {
    expect(textoAviso({ total: 1, porTipo: { nota: 1 }, citas: 2 })).toBe(
      "Se quitará 1 vínculo con 1 nota. Ese elemento no se borrará. 2 citas perderán su enlace con él (no se borrarán).",
    );
  });

  it("usa singular con una cita y funciona sin vínculos", () => {
    expect(textoAviso({ total: 0, porTipo: {}, citas: 1 })).toBe(
      "Este elemento no tiene vínculos con otros elementos. 1 cita perderá su enlace con él (no se borrará).",
    );
  });

  it("no menciona citas cuando no hay", () => {
    expect(textoAviso({ total: 0, porTipo: {}, citas: 0 })).toBe("Este elemento no tiene vínculos con otros elementos.");
  });
});
