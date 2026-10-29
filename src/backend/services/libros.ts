import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/libros";
import { esEnlaceWeb } from "./enlaces";
import { esEstadoLectura, normalizarIsbn, type EstadoLectura } from "./fichas";
import * as imagenes from "./imagenes";
import * as eliminacion from "./eliminacion";
import { esIdentificador } from "./referencias";

// Libro: campos decididos el 2026-10-28 (spec libros, cambio libros-recursos-menu-inicio).
export type Libro = {
  id: string;
  titulo: string;
  autores: string | null;
  anio: number | null;
  editorial: string | null;
  descripcion: string | null;
  isbn: string | null;
  estadoLectura: EstadoLectura | null;
  // Portada subida (ruta privada) o desde una dirección web; como mucho una de las dos.
  portadaRuta: string | null;
  portadaUrl: string | null;
};
export type EntradaLibro = {
  titulo: string;
  autores: string;
  anio: string;
  editorial: string;
  descripcion: string;
  isbn: string;
  estadoLectura: string;
};
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_TITULO = "El libro necesita un título.";
export const ERROR_ANIO = "El año debe ser un número entero entre -3000 y 3000.";
export const ERROR_ISBN = "El ISBN no es válido.";
export const ERROR_ESTADO = "El estado de lectura no es válido.";
export const ERROR_NO_EXISTE = "El libro no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar el libro. Inténtalo más tarde.";
export const ERROR_PORTADA_URL = "La dirección de la portada debe empezar por http:// o https://";

const LIMITES = { titulo: 300, autores: 500, editorial: 200, descripcion: 5000 } as const;
const NOMBRES = { titulo: "El título", autores: "Los autores", editorial: "La editorial", descripcion: "La descripción" };

const opcional = (valor: string) => valor.trim() || null;

// Convierte y valida lo que llega del formulario. Solo el título es obligatorio.
function aDatos(entrada: EntradaLibro): { datos: repo.DatosLibro } | { error: string } {
  if (!entrada.titulo.trim()) return { error: ERROR_TITULO };
  for (const campo of Object.keys(LIMITES) as (keyof typeof LIMITES)[]) {
    if (entrada[campo].trim().length > LIMITES[campo])
      return { error: `${NOMBRES[campo]} no puede superar ${LIMITES[campo]} caracteres.` };
  }
  let anio: number | null = null;
  if (entrada.anio.trim()) {
    if (!/^-?\d{1,4}$/.test(entrada.anio.trim())) return { error: ERROR_ANIO };
    anio = Number(entrada.anio.trim());
    if (anio < -3000 || anio > 3000) return { error: ERROR_ANIO };
  }
  let isbn: string | null = null;
  if (entrada.isbn.trim()) {
    isbn = normalizarIsbn(entrada.isbn);
    if (!isbn) return { error: ERROR_ISBN };
  }
  const estado = entrada.estadoLectura.trim();
  if (estado && !esEstadoLectura(estado)) return { error: ERROR_ESTADO };
  return {
    datos: {
      titulo: entrada.titulo.trim(),
      autores: opcional(entrada.autores),
      anio,
      editorial: opcional(entrada.editorial),
      descripcion: opcional(entrada.descripcion),
      isbn,
      estado_lectura: estado || null,
    },
  };
}

type FilaLibro = { id: string } & repo.DatosLibro & repo.Portada;

function aLibro(fila: FilaLibro): Libro {
  return {
    id: fila.id,
    titulo: fila.titulo,
    autores: fila.autores,
    anio: fila.anio,
    editorial: fila.editorial,
    descripcion: fila.descripcion,
    isbn: fila.isbn,
    estadoLectura: esEstadoLectura(fila.estado_lectura) ? fila.estado_lectura : null,
    portadaRuta: fila.portada_ruta,
    portadaUrl: fila.portada_url,
  };
}

export async function listarLibros(cliente: Cliente): Promise<Libro[]> {
  const { data, error } = await repo.listarLibros(cliente);
  if (error) throw error;
  return data.map(aLibro);
}

export async function obtenerLibro(cliente: Cliente, id: string): Promise<Libro | null> {
  const { data, error } = await repo.obtenerLibro(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data ? aLibro(data) : null;
}

export async function crearLibro(cliente: Cliente, entrada: EntradaLibro): Promise<Resultado<string>> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.insertarLibro(cliente, conversion.datos);
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: data.id };
}

export async function guardarLibro(cliente: Cliente, id: string, entrada: EntradaLibro): Promise<Resultado> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.actualizarLibro(cliente, id, conversion.datos);
  if (error?.code === "22P02") return { ok: false, error: ERROR_NO_EXISTE };
  if (error) return { ok: false, error: ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}

// Portada del libro (design D3): subida al almacenamiento privado, desde una dirección web o
// ninguna. La portada subida anterior se borra al cambiarla o quitarla.
export type CambioPortada = { tipo: "archivo"; archivo: unknown } | { tipo: "web"; url: string } | { tipo: "quitar" };

export async function cambiarPortada(cliente: Cliente, id: string, cambio: CambioPortada): Promise<Resultado> {
  if (!esIdentificador(id)) return { ok: false, error: ERROR_NO_EXISTE };
  const actual = await repo.portadaDe(cliente, id);
  if (actual.error) return { ok: false, error: ERROR_GENERICO };
  if (!actual.data) return { ok: false, error: ERROR_NO_EXISTE };

  let nueva: repo.Portada = { portada_ruta: null, portada_url: null };
  if (cambio.tipo === "web") {
    const url = cambio.url.trim();
    if (!esEnlaceWeb(url)) return { ok: false, error: ERROR_PORTADA_URL };
    nueva = { portada_ruta: null, portada_url: url };
  } else if (cambio.tipo === "archivo") {
    const subida = await imagenes.subirArchivoImagen(cliente, id, cambio.archivo);
    if (!subida.ok) return subida;
    nueva = { portada_ruta: subida.ruta, portada_url: null };
  }

  const { error } = await repo.cambiarPortada(cliente, id, nueva);
  if (error) {
    if (nueva.portada_ruta) await imagenes.borrarArchivos(cliente, [nueva.portada_ruta]);
    return { ok: false, error: ERROR_GENERICO };
  }
  const anterior = actual.data.portada_ruta;
  if (anterior && anterior !== nueva.portada_ruta) await imagenes.borrarArchivos(cliente, [anterior]);
  return { ok: true, valor: undefined };
}

// Elimina el libro y después su portada subida, si la tiene.
export async function eliminarLibro(
  cliente: Cliente,
  id: string,
  diferir?: imagenes.Diferir,
): Promise<eliminacion.ResultadoEliminacion> {
  const { data } = esIdentificador(id) ? await repo.portadaDe(cliente, id) : { data: null };
  const resultado = await eliminacion.eliminar(cliente, { tipo: "libro", id });
  const ruta = data?.portada_ruta;
  if (resultado.ok && ruta) await imagenes.enSuMomento(diferir, () => imagenes.borrarArchivos(cliente, [ruta]));
  return resultado;
}
