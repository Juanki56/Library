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

// Tarea 3.1: cada entidad es privada de su usuario (spec cuentas-usuario) y solo guarda
// fechas de creación y modificación como metadatos (spec notas).
type Tabla = "proyectos" | "notas" | "libros" | "recursos";
const ENTIDADES: { tabla: Tabla; campo: "nombre" | "titulo" }[] = [
  { tabla: "proyectos", campo: "nombre" },
  { tabla: "notas", campo: "titulo" },
  { tabla: "libros", campo: "titulo" },
  { tabla: "recursos", campo: "titulo" },
];

let a: UsuarioPrueba, b: UsuarioPrueba;
let clienteA: SupabaseClient<Database>, clienteB: SupabaseClient<Database>;

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

describe.each(ENTIDADES)("$tabla", ({ tabla, campo }) => {
  const de = (c: SupabaseClient<Database>) => sinTipos(c).from(tabla);

  async function crear(cliente: SupabaseClient<Database>, valor: string) {
    const { data, error } = await de(cliente).insert(<FilaLibre>{ [campo]: valor }).select().single();
    expect(error).toBeNull();
    return data as { id: string; usuario_id: string; creado_en: string; actualizado_en: string };
  }

  it("asigna el elemento a quien lo crea", async () => {
    const fila = await crear(clienteA, "Comunismo");
    expect(fila.usuario_id).toBe(a.id);
  });

  it("otro usuario no lo ve, no lo modifica ni lo borra", async () => {
    const fila = await crear(clienteA, "Historia social");

    const lectura = await de(clienteB).select("id").eq("id", fila.id);
    expect(lectura.data).toEqual([]);

    const cambio = await de(clienteB).update(<FilaLibre>{ [campo]: "Intruso" }).eq("id", fila.id).select();
    expect(cambio.data).toEqual([]);

    const borrado = await de(clienteB).delete().eq("id", fila.id).select();
    expect(borrado.data).toEqual([]);

    const original = await de(clienteA).select(campo).eq("id", fila.id).single();
    expect((original.data as Record<string, string>)[campo]).toBe("Historia social");
  });

  it("no permite crear elementos a nombre de otro usuario", async () => {
    const { error } = await de(clienteB).insert(<FilaLibre>{ [campo]: "Suplantado", usuario_id: a.id });
    expect(error?.code).toBe("42501");
  });

  it("rechaza un título vacío", async () => {
    const { error } = await de(clienteA).insert(<FilaLibre>{ [campo]: "   " });
    expect(error?.code).toBe("23514");
  });

  it("actualiza la fecha de modificación al editar y conserva la de creación", async () => {
    const fila = await crear(clienteA, "Antes");
    await new Promise((r) => setTimeout(r, 50));
    const { data } = await de(clienteA).update(<FilaLibre>{ [campo]: "Después" }).eq("id", fila.id).select().single();
    const editada = data as typeof fila;
    expect(editada.creado_en).toBe(fila.creado_en);
    expect(new Date(editada.actualizado_en).getTime()).toBeGreaterThan(
      new Date(fila.actualizado_en).getTime(),
    );
  });

  it("no tiene columnas que midan tiempo de estudio (spec exclusiones-alcance)", async () => {
    const fila = await crear(clienteA, "Columnas");
    const prohibidas = Object.keys(fila).filter((c) =>
      /duraci|minut|segund|sesion|racha|cronom|tiempo/i.test(c),
    );
    expect(prohibidas).toEqual([]);
  });
});
