import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 1.2 (apartados-proyectos): garantías de la base de datos (design D1–D3).
type Cliente = SupabaseClient<Database>;
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

async function proyecto(c: Cliente, nombre: string) {
  const { data } = await c.from("proyectos").insert({ nombre }).select("id").single();
  return data!.id;
}
async function nota(c: Cliente, titulo: string) {
  const { data } = await c.from("notas").insert({ titulo }).select("id").single();
  return data!.id;
}
async function apartado(c: Cliente, proyectoId: string, titulo: string, posicion: number) {
  const { data, error } = await c
    .from("apartados")
    .insert({ proyecto_id: proyectoId, titulo, posicion })
    .select("id")
    .single();
  expect(error).toBeNull();
  return data!.id;
}
async function titulosEnOrden(c: Cliente, proyectoId: string) {
  const { data } = await c
    .from("apartados")
    .select("titulo")
    .eq("proyecto_id", proyectoId)
    .order("posicion")
    .order("creado_en");
  return data!.map((x) => x.titulo);
}

describe("asignaciones atadas al proyecto", () => {
  it("no permite asignar a un apartado una nota que no está en el proyecto", async () => {
    const p = await proyecto(clienteA, "Estudiar filosofía");
    const ap = await apartado(clienteA, p, "Ética", 1);
    const n = await nota(clienteA, "Kant y el deber");
    const { error } = await clienteA.from("apartado_nota").insert({ apartado_id: ap, nota_id: n, proyecto_id: p });
    expect(error?.code).toBe("23503");
  });

  it("una nota del proyecto puede estar en dos apartados", async () => {
    const p = await proyecto(clienteA, "Filosofía (dos apartados)");
    const moderna = await apartado(clienteA, p, "Filosofía moderna", 1);
    const etica = await apartado(clienteA, p, "Ética", 2);
    const n = await nota(clienteA, "Kant (dos apartados)");
    await clienteA.from("nota_proyecto").insert({ nota_id: n, proyecto_id: p });
    for (const ap of [moderna, etica]) {
      const { error } = await clienteA.from("apartado_nota").insert({ apartado_id: ap, nota_id: n, proyecto_id: p });
      expect(error).toBeNull();
    }
    const { count } = await clienteA.from("apartado_nota").select("*", { count: "exact", head: true }).eq("nota_id", n);
    expect(count).toBe(2);
    const notas = await clienteA.from("notas").select("id").eq("id", n);
    expect(notas.data).toHaveLength(1);
  });

  it("desvincular del proyecto saca la nota de sus apartados sin borrarla", async () => {
    const p = await proyecto(clienteA, "Filosofía (desvincular)");
    const ap = await apartado(clienteA, p, "Ética", 1);
    const n = await nota(clienteA, "Nota (desvincular)");
    await clienteA.from("nota_proyecto").insert({ nota_id: n, proyecto_id: p });
    await clienteA.from("apartado_nota").insert({ apartado_id: ap, nota_id: n, proyecto_id: p });

    await clienteA.from("nota_proyecto").delete().eq("nota_id", n).eq("proyecto_id", p);

    const asignaciones = await clienteA.from("apartado_nota").select("*").eq("nota_id", n);
    expect(asignaciones.data).toEqual([]);
    const notas = await clienteA.from("notas").select("id").eq("id", n);
    expect(notas.data).toHaveLength(1);
  });

  it("eliminar un apartado conserva el vínculo de la nota con el proyecto", async () => {
    const p = await proyecto(clienteA, "Filosofía (eliminar apartado)");
    const ap = await apartado(clienteA, p, "Ética", 1);
    const n = await nota(clienteA, "Nota (eliminar apartado)");
    await clienteA.from("nota_proyecto").insert({ nota_id: n, proyecto_id: p });
    await clienteA.from("apartado_nota").insert({ apartado_id: ap, nota_id: n, proyecto_id: p });

    await clienteA.from("apartados").delete().eq("id", ap);

    const vinculo = await clienteA.from("nota_proyecto").select("*").eq("nota_id", n).eq("proyecto_id", p);
    expect(vinculo.data).toHaveLength(1);
  });

  it("borrar el proyecto borra sus apartados", async () => {
    const p = await proyecto(clienteA, "Proyecto efímero");
    const ap = await apartado(clienteA, p, "Único", 1);
    await clienteA.from("proyectos").delete().eq("id", p);
    const restos = await clienteA.from("apartados").select("id").eq("id", ap);
    expect(restos.data).toEqual([]);
  });
});

describe("mover_apartado", () => {
  it("sube y baja intercambiando posiciones y no hace nada en los extremos", async () => {
    const p = await proyecto(clienteA, "Filosofía (orden)");
    const antigua = await apartado(clienteA, p, "Filosofía antigua", 1);
    await apartado(clienteA, p, "Filosofía moderna", 2);
    const etica = await apartado(clienteA, p, "Ética", 3);

    await clienteA.rpc("mover_apartado", { apartado: etica, direccion: "subir" });
    expect(await titulosEnOrden(clienteA, p)).toEqual(["Filosofía antigua", "Ética", "Filosofía moderna"]);

    await clienteA.rpc("mover_apartado", { apartado: antigua, direccion: "subir" });
    expect(await titulosEnOrden(clienteA, p)).toEqual(["Filosofía antigua", "Ética", "Filosofía moderna"]);

    await clienteA.rpc("mover_apartado", { apartado: antigua, direccion: "bajar" });
    expect(await titulosEnOrden(clienteA, p)).toEqual(["Ética", "Filosofía antigua", "Filosofía moderna"]);
  });

  it("resuelve posiciones repetidas antes de mover", async () => {
    const p = await proyecto(clienteA, "Filosofía (empate)");
    await apartado(clienteA, p, "Primero", 5);
    const segundo = await apartado(clienteA, p, "Segundo", 5);
    await clienteA.rpc("mover_apartado", { apartado: segundo, direccion: "subir" });
    expect(await titulosEnOrden(clienteA, p)).toEqual(["Segundo", "Primero"]);
  });
});

describe("aislamiento entre usuarios", () => {
  it("otro usuario no ve, mueve ni crea apartados en proyectos ajenos", async () => {
    const p = await proyecto(clienteA, "Privado de A");
    const ap = await apartado(clienteA, p, "Apartado de A", 1);
    await apartado(clienteA, p, "Otro de A", 2);

    expect((await clienteB.from("apartados").select("id").eq("id", ap)).data).toEqual([]);
    await clienteB.rpc("mover_apartado", { apartado: ap, direccion: "bajar" });
    expect(await titulosEnOrden(clienteA, p)).toEqual(["Apartado de A", "Otro de A"]);

    const { error } = await clienteB.from("apartados").insert({ proyecto_id: p, titulo: "Intruso", posicion: 1 });
    expect(error?.code).toBe("23503");
  });
});
