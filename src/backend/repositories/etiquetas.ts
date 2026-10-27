import "server-only";
import { sinTipos, type Cliente } from "./clienteLibre";

export async function listarEtiquetas(cliente: Cliente) {
  return cliente.from("etiquetas").select("id, nombre").order("nombre_normalizado");
}

export async function obtenerEtiqueta(cliente: Cliente, id: string) {
  return cliente.from("etiquetas").select("id, nombre").eq("id", id).maybeSingle();
}

export async function buscarPorNormalizado(cliente: Cliente, normalizado: string) {
  return cliente.from("etiquetas").select("id, nombre").eq("nombre_normalizado", normalizado).maybeSingle();
}

export async function insertarEtiqueta(cliente: Cliente, nombre: string) {
  return cliente.from("etiquetas").insert({ nombre }).select("id, nombre").single();
}

export async function renombrarEtiqueta(cliente: Cliente, id: string, nombre: string) {
  return cliente.from("etiquetas").update({ nombre }).eq("id", id).select("id");
}

export async function borrarEtiqueta(cliente: Cliente, id: string) {
  return cliente.from("etiquetas").delete().eq("id", id).select("id");
}

// Etiquetas de un elemento, embebidas desde su tabla de asignación.
export async function etiquetasDe(cliente: Cliente, tabla: string, columna: string, id: string) {
  return sinTipos(cliente)
    .from(tabla)
    .select("etiquetas(id, nombre)")
    .eq(columna, id)
    .overrideTypes<{ etiquetas: { id: string; nombre: string } | null }[], { merge: false }>();
}

// Elementos de un tipo que tienen la etiqueta.
export async function elementosConEtiqueta(
  cliente: Cliente,
  tabla: string,
  tablaElemento: string,
  campoNombre: string,
  etiquetaId: string,
) {
  return sinTipos(cliente)
    .from(tabla)
    .select(`${tablaElemento}(id, ${campoNombre})`)
    .eq("etiqueta_id", etiquetaId)
    .overrideTypes<Record<string, Record<string, string> | null>[], { merge: false }>();
}

// Si ya está asignada no hace nada (ON CONFLICT DO NOTHING).
export async function asignarEtiqueta(cliente: Cliente, tabla: string, fila: Record<string, string>) {
  return sinTipos(cliente).from(tabla).upsert(fila, { ignoreDuplicates: true });
}

export async function quitarEtiqueta(cliente: Cliente, tabla: string, columna: string, id: string, etiquetaId: string) {
  return sinTipos(cliente).from(tabla).delete().eq(columna, id).eq("etiqueta_id", etiquetaId);
}

export async function contarUsos(cliente: Cliente, tabla: string, etiquetaId: string) {
  return sinTipos(cliente).from(tabla).select("*", { count: "exact", head: true }).eq("etiqueta_id", etiquetaId);
}
