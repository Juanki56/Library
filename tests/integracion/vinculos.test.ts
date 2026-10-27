import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import {
  borrarUsuario,
  clienteDe,
  crearUsuario,
  sinTipos,
  type FilaLibre,
  type UsuarioPrueba,
} from "../utilidades/usuarios";

// Tarea 3.2: vínculos sin duplicación entre elementos canónicos (spec relaciones, design D3).
type Cliente = SupabaseClient<Database>;
type Entidad = "proyectos" | "notas" | "libros" | "recursos";
type TablaVinculo = keyof Database["public"]["Tables"] &
  ("nota_proyecto" | "nota_libro" | "nota_recurso" | "libro_proyecto" | "recurso_proyecto" | "recurso_libro");

// Las 6 relaciones que piden las specs notas, libros y fuentes-recursos.
const VINCULOS: { tabla: TablaVinculo; a: Entidad; colA: string; b: Entidad; colB: string }[] = [
  { tabla: "nota_proyecto", a: "notas", colA: "nota_id", b: "proyectos", colB: "proyecto_id" },
  { tabla: "nota_libro", a: "notas", colA: "nota_id", b: "libros", colB: "libro_id" },
  { tabla: "nota_recurso", a: "notas", colA: "nota_id", b: "recursos", colB: "recurso_id" },
  { tabla: "libro_proyecto", a: "libros", colA: "libro_id", b: "proyectos", colB: "proyecto_id" },
  { tabla: "recurso_proyecto", a: "recursos", colA: "recurso_id", b: "proyectos", colB: "proyecto_id" },
  { tabla: "recurso_libro", a: "recursos", colA: "recurso_id", b: "libros", colB: "libro_id" },
];

const CAMPO: Record<Entidad, string> = {
  proyectos: "nombre",
  notas: "titulo",
  libros: "titulo",
  recursos: "titulo",
};

const tabla = (c: Cliente, t: string) => sinTipos(c).from(t);

async function crear(c: Cliente, entidad: Entidad, nombre: string): Promise<string> {
  const { data, error } = await tabla(c, entidad).insert(<FilaLibre>{ [CAMPO[entidad]]: nombre }).select("id").single();
  expect(error).toBeNull();
  return (data as { id: string }).id;
}

async function vincular(c: Cliente, t: TablaVinculo, fila: Record<string, string>) {
  return tabla(c, t).insert(fila);
}

async function contar(c: Cliente, t: string, filtro: Record<string, string> = {}) {
  let consulta = tabla(c, t).select("*", { count: "exact", head: true });
  for (const [columna, valor] of Object.entries(filtro)) consulta = consulta.eq(columna, valor);
  const { count, error } = await consulta;
  expect(error).toBeNull();
  return count ?? 0;
}

let a: UsuarioPrueba, b: UsuarioPrueba;
let clienteA: Cliente, clienteB: Cliente;

beforeAll(async () => {
  a = await crearUsuario({ confirmado: true });
  b = await crearUsuario({ confirmado: true });
  clienteA = await clienteDe(a);
  clienteB = await clienteDe(b);
});

afterAll(async () => {
  await borrarUsuario(a);
  await borrarUsuario(b);
});

describe("ejemplo de las specs: «La lucha de clases»", () => {
  it("una nota en dos proyectos y un libro sigue siendo una sola nota", async () => {
    const nota = await crear(clienteA, "notas", "La lucha de clases");
    const comunismo = await crear(clienteA, "proyectos", "Comunismo");
    const historia = await crear(clienteA, "proyectos", "Historia social");
    const manifiesto = await crear(clienteA, "libros", "El manifiesto comunista");

    expect((await vincular(clienteA, "nota_proyecto", { nota_id: nota, proyecto_id: comunismo })).error).toBeNull();
    expect((await vincular(clienteA, "nota_proyecto", { nota_id: nota, proyecto_id: historia })).error).toBeNull();
    expect((await vincular(clienteA, "nota_libro", { nota_id: nota, libro_id: manifiesto })).error).toBeNull();
    expect((await vincular(clienteA, "libro_proyecto", { libro_id: manifiesto, proyecto_id: comunismo })).error).toBeNull();

    // Spec notas: nota canónica única; spec relaciones: vínculos sin duplicación.
    expect(await contar(clienteA, "notas", { titulo: "La lucha de clases" })).toBe(1);
    expect(await contar(clienteA, "nota_proyecto", { nota_id: nota })).toBe(2);

    // Spec notas: un cambio hecho desde un espacio se ve desde todos.
    await tabla(clienteA, "notas").update(<FilaLibre>{ titulo: "La lucha de clases (revisada)" }).eq("id", nota);
    const desdeProyectos = await clienteA
      .from("nota_proyecto")
      .select("proyecto_id, notas(titulo)")
      .eq("nota_id", nota);
    expect(desdeProyectos.data).toHaveLength(2);
    for (const fila of desdeProyectos.data ?? []) {
      expect(fila.notas?.titulo).toBe("La lucha de clases (revisada)");
    }

    // Spec relaciones: eliminar un elemento quita sus vínculos, no los elementos relacionados.
    await tabla(clienteA, "proyectos").delete().eq("id", comunismo);
    expect(await contar(clienteA, "notas", { id: nota })).toBe(1);
    expect(await contar(clienteA, "libros", { id: manifiesto })).toBe(1);
    expect(await contar(clienteA, "nota_proyecto", { nota_id: nota })).toBe(1);
    expect(await contar(clienteA, "libro_proyecto", { libro_id: manifiesto })).toBe(0);
    expect(await contar(clienteA, "nota_libro", { nota_id: nota })).toBe(1);
  });
});

