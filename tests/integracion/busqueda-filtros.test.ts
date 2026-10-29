import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 1.2 (filtros-citas-busqueda): función buscar con filtros (spec busqueda, design D1).
type Cliente = SupabaseClient<Database>;
type Filtros = Database["public"]["Functions"]["buscar"]["Args"];
let a: UsuarioPrueba, b: UsuarioPrueba;
let clienteA: Cliente, clienteB: Cliente;
const ids: Record<string, string> = {};

async function crear<T extends "notas" | "libros" | "recursos" | "proyectos" | "citas" | "etiquetas">(
  c: Cliente,
  tabla: T,
  fila: Database["public"]["Tables"][T]["Insert"],
) {
  const { data, error } = await c.from(tabla).insert(fila as never).select("id").single();
  if (error) throw error;
  return (data as unknown as { id: string }).id;
}

beforeAll(async () => {
  a = await crearUsuario({ confirmado: true });
  b = await crearUsuario({ confirmado: true });
  clienteA = await clienteDe(a);
  clienteB = await clienteDe(b);

  ids.capital = await crear(clienteA, "libros", { titulo: "El capital", autores: "Karl Marx" });
  ids.arendt = await crear(clienteA, "libros", { titulo: "La condición humana", autores: "Hannah Arendt" });
  ids.nota = await crear(clienteA, "notas", { titulo: "Sobre el capital", contenido_texto: "Notas sobre el capital y las clases." });
  ids.notaSuelta = await crear(clienteA, "notas", { titulo: "Capital suelto", contenido_texto: "capital" });
  ids.cita = await crear(clienteA, "citas", { texto: "El capital es trabajo muerto.", autor: "Karl Marx", libro_id: ids.capital });
  ids.recurso = await crear(clienteA, "recursos", { titulo: "Charla sobre el capital", autor: "David Harvey" });
  ids.comunismo = await crear(clienteA, "proyectos", { nombre: "Comunismo" });
  ids.clases = await crear(clienteA, "etiquetas", { nombre: "Clases" });

  await clienteA.from("nota_proyecto").insert({ nota_id: ids.nota, proyecto_id: ids.comunismo });
  await clienteA.from("libro_proyecto").insert({ libro_id: ids.capital, proyecto_id: ids.comunismo });
  await clienteA.from("nota_libro").insert({ nota_id: ids.nota, libro_id: ids.capital });
  await clienteA.from("recurso_libro").insert({ recurso_id: ids.recurso, libro_id: ids.capital });
  await clienteA.from("etiqueta_nota").insert({ etiqueta_id: ids.clases, nota_id: ids.nota });
  await clienteA.from("etiqueta_libro").insert({ etiqueta_id: ids.clases, libro_id: ids.capital });

  await crear(clienteB, "libros", { titulo: "El capital de B", autores: "Karl Marx" });
});

afterAll(async () => {
  await borrarUsuario(a);
  await borrarUsuario(b);
});

async function buscar(c: Cliente, consulta: string, filtros: Omit<Filtros, "consulta"> = {}) {
  const { data, error } = await c.rpc("buscar", { consulta, ...filtros });
  if (error) throw error;
  return (data ?? []).map((r) => r.id).sort();
}

const ordenados = (...lista: string[]) => [...lista].sort();

describe("filtros de búsqueda (requisito «Filtro por tipo de contenido»)", () => {
  it("autor: solo libros, recursos y citas de ese autor, sin tildes ni mayúsculas (escenario «Filtrar por autor»)", async () => {
    expect(await buscar(clienteA, "capital", { autor: "MARX" })).toEqual(ordenados(ids.capital, ids.cita));
    expect(await buscar(clienteA, "", { autor: "harvey" })).toEqual([ids.recurso]);
  });

  it("proyecto y etiqueta, sin texto (escenario «Filtrar por etiqueta y proyecto sin texto»)", async () => {
    expect(await buscar(clienteA, "", { proyecto: ids.comunismo })).toEqual(ordenados(ids.nota, ids.capital));
    expect(await buscar(clienteA, "", { proyecto: ids.comunismo, etiqueta: ids.clases })).toEqual(ordenados(ids.nota, ids.capital));
    expect(await buscar(clienteA, "", { etiqueta: ids.clases, filtro: "nota" })).toEqual([ids.nota]);
  });

  it("libro: notas y recursos vinculados y citas enlazadas (escenario «Filtrar por libro»)", async () => {
    expect(await buscar(clienteA, "", { libro: ids.capital })).toEqual(ordenados(ids.nota, ids.recurso, ids.cita));
  });

  it("fecha de modificación (escenario «Filtrar por fecha»)", async () => {
    const hoy = new Date().toISOString().slice(0, 10);
    expect((await buscar(clienteA, "capital", { desde: hoy })).length).toBeGreaterThan(0);
    expect(await buscar(clienteA, "capital", { hasta: "2000-01-01" })).toEqual([]);
    expect(await buscar(clienteA, "capital", { desde: "2999-01-01" })).toEqual([]);
  });

  it("sin texto ni filtros no devuelve nada; con texto y filtros combina ambos", async () => {
    expect(await buscar(clienteA, "")).toEqual([]);
    expect(await buscar(clienteA, "clases", { proyecto: ids.comunismo })).toEqual([ids.nota]);
  });

  it("no muestra nada de otro usuario, ni con filtros", async () => {
    expect(await buscar(clienteB, "", { proyecto: ids.comunismo })).toEqual([]);
    expect(await buscar(clienteB, "", { libro: ids.capital })).toEqual([]);
    const deB = await buscar(clienteB, "", { autor: "marx" });
    expect(deB).toHaveLength(1);
    expect(deB).not.toContain(ids.capital);
  });
});
