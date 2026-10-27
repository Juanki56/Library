import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import { eliminar, resumenEliminacion, textoAviso, ERROR_NO_EXISTE } from "@/backend/services/eliminacion";
import {
  desvincular,
  vincular,
  ERROR_NO_ENCONTRADO,
  ERROR_RELACION_NO_PERMITIDA,
  type Referencia,
} from "@/backend/services/vinculos";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tareas 3.3 y 3.4: reglas de la spec relaciones en backend/services.
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

async function nota(c: Cliente, titulo: string): Promise<Referencia> {
  const { data } = await c.from("notas").insert({ titulo }).select("id").single();
  return { tipo: "nota", id: data!.id };
}
async function proyecto(c: Cliente, nombre: string): Promise<Referencia> {
  const { data } = await c.from("proyectos").insert({ nombre }).select("id").single();
  return { tipo: "proyecto", id: data!.id };
}
async function libro(c: Cliente, titulo: string): Promise<Referencia> {
  const { data } = await c.from("libros").insert({ titulo }).select("id").single();
  return { tipo: "libro", id: data!.id };
}

describe("vincular y desvincular (tarea 3.3)", () => {
  it("vincula en cualquier orden y un vínculo repetido no da error ni se duplica", async () => {
    const n = await nota(clienteA, "La lucha de clases");
    const p = await proyecto(clienteA, "Historia social");

    expect(await vincular(clienteA, n, p)).toEqual({ ok: true });
    expect(await vincular(clienteA, p, n)).toEqual({ ok: true });

    const { count } = await clienteA
      .from("nota_proyecto")
      .select("*", { count: "exact", head: true })
      .eq("nota_id", n.id);
    expect(count).toBe(1);
  });

  it("rechaza relaciones que las specs no contemplan", async () => {
    const n1 = await nota(clienteA, "Una");
    const n2 = await nota(clienteA, "Otra");
    expect(await vincular(clienteA, n1, n2)).toEqual({ ok: false, error: ERROR_RELACION_NO_PERMITIDA });
  });

  it("no vincula con elementos de otro usuario ni revela que existen", async () => {
    const ajena = await nota(clienteA, "Nota de A");
    const propio = await proyecto(clienteB, "Proyecto de B");
    expect(await vincular(clienteB, ajena, propio)).toEqual({ ok: false, error: ERROR_NO_ENCONTRADO });
  });

  it("trata un identificador mal formado como no encontrado", async () => {
    const p = await proyecto(clienteA, "Comunismo");
    expect(await vincular(clienteA, { tipo: "nota", id: "no-es-un-id" }, p)).toEqual({
      ok: false,
      error: ERROR_NO_ENCONTRADO,
    });
  });

  it("desvincular quita solo la relación y es seguro repetirlo", async () => {
    const n = await nota(clienteA, "Plusvalía");
    const l = await libro(clienteA, "El capital");
    await vincular(clienteA, n, l);

    expect(await desvincular(clienteA, l, n)).toEqual({ ok: true });
    expect(await desvincular(clienteA, l, n)).toEqual({ ok: true });

    const vinculos = await clienteA.from("nota_libro").select("*").eq("nota_id", n.id);
    expect(vinculos.data).toEqual([]);
    const notas = await clienteA.from("notas").select("id").eq("id", n.id);
    const libros = await clienteA.from("libros").select("id").eq("id", l.id);
    expect(notas.data).toHaveLength(1);
    expect(libros.data).toHaveLength(1);
  });
});

