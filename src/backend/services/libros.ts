import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/libros";

// Libro: campos bibliográficos provisionales y sin tipos (spec libros).
export type Libro = {
  id: string;
  titulo: string;
  autores: string | null;
  anio: number | null;
  editorial: string | null;
  notasBibliograficas: string | null;
};
export type EntradaLibro = {
  titulo: string;
  autores: string;
  anio: string;
  editorial: string;
  notasBibliograficas: string;
};
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_TITULO = "El libro necesita un título.";
export const ERROR_ANIO = "El año debe ser un número entero entre -3000 y 3000.";
export const ERROR_NO_EXISTE = "El libro no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar el libro. Inténtalo más tarde.";

const LIMITES = { titulo: 300, autores: 500, editorial: 200, notasBibliograficas: 5000 } as const;
const NOMBRES = { titulo: "El título", autores: "Los autores", editorial: "La editorial", notasBibliograficas: "Las notas bibliográficas" };

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
  return {
    datos: {
      titulo: entrada.titulo.trim(),
      autores: opcional(entrada.autores),
      anio,
      editorial: opcional(entrada.editorial),
      notas_bibliograficas: opcional(entrada.notasBibliograficas),
    },
  };
}

function aLibro(fila: { id: string } & repo.DatosLibro): Libro {
  return {
    id: fila.id,
    titulo: fila.titulo,
    autores: fila.autores,
    anio: fila.anio,
    editorial: fila.editorial,
    notasBibliograficas: fila.notas_bibliograficas,
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
