import { describe, expect, it } from "vitest";
import { fragmento, primeraCoincidencia, terminosDe } from "@/backend/services/fragmento";

describe("terminosDe", () => {
  it("quita símbolos, tildes y mayúsculas", () => {
    expect(terminosDe("  Filosofía & Ética: ¿Kant?  ")).toEqual(["filosofia", "etica", "kant"]);
    expect(terminosDe("&|!:*()")).toEqual([]);
  });
});

describe("primeraCoincidencia", () => {
  it("encuentra por inicio de palabra ignorando tildes y conserva las posiciones originales", () => {
    const texto = "Notas sobre la Filosofía moderna";
    const c = primeraCoincidencia(texto, ["filosofia"])!;
    expect(texto.slice(c.inicio, c.fin)).toBe("Filosofía");
  });

  it("no coincide en mitad de una palabra", () => {
    expect(primeraCoincidencia("antimaterialismo", ["materia"])).toBeNull();
    const c = primeraCoincidencia("el materialismo histórico", ["materia"])!;
    expect("el materialismo histórico".slice(c.inicio, c.fin)).toBe("materia");
  });
});

describe("fragmento", () => {
  it("marca la coincidencia y recorta con puntos suspensivos", () => {
    const texto = `${"palabra ".repeat(20)}la teoría de la plusvalía en Marx ${"otra ".repeat(30)}`;
    const partes = fragmento(texto, ["plusvalia"]);
    expect(partes.find((p) => p.marcado)?.texto).toBe("plusvalía");
    expect(partes[0].texto.startsWith("…")).toBe(true);
    expect(partes.at(-1)!.texto.endsWith("…")).toBe(true);
  });

  it("sin coincidencia en el texto, devuelve su comienzo sin marcar", () => {
    expect(fragmento("Definición breve.", ["titulo"])).toEqual([{ texto: "Definición breve.", marcado: false }]);
  });

  it("un texto vacío no produce fragmento", () => {
    expect(fragmento("   ", ["x"])).toEqual([]);
  });
});
