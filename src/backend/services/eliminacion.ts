import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import { borrarEntidad, existeEntidad } from "@/backend/repositories/entidades";
import { contarVinculos } from "@/backend/repositories/vinculos";
import { ENTIDADES, relacionesDe, type Entidad } from "./catalogo";
import type { Referencia } from "./vinculos";

export type ResumenEliminacion = {
  total: number;
  porTipo: Partial<Record<Entidad, number>>;
};

export type ResultadoEliminacion = { ok: true } | { ok: false; error: string };

export const ERROR_NO_EXISTE = "El elemento no existe o ya se eliminó.";
export const ERROR_GENERICO = "No se ha podido eliminar. Inténtalo más tarde.";

// Cuántos vínculos se perderán al eliminar el elemento, por tipo de elemento relacionado.
// Sirve para avisar antes de confirmar (spec relaciones). null si el elemento no existe.
export async function resumenEliminacion(
  cliente: Cliente,
  { tipo, id }: Referencia,
): Promise<ResumenEliminacion | null> {
  const existe = await existeEntidad(cliente, ENTIDADES[tipo].tabla, id);
  if (existe.error || !existe.count) return null;

  const conteos = await Promise.all(
    relacionesDe(tipo).map(async ({ relacion, otra }) => {
      const { count, error } = await contarVinculos(
        cliente,
        relacion.tabla,
        ENTIDADES[tipo].columnaVinculo,
        id,
      );
      if (error) throw error;
      return [otra, count ?? 0] as const;
    }),
  );

  const porTipo: Partial<Record<Entidad, number>> = {};
  for (const [otra, n] of conteos) if (n > 0) porTipo[otra] = n;
  return { total: conteos.reduce((suma, [, n]) => suma + n, 0), porTipo };
}

const NOMBRES: Record<Entidad, [string, string]> = {
  proyecto: ["proyecto", "proyectos"],
  nota: ["nota", "notas"],
  libro: ["libro", "libros"],
  recurso: ["recurso", "recursos"],
};

// Texto del aviso que se muestra antes de confirmar la eliminación.
export function textoAviso(resumen: ResumenEliminacion): string {
  if (resumen.total === 0) return "Este elemento no tiene vínculos con otros elementos.";
  const partes = (Object.entries(resumen.porTipo) as [Entidad, number][]).map(
    ([tipo, n]) => `${n} ${NOMBRES[tipo][n === 1 ? 0 : 1]}`,
  );
  const lista = partes.length > 1 ? `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}` : partes[0];
  const vinculos = resumen.total === 1 ? "Se quitará 1 vínculo" : `Se quitarán ${resumen.total} vínculos`;
  const conservados = resumen.total === 1 ? "Ese elemento no se borrará." : "Esos elementos no se borrarán.";
  return `${vinculos} con ${lista}. ${conservados}`;
}

// Elimina el elemento; sus vínculos desaparecen en cascada y los elementos relacionados se conservan.
export async function eliminar(cliente: Cliente, { tipo, id }: Referencia): Promise<ResultadoEliminacion> {
  const { data, error } = await borrarEntidad(cliente, ENTIDADES[tipo].tabla, id);
  if (error) return { ok: false, error: error.code === "22P02" ? ERROR_NO_EXISTE : ERROR_GENERICO };
  if (!data?.length) return { ok: false, error: ERROR_NO_EXISTE };
  return { ok: true };
}
