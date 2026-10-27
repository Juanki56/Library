import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 1.2: función buscar (spec busqueda, design D5).
type Cliente = SupabaseClient<Database>;
let a: UsuarioPrueba, b: UsuarioPrueba;
let clienteA: Cliente, clienteB: Cliente;

beforeAll(async () => {
  a = await crearUsuario({ confirmado: true });
  b = await crearUsuario({ confirmado: true });
  clienteA = await clienteDe(a);
  clienteB = await clienteDe(b);

  await clienteA.from("libros").insert([
    { titulo: "El capital", autores: "Karl Marx", editorial: "Editorial Zanzíbar" },
    { titulo: "La condición humana", autores: "Hannah Arendt" },
  ]);
  await clienteA.from("notas").insert([
    { titulo: "Plusvalía", contenido_texto: "El capital produce plusvalía a partir del trabajo." },
    { titulo: "Filosofía de la historia", contenido_texto: "Materialismo histórico y dialéctica." },
  ]);
  await clienteA.from("citas").insert({
    texto: "Los filósofos no han hecho más que interpretar el mundo.",
    autor: "Karl Marx",
    fuente: "Tesis sobre Feuerbach",
  });
  await clienteA.from("glosario").insert({ termino: "Alienación", definicion: "Extrañamiento del trabajador respecto de su producto." });
  await clienteA.from("recursos").insert({ titulo: "Archivo en línea", autor: "Varios", url: "https://marxists.org/capital" });
  await clienteB.from("notas").insert({ titulo: "Capital secreto de B", contenido_texto: "capital" });
});

afterAll(async () => {
  await borrarUsuario(a);
  await borrarUsuario(b);
});

async function buscar(c: Cliente, consulta: string, filtro?: string) {
  const { data, error } = await c.rpc("buscar", { consulta, filtro });
  expect(error).toBeNull();
  return data!;
}

describe("buscar", () => {
  it("encuentra en varios tipos y cada elemento una sola vez", async () => {
    const r = await buscar(clienteA, "capital");
    const tipos = r.map((x) => `${x.tipo}:${x.titulo}`);
    expect(tipos).toContain("libro:El capital");
    expect(tipos).toContain("nota:Plusvalía");
    expect(new Set(r.map((x) => x.id)).size).toBe(r.length);
  });

  it("encuentra por autor aunque no esté en el título (escenario «Buscar por autor»)", async () => {
    const r = await buscar(clienteA, "Marx");
    expect(r.map((x) => x.tipo).sort()).toEqual(["cita", "libro"]);
  });

  it("ignora tildes y mayúsculas y encuentra por inicio de palabra", async () => {
    expect((await buscar(clienteA, "filosofia")).map((x) => x.titulo)).toContain("Filosofía de la historia");
    expect((await buscar(clienteA, "MATERIA")).map((x) => x.titulo)).toContain("Filosofía de la historia");
    expect((await buscar(clienteA, "alienacion")).map((x) => x.tipo)).toEqual(["termino"]);
  });

  it("pondera más el título que el contenido", async () => {
    const r = await buscar(clienteA, "plusvalia");
    expect(r[0].titulo).toBe("Plusvalía");
  });

  it("no busca en campos excluidos (escenario «Campo no incluido»)", async () => {
    expect(await buscar(clienteA, "Zanzíbar")).toEqual([]);
    expect(await buscar(clienteA, "marxists")).toEqual([]);
  });

  it("filtra por tipo", async () => {
    const r = await buscar(clienteA, "marx", "cita");
    expect(r.map((x) => x.tipo)).toEqual(["cita"]);
  });

  it("no devuelve contenido de otros usuarios", async () => {
    expect((await buscar(clienteA, "secreto")).length).toBe(0);
    expect((await buscar(clienteB, "marx")).length).toBe(0);
  });

  it("una consulta vacía o solo con símbolos no devuelve nada ni falla", async () => {
    expect(await buscar(clienteA, "")).toEqual([]);
    expect(await buscar(clienteA, "&|!:*()")).toEqual([]);
  });
});
