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

type Cambios = { titulo: string; contenido: Json; contenido_texto: string };

// Valida el título y normaliza el contenido (JSON del navegador) al alcance aprobado del editor.
function prepararCambios(titulo: string, contenidoJson: string): { cambios: Cambios } | { error: string } {
  const invalido = validarTitulo(titulo);
  if (invalido) return { error: invalido };
  if (contenidoJson.length > TAMANO_MAXIMO) return { error: "La nota es demasiado larga." };
  let entrada: unknown;
  try {
    entrada = JSON.parse(contenidoJson);
  } catch {
    return { error: ERROR_CONTENIDO };
  }
  const contenido = normalizarContenido(entrada);
  if (!contenido) return { error: ERROR_CONTENIDO };
  return {
    cambios: { titulo: titulo.trim(), contenido: contenido as unknown as Json, contenido_texto: textoPlano(contenido) },
  };
}

// Resultado del guardado automático (design D5 y D7): la versión es la fecha de modificación
// tal como la devuelve la base de datos. «validacion»: error que no se arregla reintentando.
export type ResultadoGuardado =
  | { tipo: "ok"; version: string }
  | { tipo: "conflicto"; version: string }
  | { tipo: "error"; error: string; validacion: boolean };

// Guarda solo si la nota sigue en la versión base; si cambió en otro sitio, no la sobrescribe.
export async function guardarConVersion(
  cliente: Cliente,
  id: string,
  titulo: string,
  contenidoJson: string,
  versionBase: string,
): Promise<ResultadoGuardado> {
  const preparado = prepararCambios(titulo, contenidoJson);
  if ("error" in preparado) return { tipo: "error", error: preparado.error, validacion: true };

  const { data, error } = await repo.actualizarNotaSiVersion(cliente, id, preparado.cambios, versionBase);
  if (error?.code === "22P02") return { tipo: "error", error: ERROR_NO_EXISTE, validacion: true };
  if (error) return { tipo: "error", error: ERROR_GENERICO, validacion: false };
  if (data.length) return { tipo: "ok", version: data[0].actualizado_en };

  const actual = await repo.versionDeNota(cliente, id);
  if (actual.error) return { tipo: "error", error: ERROR_GENERICO, validacion: false };
  if (!actual.data) return { tipo: "error", error: ERROR_NO_EXISTE, validacion: true };
  return { tipo: "conflicto", version: actual.data.actualizado_en };
}
