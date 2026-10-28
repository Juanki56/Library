import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/recursos";
import { esEnlaceWeb } from "./enlaces";
import { esFechaValida, esTipoRecurso, type TipoRecurso } from "./fichas";

// Fuente o recurso: tipos y datos decididos el 2026-10-28 (spec fuentes-recursos).
export type Recurso = Omit<repo.DatosRecurso, "tipo"> & { id: string; tipo: TipoRecurso };
export type EntradaRecurso = {
  titulo: string;
  url: string;
  autor: string;
  descripcion: string;
  tipo: string;
  fechaPublicacion: string;
};
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_TITULO = "El recurso necesita un título.";
export const ERROR_URL = "La dirección web debe empezar por http:// o https://";
export const ERROR_TIPO = "El tipo de recurso no es válido.";
export const ERROR_FECHA = "La fecha de publicación no es válida.";
export const ERROR_NO_EXISTE = "El recurso no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar el recurso. Inténtalo más tarde.";

const LIMITES = { titulo: 300, url: 2000, autor: 300, descripcion: 5000 } as const;
const NOMBRES = { titulo: "El título", url: "La dirección web", autor: "El autor o creador", descripcion: "La descripción" };

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
  const tipo = entrada.tipo.trim() || "otro";
  if (!esTipoRecurso(tipo)) return { error: ERROR_TIPO };
  const fecha = entrada.fechaPublicacion.trim();
  if (fecha && !esFechaValida(fecha)) return { error: ERROR_FECHA };
  return {
    datos: {
      titulo: entrada.titulo.trim(),
      url,
      autor: opcional(entrada.autor),
      descripcion: opcional(entrada.descripcion),
      tipo,
      fecha_publicacion: fecha || null,
    },
  };
}

const aRecurso = (fila: repo.DatosRecurso & { id: string }): Recurso => ({
  ...fila,
  tipo: esTipoRecurso(fila.tipo) ? fila.tipo : "otro",
});

// Lista completa o filtrada por tipo (requisito «Filtro por tipo en la lista de recursos»).
export async function listarRecursos(cliente: Cliente, tipo?: TipoRecurso): Promise<Recurso[]> {
  const { data, error } = await repo.listarRecursos(cliente, tipo);
  if (error) throw error;
  return data.map(aRecurso);
}

export async function obtenerRecurso(cliente: Cliente, id: string): Promise<Recurso | null> {
  const { data, error } = await repo.obtenerRecurso(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data ? aRecurso(data) : null;
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
