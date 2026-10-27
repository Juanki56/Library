import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/recursos";
import { esEnlaceWeb } from "./contenidoNota";

// Fuente o recurso: campos provisionales y sin tipos (spec fuentes-recursos).
export type Recurso = repo.DatosRecurso & { id: string };
export type EntradaRecurso = { titulo: string; url: string; autor: string; descripcion: string };
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_TITULO = "El recurso necesita un título.";
export const ERROR_URL = "La dirección web debe empezar por http:// o https://";
export const ERROR_NO_EXISTE = "El recurso no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar el recurso. Inténtalo más tarde.";

const LIMITES = { titulo: 300, url: 2000, autor: 300, descripcion: 5000 } as const;
const NOMBRES = { titulo: "El título", url: "La dirección web", autor: "El autor", descripcion: "La descripción" };

const opcional = (valor: string) => valor.trim() || null;

// Solo el título es obligatorio; la dirección web, si existe, debe ser http/https.
function aDatos(entrada: EntradaRecurso): { datos: repo.DatosRecurso } | { error: string } {
  if (!entrada.titulo.trim()) return { error: ERROR_TITULO };
  for (const campo of Object.keys(LIMITES) as (keyof typeof LIMITES)[]) {
    if (entrada[campo].trim().length > LIMITES[campo])
      return { error: `${NOMBRES[campo]} no puede superar ${LIMITES[campo]} caracteres.` };
  }
  const url = opcional(entrada.url);
  if (url && !esEnlaceWeb(url)) return { error: ERROR_URL };
  return {
    datos: {
      titulo: entrada.titulo.trim(),
      url,
      autor: opcional(entrada.autor),
      descripcion: opcional(entrada.descripcion),
    },
  };
}

export async function listarRecursos(cliente: Cliente): Promise<Recurso[]> {
  const { data, error } = await repo.listarRecursos(cliente);
  if (error) throw error;
  return data;
}

export async function obtenerRecurso(cliente: Cliente, id: string): Promise<Recurso | null> {
  const { data, error } = await repo.obtenerRecurso(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data;
}

export async function crearRecurso(cliente: Cliente, entrada: EntradaRecurso): Promise<Resultado<string>> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.insertarRecurso(cliente, conversion.datos);
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: data.id };
}

export async function guardarRecurso(cliente: Cliente, id: string, entrada: EntradaRecurso): Promise<Resultado> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.actualizarRecurso(cliente, id, conversion.datos);
  if (error?.code === "22P02") return { ok: false, error: ERROR_NO_EXISTE };
  if (error) return { ok: false, error: ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}
