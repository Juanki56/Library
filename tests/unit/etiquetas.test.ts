import { describe, expect, it } from "vitest";
import { limpiarNombre, normalizar, textoAvisoEtiqueta } from "@/backend/services/etiquetas";

describe("normalizar (misma regla que la base de datos)", () => {
  it("ignora mayúsculas, tildes y espacios sobrantes", () => {
    for (const variante of ["Filosofía", "filosofia", "  FILOSOFÍA ", "Filosofia"]) {
      expect(normalizar(variante)).toBe("filosofia");
    }
    expect(normalizar("Historia   social")).toBe("historia social");
  });

  it("limpiarNombre conserva la forma escrita sin espacios sobrantes", () => {
    expect(limpiarNombre("  Historia   Social ")).toBe("Historia Social");
  });
});

describe("aviso al eliminar una etiqueta", () => {
  it("indica cuántos elementos la usan y que no se borran", () => {
    expect(textoAvisoEtiqueta(0)).toBe("Ningún elemento usa esta etiqueta.");
    expect(textoAvisoEtiqueta(1)).toBe("Se quitará de 1 elemento. Ese elemento no se borrará.");
    expect(textoAvisoEtiqueta(3)).toBe("Se quitará de 3 elementos. Esos elementos no se borrarán.");
  });
});
