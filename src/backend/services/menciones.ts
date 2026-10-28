import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/referencias";
import type { NodoContenido } from "./contenidoNota";
import { idsReferenciados } from "./referencias";

export type NotaReferida = { id: string; titulo: string };

// Título actual de cada nota referenciada en el contenido (design D2). Las que no se
// encuentran (eliminadas o ajenas) no aparecen: el editor las muestra como «Nota eliminada».
export async function titulosReferenciados(cliente: Cliente, contenido: NodoContenido): Promise<Record<string, string>> {
  const ids = idsReferenciados(contenido);
  if (!ids.length) return {};
  const { data, error } = await repo.titulosDeNotas(cliente, ids);
  if (error) throw error;
  return Object.fromEntries(data.map((n) => [n.id, n.titulo]));
}

// «Notas que la mencionan» (design D5): cada nota una vez, la modificada más reciente primero.
export async function notasQueMencionan(cliente: Cliente, id: string): Promise<NotaReferida[]> {
  const { data, error } = await repo.origenesDe(cliente, id);
  if (error?.code === "22P02") return [];
  if (error) throw error;
  if (!data.length) return [];
  const notas = await repo.notasPorModificacion(
    cliente,
    data.map((r) => r.origen_id),
  );
  if (notas.error) throw notas.error;
  return notas.data;
}

// Notas que se pueden referenciar desde la nota abierta (design D3): todas menos ella misma.
export async function notasParaReferencia(cliente: Cliente, excluirId: string): Promise<NotaReferida[]> {
  const { data, error } = await repo.notasPorModificacion(cliente);
  if (error) throw error;
  return data.filter((n) => n.id !== excluirId);
}
