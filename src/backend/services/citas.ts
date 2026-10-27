import "server-only";
import * as repo from "@/backend/repositories/citas";
import type { Cliente } from "@/backend/repositories/clienteLibre";

// Citas, frases de autor y proverbios (spec citas, design D2).

export const TIPOS_CITA = ["cita", "frase", "proverbio"] as const;
export type TipoCita = (typeof TIPOS_CITA)[number];
export const NOMBRE_TIPO: Record<TipoCita, string> = {
  cita: "Cita",
  frase: "Frase de autor",
  proverbio: "Proverbio",
};

export type Enlace = { tipo: "libro" | "recurso"; id: string; titulo: string } | null;
export type Cita = {
  id: string;
  texto: string;
  tipo: TipoCita;
  autor: string | null;
  fuente: string | null;
  enlace: Enlace;
  creadoEn: string;
};
export type EntradaCita = { texto: string; tipo: string; autor: string; fuente: string; enlace: string };
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_TEXTO = "La cita necesita un texto.";
export const ERROR_TIPO = "Elige un tipo: cita, frase de autor o proverbio.";
export const ERROR_ENLACE = "El libro o recurso elegido no existe.";
export const ERROR_NO_EXISTE = "La cita no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar la cita. Inténtalo más tarde.";

const LIMITES = { texto: 5000, autor: 300, fuente: 500 } as const;
const NOMBRES = { texto: "El texto", autor: "El autor", fuente: "La fuente" };

const esTipo = (valor: string): valor is TipoCita => (TIPOS_CITA as readonly string[]).includes(valor);
const opcional = (valor: string) => valor.trim() || null;

// Lo que se muestra cuando falta el dato: nunca se inventa un autor ni un origen.
export const textoAutor = (cita: Pick<Cita, "autor">) => cita.autor ?? "Sin autor";
export const tieneOrigen = (cita: Pick<Cita, "fuente" | "enlace">) => Boolean(cita.fuente || cita.enlace);

// El enlace llega del selector como "libro:<id>", "recurso:<id>" o vacío (sin enlace).
function aDatos(entrada: EntradaCita): { datos: repo.DatosCita } | { error: string } {
  if (!entrada.texto.trim()) return { error: ERROR_TEXTO };
  for (const campo of Object.keys(LIMITES) as (keyof typeof LIMITES)[]) {
    if (entrada[campo].trim().length > LIMITES[campo])
      return { error: `${NOMBRES[campo]} no puede superar ${LIMITES[campo]} caracteres.` };
  }
  const tipo = entrada.tipo.trim() || "cita";
  if (!esTipo(tipo)) return { error: ERROR_TIPO };

  const [clase, id] = entrada.enlace.split(":");
  const enlace = entrada.enlace ? { clase, id } : null;
  if (enlace && (!["libro", "recurso"].includes(enlace.clase) || !enlace.id)) return { error: ERROR_ENLACE };

  return {
    datos: {
      texto: entrada.texto.trim(),
      tipo,
      autor: opcional(entrada.autor),
      fuente: opcional(entrada.fuente),
      libro_id: enlace?.clase === "libro" ? enlace.id : null,
      recurso_id: enlace?.clase === "recurso" ? enlace.id : null,
    },
  };
}

type Fila = {
  id: string;
  texto: string;
  tipo: string;
  autor: string | null;
  fuente: string | null;
  libro_id: string | null;
  recurso_id: string | null;
  creado_en: string;
  libros: { titulo: string } | null;
  recursos: { titulo: string } | null;
};

function aCita(fila: Fila): Cita {
  const enlace: Enlace =
    fila.libro_id && fila.libros
      ? { tipo: "libro", id: fila.libro_id, titulo: fila.libros.titulo }
      : fila.recurso_id && fila.recursos
        ? { tipo: "recurso", id: fila.recurso_id, titulo: fila.recursos.titulo }
        : null;
  return {
    id: fila.id,
    texto: fila.texto,
    tipo: esTipo(fila.tipo) ? fila.tipo : "cita",
    autor: fila.autor,
    fuente: fila.fuente,
    enlace,
    creadoEn: fila.creado_en,
  };
}

function traducir(codigo?: string): string {
  if (codigo === "23503" || codigo === "22P02") return ERROR_ENLACE;
  if (codigo === "23514") return ERROR_TEXTO;
  return ERROR_GENERICO;
}

// Más recientes primero (spec citas). Con límite, para Inicio.
export async function listarCitas(cliente: Cliente, limite?: number): Promise<Cita[]> {
  const { data, error } = await repo.listarCitas(cliente, limite);
  if (error) throw error;
  return (data as Fila[]).map(aCita);
}

// Citas enlazadas a un libro o recurso, para mostrarlas en su página (spec relaciones).
export async function citasDe(cliente: Cliente, tipo: "libro" | "recurso", id: string): Promise<Cita[]> {
  const { data, error } = await repo.citasDe(cliente, tipo === "libro" ? "libro_id" : "recurso_id", id);
  if (error) throw error;
  return (data as Fila[]).map(aCita);
}

export async function obtenerCita(cliente: Cliente, id: string): Promise<Cita | null> {
  const { data, error } = await repo.obtenerCita(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data ? aCita(data as Fila) : null;
}

export async function crearCita(cliente: Cliente, entrada: EntradaCita): Promise<Resultado<string>> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.insertarCita(cliente, conversion.datos);
  if (error) return { ok: false, error: traducir(error.code) };
  return { ok: true, valor: data.id };
}

export async function guardarCita(cliente: Cliente, id: string, entrada: EntradaCita): Promise<Resultado> {
  const conversion = aDatos(entrada);
  if ("error" in conversion) return { ok: false, error: conversion.error };
  const { data, error } = await repo.actualizarCita(cliente, id, conversion.datos);
  if (error) return { ok: false, error: traducir(error.code) };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}

export async function eliminarCita(cliente: Cliente, id: string): Promise<Resultado> {
  const { data, error } = await repo.borrarCita(cliente, id);
  if (error) return { ok: false, error: error.code === "22P02" ? ERROR_NO_EXISTE : ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}

export async function contarCitasDe(cliente: Cliente, tipo: "libro" | "recurso", id: string): Promise<number> {
  const { count, error } = await repo.contarCitasDe(cliente, tipo === "libro" ? "libro_id" : "recurso_id", id);
  if (error) throw error;
  return count ?? 0;
}
