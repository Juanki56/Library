import { describe, expect, it } from "vitest";
import { autoresDeCitas, filtrarCitas, hayFiltros, limpiarFiltros, SIN_AUTOR } from "@/backend/services/filtros";

// Tareas 2.1 y 3.1 (filtros-citas-busqueda): validación de filtros y filtros de Citas.
const ID = "3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

describe("limpiarFiltros (búsqueda)", () => {
  it("conserva solo valores válidos", () => {
    expect(
      limpiarFiltros({ autor: "  Marx ", etiqueta: ID, proyecto: "no-es-id", libro: ID.toUpperCase(), desde: "2026-10-01", hasta: "31/10/2026" }),
    ).toEqual({ autor: "Marx", etiqueta: ID, libro: ID, desde: "2026-10-01" });
  });

  it("ignora vacíos y recorta el autor", () => {
    expect(limpiarFiltros({ autor: "", etiqueta: "", desde: "" })).toEqual({});
    expect(limpiarFiltros({ autor: "a".repeat(300) }).autor).toHaveLength(100);
    expect(hayFiltros({})).toBe(false);
    expect(hayFiltros({ desde: "2026-10-01" })).toBe(true);
  });
});

describe("filtros de Citas (requisito «Filtros de la sección Citas»)", () => {
  const citas = [
    { id: "1", tipo: "cita", autor: "Karl Marx" },
    { id: "2", tipo: "frase", autor: "karl marx" },
    { id: "3", tipo: "cita", autor: "Horacio" },
    { id: "4", tipo: "proverbio", autor: null },
    { id: "5", tipo: "proverbio", autor: "  " },
  ];
  const ids = (l: { id: string }[]) => l.map((c) => c.id);

  it("filtra por tipo", () => {
    expect(ids(filtrarCitas(citas, { tipo: "proverbio" }))).toEqual(["4", "5"]);
  });

  it("filtra por autor sin mayúsculas ni tildes, y «Sin autor»", () => {
    expect(ids(filtrarCitas(citas, { autor: "KARL MARX" }))).toEqual(["1", "2"]);
    expect(ids(filtrarCitas(citas, { autor: SIN_AUTOR }))).toEqual(["4", "5"]);
  });

  it("combina tipo y autor", () => {
    expect(ids(filtrarCitas(citas, { tipo: "frase", autor: "Karl Marx" }))).toEqual(["2"]);
    expect(filtrarCitas(citas, { tipo: "proverbio", autor: "Horacio" })).toEqual([]);
  });

  it("lista los autores una vez, con la primera forma escrita y en orden", () => {
    expect(autoresDeCitas(citas)).toEqual(["Horacio", "Karl Marx"]);
  });
});
