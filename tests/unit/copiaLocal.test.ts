import { afterEach, describe, expect, it, vi } from "vitest";
import { borrarCopia, copiaLocalDe, leerCopia } from "@/frontend/components/copiaLocal";

// Tarea 3.2: copia local de seguridad (design D6).

function almacenEnMemoria(): Storage {
  const datos = new Map<string, string>();
  return {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
    clear: () => datos.clear(),
    key: (i) => [...datos.keys()][i] ?? null,
    get length() {
      return datos.size;
    },
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("copia local", () => {
  it("guarda el borrador con su versión base y se borra al confirmarse el guardado", () => {
    vi.stubGlobal("window", { localStorage: almacenEnMemoria() });
    const copia = copiaLocalDe("n1");
    copia.escribir({ titulo: "Nota", contenido: "{}" }, "v3");
    expect(leerCopia("n1")).toMatchObject({ titulo: "Nota", contenido: "{}", versionBase: "v3" });
    expect(leerCopia("otra")).toBeNull();
    copia.borrar();
    expect(leerCopia("n1")).toBeNull();
  });

  it("ignora copias dañadas", () => {
    const almacen = almacenEnMemoria();
    almacen.setItem("biblioteca:borrador:n2", "{no es json");
    vi.stubGlobal("window", { localStorage: almacen });
    expect(leerCopia("n2")).toBeNull();
  });

  it("si localStorage no está disponible, no falla", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("modo privado");
      },
    });
    const copia = copiaLocalDe("n3");
    expect(() => copia.escribir({ titulo: "x", contenido: "{}" }, "v1")).not.toThrow();
    expect(leerCopia("n3")).toBeNull();
    expect(() => borrarCopia("n3")).not.toThrow();
  });

  it("si no queda espacio, no falla", () => {
    const almacen = almacenEnMemoria();
    almacen.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    vi.stubGlobal("window", { localStorage: almacen });
    expect(() => copiaLocalDe("n4").escribir({ titulo: "x", contenido: "{}" }, "v1")).not.toThrow();
  });
});
