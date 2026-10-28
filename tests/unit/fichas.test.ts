import { describe, expect, it } from "vitest";
import { esFechaValida, esEstadoLectura, esTipoRecurso, normalizarIsbn } from "@/backend/services/fichas";

// Tarea 2.1 (libros-recursos-menu-inicio): ISBN, estados de lectura y tipos de recurso.
describe("ISBN (requisito «ISBN válido»)", () => {
  it("acepta ISBN-13 e ISBN-10 con o sin guiones y los normaliza", () => {
    expect(normalizarIsbn("978-84-323-0291-6")).toBe("9788432302916");
    expect(normalizarIsbn("9780306406157")).toBe("9780306406157");
    expect(normalizarIsbn("0-306-40615-2")).toBe("0306406152");
    expect(normalizarIsbn("0 8044 2957 x")).toBe("080442957X");
  });

  it("rechaza dígitos de control incorrectos y formatos inválidos", () => {
    for (const isbn of ["978-84-323-0291-3", "0-306-40615-3", "12345", "97884323029X3", "abc", ""]) {
      expect(normalizarIsbn(isbn)).toBeNull();
    }
  });
});

describe("listas de las fichas", () => {
  it("reconoce los estados de lectura y los tipos de recurso", () => {
    expect(["por_leer", "leyendo", "leido"].every(esEstadoLectura)).toBe(true);
    expect(esEstadoLectura("abandonado")).toBe(false);
    expect(esEstadoLectura("toString")).toBe(false);
    expect(["articulo", "pagina_web", "video", "podcast", "documento", "curso", "audio", "otro"].every(esTipoRecurso)).toBe(true);
    expect(esTipoRecurso("libro")).toBe(false);
  });

  it("valida fechas de publicación reales", () => {
    expect(esFechaValida("1883-03-14")).toBe(true);
    expect(esFechaValida("2024-02-29")).toBe(true);
    expect(esFechaValida("2023-02-29")).toBe(false);
    expect(esFechaValida("14/03/1883")).toBe(false);
  });
});
