import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 1.3: restricciones de citas, etiquetas y glosario (design D1–D4).
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

describe("etiquetas", () => {
  it("son únicas sin distinguir mayúsculas, tildes ni espacios", async () => {
    expect((await clienteA.from("etiquetas").insert({ nombre: "Filosofía" })).error).toBeNull();
    for (const variante of ["filosofia", "  FILOSOFÍA ", "Filosofia"]) {
      expect((await clienteA.from("etiquetas").insert({ nombre: variante })).error?.code).toBe("23505");
    }
    // Otro usuario sí puede tener su propia «Filosofía».
    expect((await clienteB.from("etiquetas").insert({ nombre: "Filosofía" })).error).toBeNull();
  });

  it("al borrar una etiqueta se quitan sus asignaciones pero no los elementos", async () => {
    const { data: etiqueta } = await clienteA.from("etiquetas").insert({ nombre: "Temporal" }).select("id").single();
    const { data: nota } = await clienteA.from("notas").insert({ titulo: "Nota etiquetada" }).select("id").single();
    await clienteA.from("etiqueta_nota").insert({ etiqueta_id: etiqueta!.id, nota_id: nota!.id });

    await clienteA.from("etiquetas").delete().eq("id", etiqueta!.id);

    expect((await clienteA.from("etiqueta_nota").select("*").eq("nota_id", nota!.id)).data).toEqual([]);
    expect((await clienteA.from("notas").select("id").eq("id", nota!.id)).data).toHaveLength(1);
  });

  it("no se puede asignar una etiqueta ajena", async () => {
    const { data: ajena } = await clienteA.from("etiquetas").insert({ nombre: "De A" }).select("id").single();
    const { data: nota } = await clienteB.from("notas").insert({ titulo: "Nota de B" }).select("id").single();
    const { error } = await clienteB.from("etiqueta_nota").insert({ etiqueta_id: ajena!.id, nota_id: nota!.id });
    expect(error?.code).toBe("23503");
  });
});

describe("glosario", () => {
  it("el término es único sin distinguir tildes y la definición es obligatoria", async () => {
    expect((await clienteA.from("glosario").insert({ termino: "Plusvalía", definicion: "Valor excedente." })).error).toBeNull();
    expect((await clienteA.from("glosario").insert({ termino: "plusvalia", definicion: "Otra." })).error?.code).toBe("23505");
    expect((await clienteA.from("glosario").insert({ termino: "Dialéctica", definicion: "  " })).error?.code).toBe("23514");
  });
});

describe("citas", () => {
  it("tipo por defecto «cita» y texto obligatorio", async () => {
    const { data } = await clienteA.from("citas").insert({ texto: "Sapere aude." }).select("tipo").single();
    expect(data!.tipo).toBe("cita");
    expect((await clienteA.from("citas").insert({ texto: " " })).error?.code).toBe("23514");
    expect((await clienteA.from("citas").insert({ texto: "x", tipo: "otro" })).error?.code).toBe("23514");
  });

  it("no puede enlazar a la vez con un libro y un recurso", async () => {
    const { data: libro } = await clienteA.from("libros").insert({ titulo: "Libro" }).select("id").single();
    const { data: recurso } = await clienteA.from("recursos").insert({ titulo: "Recurso" }).select("id").single();
    const { error } = await clienteA
      .from("citas")
      .insert({ texto: "Doble", libro_id: libro!.id, recurso_id: recurso!.id });
    expect(error?.code).toBe("23514");
  });

  it("no puede enlazar con un libro de otro usuario", async () => {
    const { data: libroA } = await clienteA.from("libros").insert({ titulo: "Libro de A" }).select("id").single();
    const { error } = await clienteB.from("citas").insert({ texto: "Intento", libro_id: libroA!.id });
    expect(error?.code).toBe("23503");
  });

  it("al borrar el libro, la cita sigue existiendo sin enlace", async () => {
    const { data: libro } = await clienteA.from("libros").insert({ titulo: "Tesis sobre Feuerbach" }).select("id").single();
    const { data: cita } = await clienteA
      .from("citas")
      .insert({ texto: "Los filósofos no han hecho más que interpretar el mundo.", libro_id: libro!.id })
      .select("id")
      .single();
    await clienteA.from("libros").delete().eq("id", libro!.id);
    const { data } = await clienteA.from("citas").select("id, libro_id").eq("id", cita!.id).single();
    expect(data).toEqual({ id: cita!.id, libro_id: null });
  });

  it("otro usuario no ve las citas", async () => {
    await clienteA.from("citas").insert({ texto: "Cita privada de A" });
    const { data } = await clienteB.from("citas").select("texto").eq("texto", "Cita privada de A");
    expect(data).toEqual([]);
  });
});
