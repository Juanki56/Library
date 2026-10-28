import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import {
  ERROR_NOTA,
  ESPERA_LIMPIEZA_MS,
  eliminarNota,
  limpiarNoUsadas,
  subirImagen,
  urlImagen,
} from "@/backend/services/imagenes";
import { ERROR_IMAGEN_GRANDE, ERROR_IMAGEN_TIPO } from "@/backend/services/medios";
import type { NodoContenido } from "@/backend/services/contenidoNota";
import { admin, borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tareas 1.2 y 2.3 (editor-fase3-imagenes-videos): almacenamiento privado y servicio de imágenes.
let usuario: UsuarioPrueba, otro: UsuarioPrueba;
let cliente: SupabaseClient<Database>, clienteOtro: SupabaseClient<Database>;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const png = () => new File([PNG], "punto.png", { type: "image/png" });

beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  otro = await crearUsuario({ confirmado: true });
  cliente = await clienteDe(usuario);
  clienteOtro = await clienteDe(otro);
});

afterAll(async () => {
  for (const u of [usuario, otro]) {
    const { data } = await admin().storage.from("imagenes").list(u.id);
    for (const carpeta of data ?? []) {
      const { data: archivos } = await admin().storage.from("imagenes").list(`${u.id}/${carpeta.name}`);
      const rutas = (archivos ?? []).map((a) => `${u.id}/${carpeta.name}/${a.name}`);
      if (rutas.length) await admin().storage.from("imagenes").remove(rutas);
    }
    await borrarUsuario(u);
  }
});

async function nota(c: SupabaseClient<Database>, titulo = "Con imágenes") {
  const { data, error } = await c.from("notas").insert({ titulo }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function existe(ruta: string) {
  const [carpeta, archivo] = [ruta.slice(0, ruta.lastIndexOf("/")), ruta.slice(ruta.lastIndexOf("/") + 1)];
  const { data } = await admin().storage.from("imagenes").list(carpeta, { search: archivo });
  return (data ?? []).some((a) => a.name === archivo);
}

const conImagenes = (...rutas: string[]): NodoContenido => ({
  type: "doc",
  content: rutas.map((ruta) => ({ type: "imagen", attrs: { origen: "archivo", ruta, alt: "", pie: "" } })),
});

describe("almacenamiento privado (spec editor-notas: «Imagen privada»)", () => {
  it("cada usuario solo puede subir, leer y borrar en su carpeta", async () => {
    const id = await nota(cliente);
    const subida = await subirImagen(cliente, id, png());
    expect(subida.ok).toBe(true);
    if (!subida.ok) return;
    expect(subida.ruta.startsWith(`${usuario.id}/${id}/`)).toBe(true);

    // Otro usuario: ni descarga, ni URL firmada, ni borrado.
    expect((await clienteOtro.storage.from("imagenes").download(subida.ruta)).data).toBeNull();
    expect(await urlImagen(clienteOtro, subida.ruta)).toBeNull();
    await clienteOtro.storage.from("imagenes").remove([subida.ruta]);
    expect(await existe(subida.ruta)).toBe(true);

    // Ni puede escribir en la carpeta ajena.
    const intruso = await clienteOtro.storage
      .from("imagenes")
      .upload(`${usuario.id}/${id}/${randomUUID()}.png`, PNG, { contentType: "image/png" });
    expect(intruso.error).not.toBeNull();

    // El propietario sí obtiene la dirección firmada.
    expect(await urlImagen(cliente, subida.ruta)).toMatch(/^https:\/\//);
  });

  it("el almacenamiento rechaza SVG aunque se suba directamente", async () => {
    const id = await nota(cliente);
    const svg = await cliente.storage
      .from("imagenes")
      .upload(`${usuario.id}/${id}/${randomUUID()}.png`, "<svg/>", { contentType: "image/svg+xml" });
    expect(svg.error).not.toBeNull();
  });

  it("la tabla de imágenes tiene RLS: otro usuario no ve ni registra imágenes ajenas", async () => {
    const id = await nota(cliente);
    const subida = await subirImagen(cliente, id, png());
    if (!subida.ok) throw new Error(subida.error);
    expect((await clienteOtro.from("imagenes_nota").select("ruta").eq("nota_id", id)).data).toEqual([]);
    const ajena = await clienteOtro
      .from("imagenes_nota")
      .insert({ ruta: `${usuario.id}/${id}/${randomUUID()}.png`, nota_id: id });
    expect(ajena.error).not.toBeNull();
  });
});

describe("subida (spec editor-notas: «Imágenes subidas»)", () => {
  it("rechaza archivos que no son imágenes aunque se llamen .png", async () => {
    const id = await nota(cliente);
    const falso = new File(["<svg onload='alert(1)'/>"], "foto.png", { type: "image/png" });
    expect(await subirImagen(cliente, id, falso)).toEqual({ ok: false, error: ERROR_IMAGEN_TIPO });
  });

  it("rechaza imágenes de más de 5 MB", async () => {
    const id = await nota(cliente);
    const grande = new File([PNG, new Uint8Array(5 * 1024 * 1024)], "grande.png", { type: "image/png" });
    expect(await subirImagen(cliente, id, grande)).toEqual({ ok: false, error: ERROR_IMAGEN_GRANDE });
  });

  it("no sube a una nota ajena", async () => {
    const ajena = await nota(clienteOtro);
    expect(await subirImagen(cliente, ajena, png())).toEqual({ ok: false, error: ERROR_NOTA });
  });
});

describe("limpieza (spec editor-notas: «Limpieza de imágenes subidas»)", () => {
  it("borra las imágenes que ya no están en el contenido y conserva las que sí", async () => {
    const id = await nota(cliente);
    const [usada, quitada] = await Promise.all([subirImagen(cliente, id, png()), subirImagen(cliente, id, png())]);
    if (!usada.ok || !quitada.ok) throw new Error("subida");

    // Recién subidas: aún no se limpian (el guardado automático puede estar en curso).
    await limpiarNoUsadas(cliente, id, conImagenes(usada.ruta));
    expect(await existe(quitada.ruta)).toBe(true);

    await limpiarNoUsadas(cliente, id, conImagenes(usada.ruta), Date.now() + ESPERA_LIMPIEZA_MS + 60_000);
    expect(await existe(quitada.ruta)).toBe(false);
    expect(await existe(usada.ruta)).toBe(true);
    const { data } = await cliente.from("imagenes_nota").select("ruta").eq("nota_id", id);
    expect(data).toEqual([{ ruta: usada.ruta }]);
  });

  it("eliminar la nota borra sus imágenes", async () => {
    const id = await nota(cliente);
    const subida = await subirImagen(cliente, id, png());
    if (!subida.ok) throw new Error(subida.error);
    await cliente
      .from("notas")
      .update({ contenido: conImagenes(subida.ruta) as unknown as Json })
      .eq("id", id);

    expect(await eliminarNota(cliente, id)).toEqual({ ok: true });
    expect(await existe(subida.ruta)).toBe(false);
  });
});
