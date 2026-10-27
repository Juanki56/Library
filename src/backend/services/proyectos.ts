import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/proyectos";

// Proyecto: nombre y descripción opcional en texto libre; la estructura detallada
// sigue pendiente (spec proyectos).
export type Proyecto = { id: string; nombre: string; descripcion: string | null };
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_NOMBRE = "El proyecto necesita un nombre.";
export const ERROR_NO_EXISTE = "El proyecto no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido guardar el proyecto. Inténtalo más tarde.";
const LONGITUD_NOMBRE = 200;
const LONGITUD_DESCRIPCION = 2000;

function validar(nombre: string, descripcion: string): string | null {
  if (!nombre.trim()) return ERROR_NOMBRE;
  if (nombre.trim().length > LONGITUD_NOMBRE) return `El nombre no puede superar ${LONGITUD_NOMBRE} caracteres.`;
  if (descripcion.trim().length > LONGITUD_DESCRIPCION)
    return `La descripción no puede superar ${LONGITUD_DESCRIPCION} caracteres.`;
  return null;
}

const datos = (nombre: string, descripcion: string) => ({
  nombre: nombre.trim(),
  descripcion: descripcion.trim() || null,
});

export async function listarProyectos(cliente: Cliente): Promise<Proyecto[]> {
  const { data, error } = await repo.listarProyectos(cliente);
  if (error) throw error;
  return data;
}

export async function obtenerProyecto(cliente: Cliente, id: string): Promise<Proyecto | null> {
  const { data, error } = await repo.obtenerProyecto(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data;
}

export async function crearProyecto(cliente: Cliente, nombre: string, descripcion: string): Promise<Resultado<string>> {
  const invalido = validar(nombre, descripcion);
  if (invalido) return { ok: false, error: invalido };
  const { data, error } = await repo.insertarProyecto(cliente, datos(nombre, descripcion));
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: data.id };
}

export async function guardarProyecto(
  cliente: Cliente,
  id: string,
  nombre: string,
  descripcion: string,
): Promise<Resultado> {
  const invalido = validar(nombre, descripcion);
  if (invalido) return { ok: false, error: invalido };
  const { data, error } = await repo.actualizarProyecto(cliente, id, datos(nombre, descripcion));
  if (error?.code === "22P02") return { ok: false, error: ERROR_NO_EXISTE };
  if (error) return { ok: false, error: ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}
