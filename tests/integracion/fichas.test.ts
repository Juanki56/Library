import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/backend/repositories/tipos-db";
import {
  ERROR_ESTADO,
  ERROR_ISBN,
  ERROR_NO_EXISTE,
  cambiarPortada,
  crearLibro,
  eliminarLibro,
  obtenerLibro,
  type EntradaLibro,
} from "@/backend/services/libros";
import { ERROR_FECHA, ERROR_TIPO, crearRecurso, listarRecursos, obtenerRecurso, type EntradaRecurso } from "@/backend/services/recursos";
import { ERROR_IMAGEN_TIPO } from "@/backend/services/medios";
import { admin, borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";

// Tareas 2.2, 2.3 y 3.1 (libros-recursos-menu-inicio): fichas de libros y recursos y portadas.
let usuario: UsuarioPrueba, otro: UsuarioPrueba;
let cliente: SupabaseClient<Database>, clienteOtro: SupabaseClient<Database>;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const png = () => new File([PNG], "portada.png", { type: "image/png" });

beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  otro = await crearUsuario({ confirmado: true });
  cliente = await clienteDe(usuario);
  clienteOtro = await clienteDe(otro);
});

afterAll(async () => {
  const { data: carpetas } = await admin().storage.from("imagenes").list(usuario.id);
  for (const c of carpetas ?? []) {
    const { data: archivos } = await admin().storage.from("imagenes").list(`${usuario.id}/${c.name}`);
    const rutas = (archivos ?? []).map((a) => `${usuario.id}/${c.name}/${a.name}`);
    if (rutas.length) await admin().storage.from("imagenes").remove(rutas);
  }
  await borrarUsuario(usuario);
  await borrarUsuario(otro);
});

const libro = (cambios: Partial<EntradaLibro> = {}): EntradaLibro => ({
  titulo: "El capital",
  autores: "",
  anio: "",
  editorial: "",
  descripcion: "",
  isbn: "",
  estadoLectura: "",
  ...cambios,
});

const recurso = (cambios: Partial<EntradaRecurso> = {}): EntradaRecurso => ({
  titulo: "Recurso",
  url: "",
  autor: "",
  descripcion: "",
  tipo: "",
  fechaPublicacion: "",
  ...cambios,
});

async function existe(ruta: string) {
  const carpeta = ruta.slice(0, ruta.lastIndexOf("/"));
  const archivo = ruta.slice(ruta.lastIndexOf("/") + 1);
  const { data } = await admin().storage.from("imagenes").list(carpeta, { search: archivo });
  return (data ?? []).some((a) => a.name === archivo);
}

describe("libros (spec libros)", () => {
  it("guarda todos los campos, con el ISBN normalizado y el estado de lectura", async () => {
    const r = await crearLibro(
      cliente,
      libro({
        autores: "Karl Marx",
        descripcion: "Crítica de la economía política",
        editorial: "Siglo XXI",
        anio: "1867",
        isbn: "978-84-323-0291-6",
        estadoLectura: "leyendo",
      }),
    );
    if (!r.ok) throw new Error(r.error);
    expect(await obtenerLibro(cliente, r.valor)).toMatchObject({
      autores: "Karl Marx",
      descripcion: "Crítica de la economía política",
      editorial: "Siglo XXI",
      anio: 1867,
      isbn: "9788432302916",
      estadoLectura: "leyendo",
      portadaRuta: null,
      portadaUrl: null,
    });
  });

  it("rechaza un ISBN incorrecto y un estado desconocido; sin estado es válido", async () => {
    expect(await crearLibro(cliente, libro({ isbn: "978-84-323-0291-3" }))).toEqual({ ok: false, error: ERROR_ISBN });
    expect(await crearLibro(cliente, libro({ estadoLectura: "abandonado" }))).toEqual({ ok: false, error: ERROR_ESTADO });
    const r = await crearLibro(cliente, libro());
    if (!r.ok) throw new Error(r.error);
    expect((await obtenerLibro(cliente, r.valor))?.estadoLectura).toBeNull();
  });

  it("la base de datos rechaza un ISBN mal formado aunque se salte el servicio", async () => {
    const { error } = await cliente.from("libros").insert({ titulo: "X", isbn: "123" });
    expect(error).not.toBeNull();
  });

  it("la búsqueda encuentra el libro por su descripción", async () => {
    await crearLibro(cliente, libro({ titulo: "Grundrisse", descripcion: "Borradores de plusvalía relativa" }));
    const { data } = await cliente.rpc("buscar", { consulta: "borradores plusvalia" });
    expect((data ?? []).map((f) => f.titulo)).toContain("Grundrisse");
  });
});

