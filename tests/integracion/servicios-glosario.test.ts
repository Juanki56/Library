import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import {
  crear,
  eliminar,
  guardar,
  listarPorLetra,
  obtenerEntrada,
  ERROR_DEFINICION,
  ERROR_DUPLICADO,
  ERROR_TERMINO,
} from "@/backend/services/glosario";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 4.1: servicio del glosario (spec glosario).
let usuario: UsuarioPrueba;
let cliente: SupabaseClient<Database>;

beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  cliente = await clienteDe(usuario);
});

afterAll(async () => {
  await borrarUsuario(usuario);
});

const vacia = { termino: "", definicion: "", ejemplo: "", informacionAdicional: "" };

describe("glosario", () => {
  it("guarda sin ejemplo y exige término y definición", async () => {
    const r = await crear(cliente, { ...vacia, termino: "Plusvalía", definicion: "Valor excedente." });
    expect(r.ok).toBe(true);
    expect(await obtenerEntrada(cliente, (r as { valor: string }).valor)).toMatchObject({ ejemplo: null });
    expect(await crear(cliente, { ...vacia, definicion: "x" })).toEqual({ ok: false, error: ERROR_TERMINO });
    expect(await crear(cliente, { ...vacia, termino: "Dialéctica" })).toEqual({ ok: false, error: ERROR_DEFINICION });
  });

  it("un término duplicado (sin tildes) devuelve la entrada existente para abrirla", async () => {
    const original = await crear(cliente, { ...vacia, termino: "Alienación", definicion: "Extrañamiento." });
    const id = (original as { valor: string }).valor;
    const repetido = await crear(cliente, { ...vacia, termino: "alienacion", definicion: "Otra." });
    expect(repetido).toEqual({ ok: false, error: ERROR_DUPLICADO, existente: { id, termino: "Alienación" } });
  });

  it("agrupa por letra en orden alfabético, ignorando tildes", async () => {
    await crear(cliente, { ...vacia, termino: "Ética", definicion: "Reflexión sobre la moral." });
    await crear(cliente, { ...vacia, termino: "Praxis", definicion: "Actividad práctica." });
    const grupos = await listarPorLetra(cliente);
    const letras = grupos.map((g) => g.letra);
    expect(letras).toEqual([...letras].sort());
    expect(grupos.find((g) => g.letra === "E")?.entradas.map((e) => e.termino)).toContain("Ética");
    expect(grupos.find((g) => g.letra === "P")?.entradas.map((e) => e.termino)).toEqual(["Plusvalía", "Praxis"]);
  });

  it("edita la definición y elimina", async () => {
    const r = await crear(cliente, { ...vacia, termino: "Reificación", definicion: "Provisional." });
    const id = (r as { valor: string }).valor;
    expect((await guardar(cliente, id, { ...vacia, termino: "Reificación", definicion: "Cosificación de las relaciones." })).ok).toBe(true);
    expect((await obtenerEntrada(cliente, id))?.definicion).toBe("Cosificación de las relaciones.");
    expect((await eliminar(cliente, id)).ok).toBe(true);
    expect(await obtenerEntrada(cliente, id)).toBeNull();
  });
});
