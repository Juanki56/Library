import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ESPERA,
  GuardadoAutomatico,
  MENSAJE_CONFLICTO,
  MENSAJE_SIN_CONEXION,
  type EstadoGuardado,
  type ResultadoGuardado,
} from "@/frontend/components/guardadoAutomatico";

// Tarea 3.1: lógica del guardado automático con temporizadores simulados (design D5).

function preparar(respuestas: (() => Promise<ResultadoGuardado>)[], enLinea = () => true) {
  const estados: EstadoGuardado[] = [];
  const mensajes: (string | undefined)[] = [];
  const copia = { escribir: vi.fn(), borrar: vi.fn() };
  let n = 0;
  const guardar = vi.fn(() => (respuestas[Math.min(n++, respuestas.length - 1)] ?? (() => Promise.reject()))());
  const g = new GuardadoAutomatico({
    versionInicial: "v0",
    guardar,
    alCambiar: (s) => {
      estados.push(s.estado);
      mensajes.push(s.mensaje);
    },
    copiaLocal: copia,
    enLinea,
  });
  return { g, guardar, estados, mensajes, copia };
}

const ok = (version: string) => () => Promise.resolve({ tipo: "ok", version } as const);
const borrador = (texto: string) => ({ titulo: "Nota", contenido: texto });

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("guardado automático", () => {
  it("espera a que se deje de escribir y pasa por «guardando» antes de «guardado»", async () => {
    const { g, guardar, estados, copia } = preparar([ok("v1")]);
    g.cambio(borrador("a"));
    g.cambio(borrador("ab"));
    expect(guardar).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(ESPERA);
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(guardar).toHaveBeenCalledWith(borrador("ab"), "v0");
    expect(estados).toEqual(["pendiente", "pendiente", "guardando", "guardado"]);
    expect(g.versionActual).toBe("v1");
    expect(copia.escribir).toHaveBeenCalled();
    expect(copia.borrar).toHaveBeenCalledTimes(1);
    expect(g.hayCambiosSinGuardar()).toBe(false);
  });

  it("nunca muestra «guardado» si el servidor no confirma", async () => {
    const { g, estados, copia } = preparar([() => Promise.reject(new Error("red"))]);
    g.cambio(borrador("a"));
    await vi.advanceTimersByTimeAsync(ESPERA);
    expect(estados).not.toContain("guardado");
    expect(g.estado).toBe("error");
    expect(g.hayCambiosSinGuardar()).toBe(true);
    expect(copia.borrar).not.toHaveBeenCalled();
  });

  it("encadena los cambios que llegan durante un guardado con la versión nueva, sin peticiones en paralelo", async () => {
    let resolver!: (r: ResultadoGuardado) => void;
    const lento = () => new Promise<ResultadoGuardado>((r) => (resolver = r));
    const { g, guardar } = preparar([lento, ok("v2")]);
    g.cambio(borrador("uno"));
    await vi.advanceTimersByTimeAsync(ESPERA);
    g.cambio(borrador("dos"));
    g.guardarAhora(); // en curso: no lanza otra petición
    expect(guardar).toHaveBeenCalledTimes(1);
    resolver({ tipo: "ok", version: "v1" });
    await vi.advanceTimersByTimeAsync(0);
    expect(guardar).toHaveBeenCalledTimes(2);
    expect(guardar).toHaveBeenLastCalledWith(borrador("dos"), "v1");
    await vi.advanceTimersByTimeAsync(0);
    expect(g.estado).toBe("guardado");
    expect(g.versionActual).toBe("v2");
  });

  it("reintenta tras un fallo de red con espera creciente", async () => {
    const { g, guardar } = preparar([() => Promise.reject(), () => Promise.reject(), ok("v1")]);
    g.cambio(borrador("a"));
    await vi.advanceTimersByTimeAsync(ESPERA);
    expect(guardar).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2000);
    expect(guardar).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(3999);
    expect(guardar).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(guardar).toHaveBeenCalledTimes(3);
    expect(g.estado).toBe("guardado");
  });

  it("sin conexión indica «sin conexión» y guarda al reintentar cuando vuelve", async () => {
    let conectado = false;
    const { g, guardar, mensajes } = preparar([() => Promise.reject(), ok("v1")], () => conectado);
    g.cambio(borrador("a"));
    await vi.advanceTimersByTimeAsync(ESPERA);
    expect(g.estado).toBe("sin-conexion");
    expect(mensajes).toContain(MENSAJE_SIN_CONEXION);
    conectado = true;
    g.reintentar();
    await vi.advanceTimersByTimeAsync(0);
    expect(guardar).toHaveBeenCalledTimes(2);
    expect(g.estado).toBe("guardado");
  });

  it("no reintenta un error de validación hasta el siguiente cambio", async () => {
    const { g, guardar } = preparar([
      () => Promise.resolve({ tipo: "error", error: "La nota necesita un título.", validacion: true } as const),
      ok("v1"),
    ]);
    g.cambio({ titulo: "", contenido: "x" });
    await vi.advanceTimersByTimeAsync(ESPERA);
    expect(g.estado).toBe("error");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(guardar).toHaveBeenCalledTimes(1);
    g.cambio({ titulo: "Con título", contenido: "x" });
    await vi.advanceTimersByTimeAsync(ESPERA);
    expect(guardar).toHaveBeenCalledTimes(2);
    expect(g.estado).toBe("guardado");
  });

  it("ante un conflicto se detiene y solo guarda encima si el usuario lo elige", async () => {
    const { g, guardar, mensajes } = preparar([
      () => Promise.resolve({ tipo: "conflicto", version: "v9" } as const),
      ok("v10"),
    ]);
    g.cambio(borrador("mío"));
    await vi.advanceTimersByTimeAsync(ESPERA);
    expect(g.estado).toBe("conflicto");
    expect(mensajes).toContain(MENSAJE_CONFLICTO);

    // Más cambios o «guardar ahora» no sobrescriben mientras no se decida.
    g.cambio(borrador("mío 2"));
    g.guardarAhora();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(guardar).toHaveBeenCalledTimes(1);

    g.guardarEncima();
    await vi.advanceTimersByTimeAsync(0);
    expect(guardar).toHaveBeenCalledTimes(2);
    expect(guardar).toHaveBeenLastCalledWith(borrador("mío 2"), "v9");
    expect(g.estado).toBe("guardado");
  });
});
