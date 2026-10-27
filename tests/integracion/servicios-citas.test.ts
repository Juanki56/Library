import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import {
  citasDe,
  crearCita,
  eliminarCita,
  guardarCita,
  listarCitas,
  obtenerCita,
  textoAutor,
  tieneOrigen,
  ERROR_ENLACE,
  ERROR_TEXTO,
  ERROR_TIPO,
} from "@/backend/services/citas";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 2.1: servicio de citas (spec citas).
let usuario: UsuarioPrueba, otro: UsuarioPrueba;
let cliente: SupabaseClient<Database>, clienteOtro: SupabaseClient<Database>;

beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  otro = await crearUsuario({ confirmado: true });
  cliente = await clienteDe(usuario);
  clienteOtro = await clienteDe(otro);
});

afterAll(async () => {
  await borrarUsuario(usuario);
  await borrarUsuario(otro);
});

const vacia = { texto: "", tipo: "", autor: "", fuente: "", enlace: "" };

describe("citas", () => {
  it("guarda un proverbio sin autor ni origen y lo muestra sin inventar nada", async () => {
    const r = await crearCita(cliente, { ...vacia, texto: "Poco a poco se va lejos.", tipo: "proverbio" });
    expect(r.ok).toBe(true);
    const cita = await obtenerCita(cliente, (r as { valor: string }).valor);
    expect(cita).toMatchObject({ tipo: "proverbio", autor: null, fuente: null, enlace: null });
    expect(textoAutor(cita!)).toBe("Sin autor");
    expect(tieneOrigen(cita!)).toBe(false);
  });

  it("usa «cita» como tipo por defecto y rechaza texto vacío o tipo desconocido", async () => {
    const r = await crearCita(cliente, { ...vacia, texto: "Sapere aude.", autor: "Horacio" });
    expect((await obtenerCita(cliente, (r as { valor: string }).valor))?.tipo).toBe("cita");
    expect(await crearCita(cliente, { ...vacia, texto: "  " })).toEqual({ ok: false, error: ERROR_TEXTO });
    expect(await crearCita(cliente, { ...vacia, texto: "x", tipo: "chiste" })).toEqual({ ok: false, error: ERROR_TIPO });
  });

  it("se enlaza opcionalmente a un libro y aparece en él; editar se refleja", async () => {
    const { data: libro } = await cliente.from("libros").insert({ titulo: "Tesis sobre Feuerbach" }).select("id").single();
    const r = await crearCita(cliente, {
      ...vacia,
      texto: "Los filósofos no han hecho más que interpretar el mundo.",
      autor: "Karl Marx",
      fuente: "Tesis XI",
      enlace: `libro:${libro!.id}`,
    });
    const id = (r as { valor: string }).valor;
    const enLibro = await citasDe(cliente, "libro", libro!.id);
    expect(enLibro.map((c) => c.id)).toEqual([id]);
    expect(enLibro[0].enlace).toEqual({ tipo: "libro", id: libro!.id, titulo: "Tesis sobre Feuerbach" });

    await guardarCita(cliente, id, {
      ...vacia,
      texto: "Los filósofos no han hecho más que interpretar de diversos modos el mundo.",
      autor: "Karl Marx",
      enlace: `libro:${libro!.id}`,
    });
    expect((await citasDe(cliente, "libro", libro!.id))[0].texto).toContain("de diversos modos");
  });

  it("rechaza un enlace a un libro de otro usuario o mal formado", async () => {
    const { data: ajeno } = await clienteOtro.from("libros").insert({ titulo: "Libro ajeno" }).select("id").single();
    expect(await crearCita(cliente, { ...vacia, texto: "x", enlace: `libro:${ajeno!.id}` })).toEqual({
      ok: false,
      error: ERROR_ENLACE,
    });
    expect(await crearCita(cliente, { ...vacia, texto: "x", enlace: "nota:123" })).toEqual({ ok: false, error: ERROR_ENLACE });
  });

  it("lista las más recientes primero y elimina", async () => {
    const r1 = await crearCita(cliente, { ...vacia, texto: "Primera de orden" });
    const r2 = await crearCita(cliente, { ...vacia, texto: "Segunda de orden" });
    const lista = await listarCitas(cliente);
    const indice = (id: string) => lista.findIndex((c) => c.id === id);
    expect(indice((r2 as { valor: string }).valor)).toBeLessThan(indice((r1 as { valor: string }).valor));
    expect((await listarCitas(cliente, 2)).length).toBe(2);

    expect((await eliminarCita(cliente, (r1 as { valor: string }).valor)).ok).toBe(true);
    expect(await obtenerCita(cliente, (r1 as { valor: string }).valor)).toBeNull();
  });
});
