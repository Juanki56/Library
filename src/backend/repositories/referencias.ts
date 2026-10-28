import "server-only";
import type { Cliente } from "./clienteLibre";

// Referencias entre notas (cambio editor-fase2-referencias). Todas las lecturas pasan por la
// RLS del usuario: una nota ajena o eliminada simplemente no aparece.

export async function titulosDeNotas(cliente: Cliente, ids: string[]) {
  return cliente.from("notas").select("id, titulo").in("id", ids);
}

export async function origenesDe(cliente: Cliente, destinoId: string) {
  return cliente.from("referencias_nota").select("origen_id").eq("destino_id", destinoId);
}

export async function notasPorModificacion(cliente: Cliente, ids?: string[]) {
  const consulta = cliente.from("notas").select("id, titulo").order("actualizado_en", { ascending: false });
  return ids ? consulta.in("id", ids) : consulta;
}
