import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/glosario";
import { normalizar } from "./etiquetas";

// Glosario: término y definición obligatorios, sin términos duplicados (spec glosario, design D4).

export type Entrada = {
  id: string;
  termino: string;
  definicion: string;
  ejemplo: string | null;
  informacionAdicional: string | null;
};
export type GrupoLetra = { letra: string; entradas: Entrada[] };
export type EntradaGlosario = { termino: string; definicion: string; ejemplo: string; informacionAdicional: string };
// Un término repetido devuelve la entrada existente para ofrecer abrirla (escenario «Término duplicado»).
export type Resultado<T = undefined> =
  | { ok: true; valor: T }
  | { ok: false; error: string; existente?: { id: string; termino: string } };

export const ERROR_TERMINO = "El término es obligatorio.";
export const ERROR_DEFINICION = "La definición es obligatoria.";
export const ERROR_DUPLICADO = "Ese término ya existe en tu glosario.";
export const ERROR_NO_EXISTE = "La entrada no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar la entrada. Inténtalo más tarde.";

const LIMITES = { termino: 200, definicion: 5000, ejemplo: 2000, informacionAdicional: 5000 } as const;
const NOMBRES = {
  termino: "El término",
  definicion: "La definición",
  ejemplo: "El ejemplo",
  informacionAdicional: "La información adicional",
};

const opcional = (valor: string) => valor.trim() || null;

function aDatos(entrada: EntradaGlosario): { datos: repo.DatosEntrada } | { error: string } {
  if (!entrada.termino.trim()) return { error: ERROR_TERMINO };
  if (!entrada.definicion.trim()) return { error: ERROR_DEFINICION };
  for (const campo of Object.keys(LIMITES) as (keyof typeof LIMITES)[]) {
    if (entrada[campo].trim().length > LIMITES[campo])
      return { error: `${NOMBRES[campo]} no puede superar ${LIMITES[campo]} caracteres.` };
  }
  return {
    datos: {
      termino: entrada.termino.trim().replace(/\s+/g, " "),
      definicion: entrada.definicion.trim(),
      ejemplo: opcional(entrada.ejemplo),
      informacion_adicional: opcional(entrada.informacionAdicional),
    },
  };
}

type Fila = {
  id: string;
  termino: string;
  termino_normalizado: string | null;
  definicion: string;
  ejemplo: string | null;
  informacion_adicional: string | null;
};

const aEntrada = (f: Fila): Entrada => ({
  id: f.id,
  termino: f.termino,
  definicion: f.definicion,
  ejemplo: f.ejemplo,
  informacionAdicional: f.informacion_adicional,
});

// Letra inicial para agrupar: A–Z sin tildes (la ñ va con la n); el resto bajo «#».
export function letraDe(termino: string): string {
  const primera = normalizar(termino).charAt(0).toUpperCase();
  return /^[A-Z]$/.test(primera) ? primera : "#";
}

// Orden alfabético, agrupado por letra inicial (spec glosario).
export async function listarPorLetra(cliente: Cliente): Promise<GrupoLetra[]> {
  const { data, error } = await repo.listarGlosario(cliente);
  if (error) throw error;
  const grupos = new Map<string, Entrada[]>();
  for (const fila of data) {
    const letra = letraDe(fila.termino);
    if (!grupos.has(letra)) grupos.set(letra, []);
    grupos.get(letra)!.push(aEntrada(fila));
  }
  return [...grupos.entries()]
    .sort(([x], [y]) => (x === "#" ? 1 : y === "#" ? -1 : x.localeCompare(y)))
    .map(([letra, entradas]) => ({ letra, entradas }));
}

export async function obtenerEntrada(cliente: Cliente, id: string): Promise<Entrada | null> {
  const { data, error } = await repo.obtenerEntrada(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data ? aEntrada(data) : null;
}

async function duplicado(cliente: Cliente, termino: string): Promise<Resultado<never>> {
  const { data } = await repo.buscarPorNormalizado(cliente, normalizar(termino));
  return { ok: false, error: ERROR_DUPLICADO, existente: data ?? undefined };
}

export async function crear(cliente: Cliente, entrada: EntradaGlosario): Promise<Resultado<string>> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.insertarEntrada(cliente, conversion.datos);
  if (error?.code === "23505") return duplicado(cliente, conversion.datos.termino);
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: data.id };
}

export async function guardar(cliente: Cliente, id: string, entrada: EntradaGlosario): Promise<Resultado> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.actualizarEntrada(cliente, id, conversion.datos);
  if (error?.code === "23505") return duplicado(cliente, conversion.datos.termino);
  if (error) return { ok: false, error: error.code === "22P02" ? ERROR_NO_EXISTE : ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}

export async function eliminar(cliente: Cliente, id: string): Promise<Resultado> {
  const { data, error } = await repo.borrarEntrada(cliente, id);
  if (error) return { ok: false, error: error.code === "22P02" ? ERROR_NO_EXISTE : ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}
