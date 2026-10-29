import "server-only";
import * as repo from "@/backend/repositories/apartados";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import { ENTIDADES } from "./catalogo";
import { obtenerRelacionados, type ElementoBreve } from "./relacionados";
import { vincular } from "./vinculos";

// Apartados de un proyecto (spec proyectos, design D4 del cambio apartados-proyectos).

export type TipoAsignable = "nota" | "libro" | "recurso";
export const TIPOS_ASIGNABLES: TipoAsignable[] = ["nota", "libro", "recurso"];

const ASIGNABLES: Record<TipoAsignable, { tabla: string; columna: string }> = {
  nota: { tabla: "apartado_nota", columna: ENTIDADES.nota.columnaVinculo },
  libro: { tabla: "apartado_libro", columna: ENTIDADES.libro.columnaVinculo },
  recurso: { tabla: "apartado_recurso", columna: ENTIDADES.recurso.columnaVinculo },
};

export function esTipoAsignable(valor: unknown): valor is TipoAsignable {
  return typeof valor === "string" && valor in ASIGNABLES;
}

export type ElementoDeApartado = ElementoBreve & { tipo: TipoAsignable };
export type Apartado = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  contenido: ElementoDeApartado[];
  // Elementos que se pueden añadir a este apartado, por tipo (los que aún no están en él).
  candidatos: Record<TipoAsignable, ElementoBreve[]>;
};
export type Organizacion = { apartados: Apartado[]; sinApartado: ElementoDeApartado[] };
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: string };

export const ERROR_TITULO = "El apartado necesita un título.";
export const ERROR_NO_EXISTE = "El apartado no existe o ya se eliminó.";
export const ERROR_NO_ENCONTRADO = "No se encontró el elemento o el proyecto.";
export const ERROR_GENERICO = "No se ha podido guardar el cambio. Inténtalo más tarde.";
const LONGITUD_TITULO = 200;
const LONGITUD_DESCRIPCION = 1000;
const NO_ENCONTRADO = new Set(["23503", "22P02"]);

function validar(titulo: string, descripcion: string): string | null {
  if (!titulo.trim()) return ERROR_TITULO;
  if (titulo.trim().length > LONGITUD_TITULO) return `El título no puede superar ${LONGITUD_TITULO} caracteres.`;
  if (descripcion.trim().length > LONGITUD_DESCRIPCION)
    return `La descripción no puede superar ${LONGITUD_DESCRIPCION} caracteres.`;
  return null;
}

const porTipoYNombre = (x: ElementoDeApartado, y: ElementoDeApartado) =>
  TIPOS_ASIGNABLES.indexOf(x.tipo) - TIPOS_ASIGNABLES.indexOf(y.tipo) || x.nombre.localeCompare(y.nombre, "es");

// Apartados en orden con su contenido, el grupo «Sin apartado» y los candidatos de cada apartado.
export async function organizacion(cliente: Cliente, proyectoId: string): Promise<Organizacion> {
  const [listado, relacionados, ...asignaciones] = await Promise.all([
    repo.listarApartados(cliente, proyectoId),
    obtenerRelacionados(cliente, { tipo: "proyecto", id: proyectoId }, { conCandidatos: true }),
    ...TIPOS_ASIGNABLES.map((t) => repo.listarAsignaciones(cliente, ASIGNABLES[t].tabla, ASIGNABLES[t].columna, proyectoId)),
  ]);
  if (listado.error) throw listado.error;

  const enProyecto = {} as Record<TipoAsignable, ElementoBreve[]>;
  const todos = {} as Record<TipoAsignable, ElementoBreve[]>;
  for (const t of TIPOS_ASIGNABLES) {
    const grupo = relacionados.find((g) => g.tipo === t);
    enProyecto[t] = grupo?.elementos ?? [];
    todos[t] = [...(grupo?.elementos ?? []), ...(grupo?.candidatos ?? [])].sort((x, y) =>
      x.nombre.localeCompare(y.nombre, "es"),
    );
  }

  // apartado → ids asignados, por tipo
  const asignados = new Map<string, Record<TipoAsignable, Set<string>>>();
  const algunApartado = Object.fromEntries(TIPOS_ASIGNABLES.map((t) => [t, new Set<string>()])) as Record<
    TipoAsignable,
    Set<string>
  >;
  TIPOS_ASIGNABLES.forEach((t, i) => {
    const res = asignaciones[i];
    if (res.error) throw res.error;
    for (const fila of res.data) {
      const id = fila[ASIGNABLES[t].columna];
      if (!asignados.has(fila.apartado_id)) {
        asignados.set(
          fila.apartado_id,
          Object.fromEntries(TIPOS_ASIGNABLES.map((x) => [x, new Set<string>()])) as Record<TipoAsignable, Set<string>>,
        );
      }
      asignados.get(fila.apartado_id)![t].add(id);
      algunApartado[t].add(id);
    }
  });

  const apartados: Apartado[] = listado.data.map((a, i) => {
    const propios = asignados.get(a.id);
    const contenido = TIPOS_ASIGNABLES.flatMap((t) =>
      enProyecto[t].filter((e) => propios?.[t].has(e.id)).map((e) => ({ ...e, tipo: t })),
    ).sort(porTipoYNombre);
    const candidatos = Object.fromEntries(
      TIPOS_ASIGNABLES.map((t) => [t, todos[t].filter((e) => !propios?.[t].has(e.id))]),
    ) as Record<TipoAsignable, ElementoBreve[]>;
    return { id: a.id, numero: i + 1, titulo: a.titulo, descripcion: a.descripcion, contenido, candidatos };
  });

  const sinApartado = TIPOS_ASIGNABLES.flatMap((t) =>
    enProyecto[t].filter((e) => !algunApartado[t].has(e.id)).map((e) => ({ ...e, tipo: t })),
  ).sort(porTipoYNombre);

  return { apartados, sinApartado };
}

