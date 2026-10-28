import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { notasParaReferencia, notasQueMencionan, titulosReferenciados } from "@/backend/services/menciones";
import { guardarConVersion } from "@/backend/services/notas";
import { admin, borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tareas 1.2 y 2.2 (editor-fase2-referencias): menciones mantenidas por la base de datos (design D4).
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

const ref = (id: string) => ({ type: "referencia", attrs: { tipo: "nota", id } });
const conReferencias = (...ids: string[]) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Ver " }, ...ids.map(ref)] }],
});

async function nota(c: SupabaseClient<Database>, titulo: string, contenido?: Json) {
  const { data, error } = await c
    .from("notas")
    .insert(contenido ? { titulo, contenido } : { titulo })
    .select("id, actualizado_en")
    .single();
  if (error) throw error;
  return data;
}

async function destinosDe(origen: string) {
  const { data } = await cliente.from("referencias_nota").select("destino_id").eq("origen_id", origen);
  return (data ?? []).map((r) => r.destino_id).sort();
}

describe("tabla de menciones (spec editor-notas: «Notas que la mencionan»)", () => {
  it("guardar una nota con referencias crea una fila por nota referida, aunque se repita", async () => {
    const manifiesto = await nota(cliente, "El Manifiesto comunista");
    const capital = await nota(cliente, "El capital");
    const lucha = await nota(cliente, "Lucha de clases");
    const r = await guardarConVersion(
      cliente,
      lucha.id,
      "Lucha de clases",
      JSON.stringify(conReferencias(manifiesto.id, manifiesto.id, capital.id)),
      lucha.actualizado_en,
    );
    expect(r.tipo).toBe("ok");
    expect(await destinosDe(lucha.id)).toEqual([manifiesto.id, capital.id].sort());
    expect(await notasQueMencionan(cliente, manifiesto.id)).toEqual([{ id: lucha.id, titulo: "Lucha de clases" }]);
  });

  it("quitar la referencia y guardar la quita de las menciones (escenario «Quitar la referencia»)", async () => {
    const destino = await nota(cliente, "Destino");
    const origen = await nota(cliente, "Origen", conReferencias(destino.id));
    expect(await destinosDe(origen.id)).toEqual([destino.id]);

    const { data } = await cliente.from("notas").select("actualizado_en").eq("id", origen.id).single();
    await guardarConVersion(cliente, origen.id, "Origen", JSON.stringify(conReferencias()), data!.actualizado_en);
    expect(await destinosDe(origen.id)).toEqual([]);
    expect(await notasQueMencionan(cliente, destino.id)).toEqual([]);
  });

  it("una nota no se menciona a sí misma", async () => {
    const sola = await nota(cliente, "Sola");
    await cliente.from("notas").update({ contenido: conReferencias(sola.id) }).eq("id", sola.id);
    expect(await destinosDe(sola.id)).toEqual([]);
  });

  it("ignora notas de otro usuario y no expone su título (escenario «Notas de otro usuario»)", async () => {
    const ajena = await nota(clienteOtro, "Nota privada de otro");
    const mia = await nota(cliente, "Mía", conReferencias(ajena.id));
    expect(await destinosDe(mia.id)).toEqual([]);
    expect(await titulosReferenciados(cliente, conReferencias(ajena.id))).toEqual({});
    const { data } = await admin().from("referencias_nota").select("origen_id").eq("destino_id", ajena.id);
    expect(data).toEqual([]);
  });

  it("al eliminar la nota referida desaparece la mención y la otra nota no cambia", async () => {
    const destino = await nota(cliente, "Se eliminará");
    const origen = await nota(cliente, "Sobrevive", conReferencias(destino.id));
    await cliente.from("notas").delete().eq("id", destino.id);
    expect(await destinosDe(origen.id)).toEqual([]);
    const { data } = await cliente.from("notas").select("contenido").eq("id", origen.id).single();
    expect(JSON.stringify(data!.contenido)).toContain(destino.id);
    expect(await titulosReferenciados(cliente, conReferencias(destino.id))).toEqual({});
  });

  it("el usuario no puede escribir la tabla directamente ni leer menciones ajenas", async () => {
    const a = await nota(cliente, "A");
    const b = await nota(cliente, "B", conReferencias(a.id));
    const insertar = await cliente
      .from("referencias_nota")
      .insert({ origen_id: a.id, destino_id: b.id, usuario_id: usuario.id });
    expect(insertar.error).not.toBeNull();
    await cliente.from("referencias_nota").delete().eq("origen_id", b.id);
    expect(await destinosDe(b.id)).toEqual([a.id]);

    const { data } = await clienteOtro.from("referencias_nota").select("origen_id").eq("origen_id", b.id);
    expect(data).toEqual([]);
  });

  it("devuelve los títulos actuales y la lista para el cuadro, sin la nota abierta", async () => {
    const referida = await nota(cliente, "Título viejo");
    await cliente.from("notas").update({ titulo: "Título nuevo" }).eq("id", referida.id);
    expect(await titulosReferenciados(cliente, conReferencias(referida.id))).toEqual({ [referida.id]: "Título nuevo" });

    const lista = await notasParaReferencia(cliente, referida.id);
    expect(lista.some((n) => n.id === referida.id)).toBe(false);
    expect(lista.length).toBeGreaterThan(0);
    expect(lista.every((n) => typeof n.titulo === "string")).toBe(true);
  });
});