describe.each(VINCULOS)("$tabla", ({ tabla: t, a: entA, colA, b: entB, colB }) => {
  it("vincula dos elementos del mismo usuario", async () => {
    const idA = await crear(clienteA, entA, `${entA} uno`);
    const idB = await crear(clienteA, entB, `${entB} uno`);
    expect((await vincular(clienteA, t, { [colA]: idA, [colB]: idB })).error).toBeNull();
    expect(await contar(clienteA, t, { [colA]: idA, [colB]: idB })).toBe(1);
  });

  it("no crea un segundo vínculo igual", async () => {
    const idA = await crear(clienteA, entA, `${entA} dos`);
    const idB = await crear(clienteA, entB, `${entB} dos`);
    await vincular(clienteA, t, { [colA]: idA, [colB]: idB });
    const repetido = await vincular(clienteA, t, { [colA]: idA, [colB]: idB });
    expect(repetido.error?.code).toBe("23505");
    expect(await contar(clienteA, t, { [colA]: idA, [colB]: idB })).toBe(1);
  });

  it("no vincula elementos de usuarios distintos", async () => {
    const ajeno = await crear(clienteA, entA, `${entA} de A`);
    const propio = await crear(clienteB, entB, `${entB} de B`);
    const intento = await vincular(clienteB, t, { [colA]: ajeno, [colB]: propio });
    expect(intento.error?.code).toBe("23503");
  });

  it("otro usuario no ve ni borra el vínculo", async () => {
    const idA = await crear(clienteA, entA, `${entA} privado`);
    const idB = await crear(clienteA, entB, `${entB} privado`);
    await vincular(clienteA, t, { [colA]: idA, [colB]: idB });
    expect(await contar(clienteB, t, { [colA]: idA })).toBe(0);
    await tabla(clienteB, t).delete().eq(colA, idA);
    expect(await contar(clienteA, t, { [colA]: idA })).toBe(1);
  });

  it("desvincular no borra ninguno de los dos elementos", async () => {
    const idA = await crear(clienteA, entA, `${entA} tres`);
    const idB = await crear(clienteA, entB, `${entB} tres`);
    await vincular(clienteA, t, { [colA]: idA, [colB]: idB });
    await tabla(clienteA, t).delete().eq(colA, idA).eq(colB, idB);
    expect(await contar(clienteA, t, { [colA]: idA })).toBe(0);
    expect(await contar(clienteA, entA, { id: idA })).toBe(1);
    expect(await contar(clienteA, entB, { id: idB })).toBe(1);
  });

  it.each([
    ["primer", "segundo"],
    ["segundo", "primer"],
  ])("eliminar el %s elemento borra el vínculo y conserva el %s", async (borrado) => {
    const idA = await crear(clienteA, entA, `${entA} cuatro`);
    const idB = await crear(clienteA, entB, `${entB} cuatro`);
    await vincular(clienteA, t, { [colA]: idA, [colB]: idB });
    const [entBorrada, idBorrado, entConservada, idConservado] =
      borrado === "primer" ? [entA, idA, entB, idB] : [entB, idB, entA, idA];
    await tabla(clienteA, entBorrada).delete().eq("id", idBorrado);
    expect(await contar(clienteA, t, { [colA]: idA, [colB]: idB })).toBe(0);
    expect(await contar(clienteA, entConservada, { id: idConservado })).toBe(1);
  });
});
