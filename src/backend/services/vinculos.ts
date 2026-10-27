import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import { borrarVinculo, insertarVinculo } from "@/backend/repositories/vinculos";
import { ENTIDADES, relacionEntre, type Entidad } from "./catalogo";

export type Referencia = { tipo: Entidad; id: string };
export type ResultadoVinculo = { ok: true } | { ok: false; error: string };

export const ERROR_RELACION_NO_PERMITIDA = "Estos elementos no se pueden relacionar.";
export const ERROR_NO_ENCONTRADO = "No se encontró uno de los elementos.";
export const ERROR_GENERICO = "No se ha podido guardar el cambio. Inténtalo más tarde.";

// Códigos de PostgreSQL: clave foránea inexistente (o de otro usuario) e identificador mal formado.
const NO_ENCONTRADO = new Set(["23503", "22P02"]);

function filaDe(x: Referencia, y: Referencia) {
  const relacion = relacionEntre(x.tipo, y.tipo);
  if (!relacion) return null;
  return {
    tabla: relacion.tabla,
    fila: {
      [ENTIDADES[x.tipo].columnaVinculo]: x.id,
      [ENTIDADES[y.tipo].columnaVinculo]: y.id,
    },
  };
}

function traducir(error: { code?: string } | null): ResultadoVinculo {
  if (!error) return { ok: true };
  if (error.code && NO_ENCONTRADO.has(error.code)) return { ok: false, error: ERROR_NO_ENCONTRADO };
  return { ok: false, error: ERROR_GENERICO };
}

// Vincula dos elementos sin copiarlos. Si el vínculo ya existe no hace nada
// (spec relaciones: "Vínculo repetido"). La base de datos rechaza elementos de otro usuario.
export async function vincular(cliente: Cliente, x: Referencia, y: Referencia): Promise<ResultadoVinculo> {
  const destino = filaDe(x, y);
  if (!destino) return { ok: false, error: ERROR_RELACION_NO_PERMITIDA };
  const { error } = await insertarVinculo(cliente, destino.tabla, destino.fila);
  return traducir(error);
}

// Quita solo la relación; ninguno de los dos elementos se borra (spec relaciones).
export async function desvincular(cliente: Cliente, x: Referencia, y: Referencia): Promise<ResultadoVinculo> {
  const destino = filaDe(x, y);
  if (!destino) return { ok: false, error: ERROR_RELACION_NO_PERMITIDA };
  const { error } = await borrarVinculo(cliente, destino.tabla, destino.fila);
  return traducir(error);
}
