import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import {
  asignar,
  contarContenido,
  crear,
  editar,
  eliminar,
  mover,
  organizacion,
  quitar,
  ERROR_TITULO,
} from "@/backend/services/apartados";
import { desvincular } from "@/backend/services/vinculos";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 2.1 (apartados-proyectos): servicio de apartados con el ejemplo «Estudiar filosofía».
type Cliente = SupabaseClient<Database>;
let usuario: UsuarioPrueba;
let cliente: Cliente;

beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  cliente = await clienteDe(usuario);
});

afterAll(async () => {
  await borrarUsuario(usuario);
});

async function insertar(tabla: "proyectos" | "notas" | "libros", campo: string, valor: string) {
  const { data } = await (cliente.from(tabla) as ReturnType<Cliente["from"]>)
    .insert({ [campo]: valor } as never)
    .select("id")
    .single();
  return (data as { id: string }).id;
}

const crearOk = async (proyecto: string, titulo: string, descripcion = "") => {
  const r = await crear(cliente, proyecto, titulo, descripcion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};

describe("ejemplo «Estudiar filosofía»", () => {
  it("organiza el proyecto en apartados numerados y «Sin apartado»", async () => {
    const proyecto = await insertar("proyectos", "nombre", "Estudiar filosofía");
    const antigua = await crearOk(proyecto, "Filosofía antigua", "Platón y Aristóteles");
    const moderna = await crearOk(proyecto, "Filosofía moderna");
    const etica = await crearOk(proyecto, "Ética");

    const platon = await insertar("notas", "titulo", "Platón: la teoría de las ideas");
    const kant = await insertar("notas", "titulo", "Kant y el deber");
    const libroSuelto = await insertar("libros", "titulo", "Historia de la filosofía");
    const eticaLibro = await insertar("libros", "titulo", "Ética a Nicómaco");

    // Una nota en un apartado; otra en dos; un libro que no estaba en el proyecto.
    expect((await asignar(cliente, proyecto, antigua, "nota", platon)).ok).toBe(true);
    expect((await asignar(cliente, proyecto, moderna, "nota", kant)).ok).toBe(true);
    expect((await asignar(cliente, proyecto, etica, "nota", kant)).ok).toBe(true);
    expect((await asignar(cliente, proyecto, etica, "libro", eticaLibro)).ok).toBe(true);
    // Asignar dos veces no da error ni duplica.
    expect((await asignar(cliente, proyecto, etica, "nota", kant)).ok).toBe(true);
    // Un libro del proyecto sin apartado.
    await cliente.from("libro_proyecto").insert({ libro_id: libroSuelto, proyecto_id: proyecto });

    const org = await organizacion(cliente, proyecto);
    expect(org.apartados.map((a) => `${a.numero}. ${a.titulo}`)).toEqual([
      "1. Filosofía antigua",
      "2. Filosofía moderna",
      "3. Ética",
    ]);
    expect(org.apartados[0].descripcion).toBe("Platón y Aristóteles");
    expect(org.apartados[0].contenido.map((e) => e.nombre)).toEqual(["Platón: la teoría de las ideas"]);
    expect(org.apartados[2].contenido.map((e) => `${e.tipo}:${e.nombre}`)).toEqual([
      "nota:Kant y el deber",
      "libro:Ética a Nicómaco",
    ]);
    expect(org.sinApartado.map((e) => e.nombre)).toEqual(["Historia de la filosofía"]);

    // Candidatos de «Ética»: no ofrece lo que ya está en él.
    expect(org.apartados[2].candidatos.nota.map((e) => e.id)).not.toContain(kant);
    expect(org.apartados[2].candidatos.nota.map((e) => e.id)).toContain(platon);
    expect(org.apartados[2].candidatos.libro.map((e) => e.id)).toContain(libroSuelto);

    // Subir «Ética».
    await mover(cliente, etica, "subir");
    const reordenado = await organizacion(cliente, proyecto);
    expect(reordenado.apartados.map((a) => a.titulo)).toEqual(["Filosofía antigua", "Ética", "Filosofía moderna"]);

    // Quitar a Platón de su único apartado lo deja en «Sin apartado».
    await quitar(cliente, antigua, "nota", platon);
    const trasQuitar = await organizacion(cliente, proyecto);
    expect(trasQuitar.sinApartado.map((e) => e.nombre)).toContain("Platón: la teoría de las ideas");

    // Eliminar «Ética» con su aviso: Kant sigue en «Filosofía moderna», el libro pasa a «Sin apartado».
    expect(await contarContenido(cliente, etica)).toBe(2);
    expect((await eliminar(cliente, etica)).ok).toBe(true);
    const trasEliminar = await organizacion(cliente, proyecto);
    expect(trasEliminar.apartados.map((a) => `${a.numero}. ${a.titulo}`)).toEqual([
      "1. Filosofía antigua",
      "2. Filosofía moderna",
    ]);
    expect(trasEliminar.apartados[1].contenido.map((e) => e.nombre)).toEqual(["Kant y el deber"]);
    expect(trasEliminar.sinApartado.map((e) => e.nombre)).toContain("Ética a Nicómaco");

    // Desvincular a Kant del proyecto lo saca de sus apartados.
    await desvincular(cliente, { tipo: "proyecto", id: proyecto }, { tipo: "nota", id: kant });
    const trasDesvincular = await organizacion(cliente, proyecto);
    expect(trasDesvincular.apartados[1].contenido).toEqual([]);
  });
});

describe("validación", () => {
  it("rechaza un apartado sin título y edita título y descripción", async () => {
    const proyecto = await insertar("proyectos", "nombre", "Proyecto de validación");
    expect(await crear(cliente, proyecto, "   ", "")).toEqual({ ok: false, error: ERROR_TITULO });
    const id = await crearOk(proyecto, "Provisional");
    expect((await editar(cliente, id, "Definitivo", "Con descripción")).ok).toBe(true);
    const org = await organizacion(cliente, proyecto);
    expect(org.apartados[0]).toMatchObject({ titulo: "Definitivo", descripcion: "Con descripción" });
  });
});