describe("eliminar con aviso (tarea 3.4)", () => {
  it("cuenta los vínculos por tipo antes de eliminar y conserva los elementos relacionados", async () => {
    const comunismo = await proyecto(clienteA, "Comunismo");
    const n1 = await nota(clienteA, "La lucha de clases");
    const n2 = await nota(clienteA, "Materialismo histórico");
    const manifiesto = await libro(clienteA, "El manifiesto comunista");
    await vincular(clienteA, comunismo, n1);
    await vincular(clienteA, comunismo, n2);
    await vincular(clienteA, comunismo, manifiesto);
    await vincular(clienteA, n1, manifiesto);

    const resumen = await resumenEliminacion(clienteA, comunismo);
    expect(resumen).toEqual({ total: 3, porTipo: { nota: 2, libro: 1 } });
    expect(textoAviso(resumen!)).toBe(
      "Se quitarán 3 vínculos con 2 notas y 1 libro. Esos elementos no se borrarán.",
    );

    expect(await eliminar(clienteA, comunismo)).toEqual({ ok: true });

    // Las notas y el libro siguen, y el vínculo entre la nota y el libro también.
    const notas = await clienteA.from("notas").select("id").in("id", [n1.id, n2.id]);
    expect(notas.data).toHaveLength(2);
    expect(await resumenEliminacion(clienteA, manifiesto)).toEqual({ total: 1, porTipo: { nota: 1 }, citas: 0 });
  });

  it("un elemento sin vínculos tiene resumen vacío", async () => {
    const solo = await libro(clienteA, "Libro suelto");
    expect(await resumenEliminacion(clienteA, solo)).toEqual({ total: 0, porTipo: {}, citas: 0 });
  });

  it("otro usuario no puede ver el resumen ni eliminar el elemento", async () => {
    const p = await proyecto(clienteA, "Privado");
    expect(await resumenEliminacion(clienteB, p)).toBeNull();
    expect(await eliminar(clienteB, p)).toEqual({ ok: false, error: ERROR_NO_EXISTE });
    expect(await resumenEliminacion(clienteA, p)).not.toBeNull();
  });

  it("eliminar dos veces informa de que ya no existe", async () => {
    const n = await nota(clienteA, "Temporal");
    expect(await eliminar(clienteA, n)).toEqual({ ok: true });
    expect(await eliminar(clienteA, n)).toEqual({ ok: false, error: ERROR_NO_EXISTE });
  });
});

describe("elementos relacionados (spec relaciones: «Elementos relacionados visibles»)", () => {
  it("agrupa por tipo, sin duplicados, y ofrece como candidatos solo los no vinculados", async () => {
    const { obtenerRelacionados } = await import("@/backend/services/relacionados");
    const n = await nota(clienteA, "La lucha de clases (relacionados)");
    const p1 = await proyecto(clienteA, "Comunismo (relacionados)");
    const p2 = await proyecto(clienteA, "Historia social (relacionados)");
    const l = await libro(clienteA, "El manifiesto comunista (relacionados)");
    await vincular(clienteA, n, p1);
    await vincular(clienteA, n, p2);
    await vincular(clienteA, n, l);

    const grupos = await obtenerRelacionados(clienteA, n);
    const porTipo = Object.fromEntries(grupos.map((g) => [g.tipo, g]));
    expect(Object.keys(porTipo).sort()).toEqual(["libro", "proyecto", "recurso"]);
    expect(porTipo.proyecto.elementos.map((e) => e.nombre)).toEqual([
      "Comunismo (relacionados)",
      "Historia social (relacionados)",
    ]);
    expect(porTipo.libro.elementos).toEqual([{ id: l.id, nombre: "El manifiesto comunista (relacionados)" }]);
    expect(porTipo.recurso.elementos).toEqual([]);
    const idsCandidatos = porTipo.proyecto.candidatos.map((c) => c.id);
    expect(idsCandidatos).not.toContain(p1.id);
    expect(idsCandidatos).not.toContain(p2.id);
  });

  it("no muestra elementos de otro usuario ni como relacionados ni como candidatos", async () => {
    const { obtenerRelacionados } = await import("@/backend/services/relacionados");
    await proyecto(clienteA, "Proyecto secreto de A");
    const propia = await nota(clienteB, "Nota de B");
    const grupos = await obtenerRelacionados(clienteB, propia);
    const nombres = grupos.flatMap((g) => [...g.elementos, ...g.candidatos].map((e) => e.nombre));
    expect(nombres).not.toContain("Proyecto secreto de A");
  });
});
