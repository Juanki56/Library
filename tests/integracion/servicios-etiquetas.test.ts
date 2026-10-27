import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import {
  asignar,
  contarUsos,
  crear,
  elementosDe,
  eliminar,
  etiquetasDe,
  listarEtiquetas,
  quitar,
  renombrar,
  ERROR_YA_EXISTE,
} from "@/backend/services/etiquetas";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 3.1: servicio de etiquetas (spec etiquetas).
let usuario: UsuarioPrueba;
let cliente: SupabaseClient<Database>;

beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  cliente = await clienteDe(usuario);
});

afterAll(async () => {
  await borrarUsuario(usuario);
});

async function id(tabla: "notas" | "libros" | "proyectos" | "recursos", campo: string, valor: string) {
  const { data } = await (cliente.from(tabla) as ReturnType<SupabaseClient["from"]>)
    .insert({ [campo]: valor } as never)
    .select("id")
    .single();
  return (data as { id: string }).id;
}

describe("ejemplo «Filosofía» en los cuatro tipos", () => {
  it("reutiliza la etiqueta, agrupa por tipo y filtra", async () => {
    const nota = await id("notas", "titulo", "Platón y las ideas");
    const libro = await id("libros", "titulo", "La República");
    const proyecto = await id("proyectos", "nombre", "Estudiar filosofía");
    const recurso = await id("recursos", "titulo", "Enciclopedia de Stanford");

    expect((await asignar(cliente, "nota", nota, "Filosofía")).ok).toBe(true);
    expect((await asignar(cliente, "libro", libro, "filosofia")).ok).toBe(true);
    expect((await asignar(cliente, "proyecto", proyecto, "  FILOSOFÍA ")).ok).toBe(true);
    expect((await asignar(cliente, "recurso", recurso, "Filosofia")).ok).toBe(true);
    // Asignar dos veces no da error.
    expect((await asignar(cliente, "nota", nota, "Filosofía")).ok).toBe(true);

    const todas = (await listarEtiquetas(cliente)).filter((e) => e.nombre.toLowerCase().startsWith("filosof"));
    expect(todas).toEqual([{ id: todas[0].id, nombre: "Filosofía" }]);

    const grupos = await elementosDe(cliente, todas[0].id);
    expect(grupos.map((g) => `${g.tipo}:${g.elementos.map((e) => e.nombre).join(",")}`)).toEqual([
      "nota:Platón y las ideas",
      "libro:La República",
      "proyecto:Estudiar filosofía",
      "recurso:Enciclopedia de Stanford",
    ]);
    const soloLibros = await elementosDe(cliente, todas[0].id, "libro");
    expect(soloLibros).toEqual([{ tipo: "libro", elementos: [{ id: libro, nombre: "La República" }] }]);
    expect(await contarUsos(cliente, todas[0].id)).toBe(4);

    // Quitar no borra el elemento.
    await quitar(cliente, "nota", nota, todas[0].id);
    expect(await etiquetasDe(cliente, "nota", nota)).toEqual([]);
    expect((await cliente.from("notas").select("id").eq("id", nota)).data).toHaveLength(1);
  });
});

describe("administración", () => {
  it("crea, renombra sin duplicar y elimina conservando los elementos", async () => {
    const economia = await crear(cliente, "economía");
    expect(economia.ok).toBe(true);
    expect(await crear(cliente, "Economia")).toEqual({ ok: false, error: ERROR_YA_EXISTE });

    const marxismo = await crear(cliente, "marxismo");
    const idMarxismo = (marxismo as { valor: { id: string } }).valor.id;
    expect(await renombrar(cliente, idMarxismo, "ECONOMÍA")).toEqual({ ok: false, error: ERROR_YA_EXISTE });
    expect((await renombrar(cliente, idMarxismo, "Marxismo")).ok).toBe(true);

    const nota = await id("notas", "titulo", "Plusvalía");
    await asignar(cliente, "nota", nota, "Marxismo");
    expect((await etiquetasDe(cliente, "nota", nota)).map((e) => e.nombre)).toEqual(["Marxismo"]);

    expect((await eliminar(cliente, idMarxismo)).ok).toBe(true);
    expect(await etiquetasDe(cliente, "nota", nota)).toEqual([]);
    expect((await cliente.from("notas").select("id").eq("id", nota)).data).toHaveLength(1);
  });
});
