import { describe, expect, it } from "vitest";
import { esTipoAsignable, textoAvisoApartado } from "@/backend/services/apartados";

describe("aviso al eliminar un apartado", () => {
  it("indica que un apartado vacío está vacío", () => {
    expect(textoAvisoApartado(0)).toBe("Este apartado está vacío.");
  });

  it("usa singular con un elemento", () => {
    expect(textoAvisoApartado(1)).toBe("El elemento de este apartado seguirá en el proyecto.");
  });

  it("indica cuántos elementos seguirán en el proyecto", () => {
    expect(textoAvisoApartado(3)).toBe("Los 3 elementos de este apartado seguirán en el proyecto.");
  });
});

describe("tipos asignables a un apartado", () => {
  it("solo notas, libros y recursos", () => {
    expect(["nota", "libro", "recurso"].every(esTipoAsignable)).toBe(true);
    expect(esTipoAsignable("proyecto")).toBe(false);
    expect(esTipoAsignable("cita")).toBe(false);
  });
});
