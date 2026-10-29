import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/etiquetas";
import { normalizar } from "./normalizar";
import { ENTIDADES, type Entidad } from "./catalogo";
import type { ElementoBreve } from "./relacionados";

// Etiquetas compartidas entre notas, libros, proyectos y recursos (spec etiquetas, design D3).

export const TIPOS_ETIQUETABLES: Entidad[] = ["nota", "libro", "proyecto", "recurso"];
const ASIGNACION: Record<Entidad, string> = {
  nota: "etiqueta_nota",
  libro: "etiqueta_libro",
  proyecto: "etiqueta_proyecto",
  recurso: "etiqueta_recurso",
};

export type Etiqueta = { id: string; nombre: string };
export type GrupoEtiqueta = { tipo: Entidad; elementos: ElementoBreve[] };
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_NOMBRE = "La etiqueta necesita un nombre.";
export const ERROR_YA_EXISTE = "Ya existe una etiqueta con ese nombre.";
export const ERROR_NO_EXISTE = "La etiqueta no existe o ya se eliminó.";
export const ERROR_NO_ENCONTRADO = "No se encontró el elemento.";
export const ERROR_GENERICO = "No se ha podido guardar la etiqueta. Inténtalo más tarde.";
const LONGITUD_NOMBRE = 60;

export { normalizar };


// Nombre limpio para guardar: se conserva la forma escrita, sin espacios sobrantes.
export function limpiarNombre(texto: string): string {
  return texto.trim().replace(/\s+/g, " ");
}

function validar(nombre: string): string | null {
  if (!nombre) return ERROR_NOMBRE;
  if (nombre.length > LONGITUD_NOMBRE) return `La etiqueta no puede superar ${LONGITUD_NOMBRE} caracteres.`;
  return null;
}

export async function listarEtiquetas(cliente: Cliente): Promise<Etiqueta[]> {
  const { data, error } = await repo.listarEtiquetas(cliente);
  if (error) throw error;
  return data;
}

export async function obtenerEtiqueta(cliente: Cliente, id: string): Promise<Etiqueta | null> {
  const { data, error } = await repo.obtenerEtiqueta(cliente, id);
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data;
}

export async function crear(cliente: Cliente, texto: string): Promise<Resultado<Etiqueta>> {
  const nombre = limpiarNombre(texto);
  const invalido = validar(nombre);
  if (invalido) return { ok: false, error: invalido };
  const { data, error } = await repo.insertarEtiqueta(cliente, nombre);
  if (error) return { ok: false, error: error.code === "23505" ? ERROR_YA_EXISTE : ERROR_GENERICO };
  return { ok: true, valor: data };
}

// Devuelve la etiqueta con ese nombre (sin distinguir mayúsculas ni tildes) o la crea.
export async function obtenerOCrear(cliente: Cliente, texto: string): Promise<Resultado<Etiqueta>> {
  const nombre = limpiarNombre(texto);
  const invalido = validar(nombre);
  if (invalido) return { ok: false, error: invalido };
  const existente = await repo.buscarPorNormalizado(cliente, normalizar(nombre));
  if (existente.data) return { ok: true, valor: existente.data };
  const creada = await repo.insertarEtiqueta(cliente, nombre);
  if (!creada.error) return { ok: true, valor: creada.data };
  if (creada.error.code === "23505") {
    // Se creó a la vez desde otro sitio: se reutiliza.
    const otra = await repo.buscarPorNormalizado(cliente, normalizar(nombre));
    if (otra.data) return { ok: true, valor: otra.data };
  }
  return { ok: false, error: ERROR_GENERICO };
}

// Asigna a un elemento una etiqueta existente o nueva. Asignarla dos veces no da error.
export async function asignar(cliente: Cliente, tipo: Entidad, id: string, texto: string): Promise<Resultado> {
  const etiqueta = await obtenerOCrear(cliente, texto);
  if (!etiqueta.ok) return etiqueta;
  const { error } = await repo.asignarEtiqueta(cliente, ASIGNACION[tipo], {
    etiqueta_id: etiqueta.valor.id,
    [ENTIDADES[tipo].columnaVinculo]: id,
  });
  if (error) return { ok: false, error: ["23503", "22P02"].includes(error.code ?? "") ? ERROR_NO_ENCONTRADO : ERROR_GENERICO };
  return { ok: true, valor: undefined };
}

// Quita la etiqueta del elemento; el elemento no se borra.
export async function quitar(cliente: Cliente, tipo: Entidad, id: string, etiquetaId: string): Promise<Resultado> {
  const { error } = await repo.quitarEtiqueta(cliente, ASIGNACION[tipo], ENTIDADES[tipo].columnaVinculo, id, etiquetaId);
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: undefined };
}

export async function etiquetasDe(cliente: Cliente, tipo: Entidad, id: string): Promise<Etiqueta[]> {
  const { data, error } = await repo.etiquetasDe(cliente, ASIGNACION[tipo], ENTIDADES[tipo].columnaVinculo, id);
  if (error) throw error;
  return data
    .map((fila) => fila.etiquetas)
    .filter((e): e is Etiqueta => e !== null)
    .sort((x, y) => normalizar(x.nombre).localeCompare(normalizar(y.nombre), "es"));
}

// Elementos con la etiqueta, agrupados por tipo y ordenados alfabéticamente (spec etiquetas).
export async function elementosDe(cliente: Cliente, etiquetaId: string, filtro?: Entidad): Promise<GrupoEtiqueta[]> {
  const tipos = filtro ? [filtro] : TIPOS_ETIQUETABLES;
  return Promise.all(
    tipos.map(async (tipo) => {
      const { tabla, campoNombre } = ENTIDADES[tipo];
      const { data, error } = await repo.elementosConEtiqueta(cliente, ASIGNACION[tipo], tabla, campoNombre, etiquetaId);
      if (error) throw error;
      const elementos = data
        .map((fila) => fila[tabla])
        .filter((e): e is Record<string, string> => e !== null)
        .map((e) => ({ id: e.id, nombre: e[campoNombre] }))
        .sort((x, y) => x.nombre.localeCompare(y.nombre, "es"));
      return { tipo, elementos };
    }),
  );
}

export async function renombrar(cliente: Cliente, id: string, texto: string): Promise<Resultado> {
  const nombre = limpiarNombre(texto);
  const invalido = validar(nombre);
  if (invalido) return { ok: false, error: invalido };
  const { data, error } = await repo.renombrarEtiqueta(cliente, id, nombre);
  if (error) return { ok: false, error: error.code === "23505" ? ERROR_YA_EXISTE : ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}

export async function contarUsos(cliente: Cliente, etiquetaId: string): Promise<number> {
  const conteos = await Promise.all(TIPOS_ETIQUETABLES.map((t) => repo.contarUsos(cliente, ASIGNACION[t], etiquetaId)));
  return conteos.reduce((suma, c) => {
    if (c.error) throw c.error;
    return suma + (c.count ?? 0);
  }, 0);
}

export function textoAvisoEtiqueta(usos: number): string {
  if (usos === 0) return "Ningún elemento usa esta etiqueta.";
  if (usos === 1) return "Se quitará de 1 elemento. Ese elemento no se borrará.";
  return `Se quitará de ${usos} elementos. Esos elementos no se borrarán.`;
}

// Elimina la etiqueta; sus asignaciones desaparecen en cascada y los elementos se conservan.
export async function eliminar(cliente: Cliente, id: string): Promise<Resultado> {
  const { data, error } = await repo.borrarEtiqueta(cliente, id);
  if (error) return { ok: false, error: error.code === "22P02" ? ERROR_NO_EXISTE : ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}