describe("portada (requisito «Portada del libro»)", () => {
  it("sube, cambia a una dirección web y borra la anterior; quitar la deja sin portada", async () => {
    const r = await crearLibro(cliente, libro({ titulo: "Con portada" }));
    if (!r.ok) throw new Error(r.error);
    expect(await cambiarPortada(cliente, r.valor, { tipo: "archivo", archivo: png() })).toEqual({ ok: true, valor: undefined });
    const subida = (await obtenerLibro(cliente, r.valor))!.portadaRuta!;
    expect(subida.startsWith(`${usuario.id}/${r.valor}/`)).toBe(true);
    expect(await existe(subida)).toBe(true);

    // Otra subida reemplaza a la anterior.
    await cambiarPortada(cliente, r.valor, { tipo: "archivo", archivo: png() });
    const segunda = (await obtenerLibro(cliente, r.valor))!.portadaRuta!;
    expect(segunda).not.toBe(subida);
    expect(await existe(subida)).toBe(false);

    await cambiarPortada(cliente, r.valor, { tipo: "web", url: "https://ejemplo.com/portada.jpg" });
    expect(await obtenerLibro(cliente, r.valor)).toMatchObject({ portadaRuta: null, portadaUrl: "https://ejemplo.com/portada.jpg" });
    expect(await existe(segunda)).toBe(false);

    await cambiarPortada(cliente, r.valor, { tipo: "quitar" });
    expect(await obtenerLibro(cliente, r.valor)).toMatchObject({ portadaRuta: null, portadaUrl: null });
  });

  it("rechaza archivos que no son imágenes y direcciones no web sin cambiar la portada", async () => {
    const r = await crearLibro(cliente, libro({ titulo: "Rechazos" }));
    if (!r.ok) throw new Error(r.error);
    const falso = new File(["<svg/>"], "falsa.png", { type: "image/png" });
    expect(await cambiarPortada(cliente, r.valor, { tipo: "archivo", archivo: falso })).toEqual({ ok: false, error: ERROR_IMAGEN_TIPO });
    expect((await cambiarPortada(cliente, r.valor, { tipo: "web", url: "javascript:alert(1)" })).ok).toBe(false);
    expect(await obtenerLibro(cliente, r.valor)).toMatchObject({ portadaRuta: null, portadaUrl: null });
  });

  it("eliminar el libro borra su portada subida", async () => {
    const r = await crearLibro(cliente, libro({ titulo: "Se eliminará" }));
    if (!r.ok) throw new Error(r.error);
    await cambiarPortada(cliente, r.valor, { tipo: "archivo", archivo: png() });
    const ruta = (await obtenerLibro(cliente, r.valor))!.portadaRuta!;
    expect(await eliminarLibro(cliente, r.valor)).toEqual({ ok: true });
    expect(await existe(ruta)).toBe(false);
  });

  it("no cambia la portada de un libro ajeno", async () => {
    const r = await crearLibro(clienteOtro, libro({ titulo: "Ajeno" }));
    if (!r.ok) throw new Error(r.error);
    expect(await cambiarPortada(cliente, r.valor, { tipo: "web", url: "https://ejemplo.com/a.jpg" })).toEqual({
      ok: false,
      error: ERROR_NO_EXISTE,
    });
  });
});

describe("recursos (spec fuentes-recursos)", () => {
  it("el tipo es «otro» por defecto y se guardan tipo y fecha de publicación", async () => {
    const sinTipo = await crearRecurso(cliente, recurso({ titulo: "Sin tipo" }));
    if (!sinTipo.ok) throw new Error(sinTipo.error);
    expect((await obtenerRecurso(cliente, sinTipo.valor))?.tipo).toBe("otro");

    const podcast = await crearRecurso(cliente, recurso({ titulo: "Podcast", tipo: "podcast", fechaPublicacion: "1883-03-14" }));
    if (!podcast.ok) throw new Error(podcast.error);
    expect(await obtenerRecurso(cliente, podcast.valor)).toMatchObject({ tipo: "podcast", fecha_publicacion: "1883-03-14" });
  });

  it("rechaza tipos y fechas no válidos", async () => {
    expect(await crearRecurso(cliente, recurso({ tipo: "libro" }))).toEqual({ ok: false, error: ERROR_TIPO });
    expect(await crearRecurso(cliente, recurso({ fechaPublicacion: "2023-02-29" }))).toEqual({ ok: false, error: ERROR_FECHA });
  });

  it("filtra la lista por tipo", async () => {
    await crearRecurso(cliente, recurso({ titulo: "Un vídeo", tipo: "video" }));
    await crearRecurso(cliente, recurso({ titulo: "Un artículo", tipo: "articulo" }));
    const videos = await listarRecursos(cliente, "video");
    expect(videos.map((r) => r.titulo)).toEqual(["Un vídeo"]);
    expect((await listarRecursos(cliente)).length).toBeGreaterThan(1);
  });
});
