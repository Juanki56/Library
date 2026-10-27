import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import { guardarConVersion, obtenerNota, ERROR_NO_EXISTE, ERROR_TITULO } from "@/backend/services/notas";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tarea 2.1 (editor-fase1-escritura): guardar sin sobrescribir cambios más recientes (design D7).
let usuario: UsuarioPrueba, otro: UsuarioPrueba;
let cliente: SupabaseClient<Database>, clienteOtro: SupabaseClient<Database>;

beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  otro = await crearUsuario({ confirmado: true });
  cliente = await clienteDe(usuario);
  clienteOtro = await clienteDe(otro);
});

afterAll(async () => {
  await borrarUsuario(usuario);
  await borrarUsuario(otro);
});

const doc = (texto: string) =>
  JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: texto }] }] });

async function notaNueva(titulo: string) {
  const { data } = await cliente.from("notas").insert({ titulo }).select("id, actualizado_en").single();
  return { id: data!.id, version: data!.actualizado_en };
}

describe("guardarConVersion", () => {
  it("guarda con la versión correcta y devuelve una versión nueva", async () => {
    const nota = await notaNueva("Versionada");
    const r = await guardarConVersion(cliente, nota.id, "Versionada", doc("primer texto"), nota.version);
    expect(r.tipo).toBe("ok");
    const nueva = (r as { version: string }).version;
    expect(nueva).not.toBe(nota.version);
    expect((await obtenerNota(cliente, nota.id))?.actualizadoEn).toBe(nueva);

    // Guardados seguidos encadenando la versión devuelta.
    const r2 = await guardarConVersion(cliente, nota.id, "Versionada", doc("segundo texto"), nueva);
    expect(r2.tipo).toBe("ok");
  });

  it("con una versión antigua devuelve conflicto y no modifica la nota (escenario «Nota editada en otra pestaña»)", async () => {
    const nota = await notaNueva("Dos pestañas");
    // Pestaña 2 guarda primero.
    const r2 = await guardarConVersion(cliente, nota.id, "Dos pestañas", doc("versión de la pestaña 2"), nota.version);
    expect(r2.tipo).toBe("ok");
    // Pestaña 1 intenta guardar con la versión que tenía abierta.
    const r1 = await guardarConVersion(cliente, nota.id, "Dos pestañas", doc("versión de la pestaña 1"), nota.version);
    expect(r1).toEqual({ tipo: "conflicto", version: (r2 as { version: string }).version });

    const guardada = await obtenerNota(cliente, nota.id);
    expect(JSON.stringify(guardada?.contenido)).toContain("versión de la pestaña 2");

    // «Guardar mis cambios encima»: reenviar con la versión actual.
    const encima = await guardarConVersion(
      cliente,
      nota.id,
      "Dos pestañas",
      doc("versión de la pestaña 1"),
      (r1 as { version: string }).version,
    );
    expect(encima.tipo).toBe("ok");
    expect(JSON.stringify((await obtenerNota(cliente, nota.id))?.contenido)).toContain("versión de la pestaña 1");
  });

  it("un título vacío es un error de validación que no se reintenta", async () => {
    const nota = await notaNueva("Con título");
    expect(await guardarConVersion(cliente, nota.id, "  ", doc("x"), nota.version)).toEqual({
      tipo: "error",
      error: ERROR_TITULO,
      validacion: true,
    });
  });

  it("otro usuario no puede guardar: la nota no existe para él", async () => {
    const nota = await notaNueva("Privada");
    expect(await guardarConVersion(clienteOtro, nota.id, "Intruso", doc("x"), nota.version)).toEqual({
      tipo: "error",
      error: ERROR_NO_EXISTE,
      validacion: true,
    });
    expect((await obtenerNota(cliente, nota.id))?.titulo).toBe("Privada");
  });
});
