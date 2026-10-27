import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/notas";
import type { Json } from "@/backend/repositories/tipos-db";
import {
  DOCUMENTO_VACIO,
  TAMANO_MAXIMO,
  normalizarContenido,
  textoPlano,
  type NodoContenido,
} from "./contenidoNota";

export type { OrdenNotas } from "@/backend/repositories/notas";

export type ResumenNota = { id: string; titulo: string; creadoEn: string; actualizadoEn: string };
export type Nota = ResumenNota & { contenido: NodoContenido };
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_TITULO = "La nota necesita un título.";
export const ERROR_CONTENIDO = "El contenido de la nota no es válido.";
export const ERROR_NO_EXISTE = "La nota no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar la nota. Inténtalo más tarde.";
const LONGITUD_TITULO = 300;

function validarTitulo(titulo: string): string | null {
  const limpio = titulo.trim();
  if (!limpio) return ERROR_TITULO;
  if (limpio.length > LONGITUD_TITULO) return `El título no puede superar ${LONGITUD_TITULO} caracteres.`;
  return null;
}

// Listado general: cada nota aparece una sola vez aunque esté en varios espacios (spec notas).
export async function listarNotas(cliente: Cliente, orden: repo.OrdenNotas): Promise<ResumenNota[]> {
  const { data, error } = await repo.listarNotas(cliente, orden);
  if (error) throw error;
  return data.map((n) => ({
    id: n.id,
    titulo: n.titulo,
    creadoEn: n.creado_en,
    actualizadoEn: n.actualizado_en,
  }));
}

export async function obtenerNota(cliente: Cliente, id: string): Promise<Nota | null> {
  const { data, error } = await repo.obtenerNota(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    titulo: data.titulo,
    creadoEn: data.creado_en,
    actualizadoEn: data.actualizado_en,
    contenido: normalizarContenido(data.contenido) ?? DOCUMENTO_VACIO,
  };
}

export async function crearNota(cliente: Cliente, titulo: string): Promise<Resultado<string>> {
  const invalido = validarTitulo(titulo);
  if (invalido) return { ok: false, error: invalido };
  const { data, error } = await repo.insertarNota(cliente, titulo.trim());
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: data.id };
}

// Guarda título y contenido. El contenido llega como JSON desde el navegador y se
// normaliza al alcance aprobado del editor antes de guardarlo.
export async function guardarNota(
  cliente: Cliente,
  id: string,
  titulo: string,
  contenidoJson: string,
): Promise<Resultado> {
  const invalido = validarTitulo(titulo);
  if (invalido) return { ok: false, error: invalido };
  if (contenidoJson.length > TAMANO_MAXIMO) return { ok: false, error: "La nota es demasiado larga." };

  let entrada: unknown;
  try {
    entrada = JSON.parse(contenidoJson);
  } catch {
    return { ok: false, error: ERROR_CONTENIDO };
  }
  const contenido = normalizarContenido(entrada);
  if (!contenido) return { ok: false, error: ERROR_CONTENIDO };

  const { data, error } = await repo.actualizarNota(cliente, id, {
    titulo: titulo.trim(),
    contenido: contenido as unknown as Json,
    contenido_texto: textoPlano(contenido),
  });
  if (error?.code === "22P02") return { ok: false, error: ERROR_NO_EXISTE };
  if (error) return { ok: false, error: ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}