export async function crear(
  cliente: Cliente,
  proyectoId: string,
  titulo: string,
  descripcion: string,
): Promise<Resultado<string>> {
  const invalido = validar(titulo, descripcion);
  if (invalido) return { ok: false, error: invalido };
  const actuales = await repo.listarApartados(cliente, proyectoId);
  if (actuales.error) return { ok: false, error: ERROR_GENERICO };
  const posicion = Math.max(0, ...actuales.data.map((a) => a.posicion)) + 1;
  const { data, error } = await repo.insertarApartado(cliente, {
    proyecto_id: proyectoId,
    titulo: titulo.trim(),
    descripcion: descripcion.trim() || null,
    posicion,
  });
  if (error) return { ok: false, error: NO_ENCONTRADO.has(error.code) ? ERROR_NO_ENCONTRADO : ERROR_GENERICO };
  return { ok: true, valor: data.id };
}

export async function editar(cliente: Cliente, id: string, titulo: string, descripcion: string): Promise<Resultado> {
  const invalido = validar(titulo, descripcion);
  if (invalido) return { ok: false, error: invalido };
  const { data, error } = await repo.actualizarApartado(cliente, id, {
    titulo: titulo.trim(),
    descripcion: descripcion.trim() || null,
  });
  if (error) return { ok: false, error: error.code === "22P02" ? ERROR_NO_EXISTE : ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}

export async function mover(cliente: Cliente, id: string, direccion: "subir" | "bajar"): Promise<Resultado> {
  const { error } = await repo.moverApartado(cliente, id, direccion);
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: undefined };
}

// Coloca un elemento en un apartado. Si aún no estaba en el proyecto, primero lo vincula.
export async function asignar(
  cliente: Cliente,
  proyectoId: string,
  apartadoId: string,
  tipo: TipoAsignable,
  id: string,
): Promise<Resultado> {
  const vinculo = await vincular(cliente, { tipo: "proyecto", id: proyectoId }, { tipo, id });
  if (!vinculo.ok) return { ok: false, error: vinculo.error };
  const { tabla, columna } = ASIGNABLES[tipo];
  const { error } = await repo.insertarAsignacion(cliente, tabla, {
    apartado_id: apartadoId,
    [columna]: id,
    proyecto_id: proyectoId,
  });
  if (error) return { ok: false, error: NO_ENCONTRADO.has(error.code ?? "") ? ERROR_NO_ENCONTRADO : ERROR_GENERICO };
  return { ok: true, valor: undefined };
}

// Quita el elemento del apartado; sigue en el proyecto.
export async function quitar(cliente: Cliente, apartadoId: string, tipo: TipoAsignable, id: string): Promise<Resultado> {
  const { tabla, columna } = ASIGNABLES[tipo];
  const { error } = await repo.borrarAsignacion(cliente, tabla, columna, apartadoId, id);
  if (error) return { ok: false, error: ERROR_GENERICO };
  return { ok: true, valor: undefined };
}

// Cuántos elementos contiene el apartado, para avisar antes de eliminarlo.
export async function contarContenido(cliente: Cliente, apartadoId: string): Promise<number> {
  const conteos = await Promise.all(
    TIPOS_ASIGNABLES.map((t) => repo.contarAsignaciones(cliente, ASIGNABLES[t].tabla, apartadoId)),
  );
  return conteos.reduce((suma, c) => {
    if (c.error) throw c.error;
    return suma + (c.count ?? 0);
  }, 0);
}

export function textoAvisoApartado(elementos: number): string {
  if (elementos === 0) return "Este apartado está vacío.";
  if (elementos === 1) return "El elemento de este apartado seguirá en el proyecto.";
  return `Los ${elementos} elementos de este apartado seguirán en el proyecto.`;
}

export async function eliminar(cliente: Cliente, id: string): Promise<Resultado> {
  const { data, error } = await repo.borrarApartado(cliente, id);
  if (error) return { ok: false, error: error.code === "22P02" ? ERROR_NO_EXISTE : ERROR_GENERICO };
  if (!data.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true, valor: undefined };
}
