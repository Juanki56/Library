import "server-only";
import type { Json } from "./tipos-db";
import type { Cliente } from "./clienteLibre";

export type OrdenNotas = "modificacion" | "creacion";

const COLUMNA_ORDEN: Record<OrdenNotas, "actualizado_en" | "creado_en"> = {
  modificacion: "actualizado_en",
  creacion: "creado_en",
};

export async function listarNotas(cliente: Cliente, orden: OrdenNotas) {
  return cliente
    .from("notas")
    .select("id, titulo, creado_en, actualizado_en")
    .order(COLUMNA_ORDEN[orden], { ascending: false });
}

export async function obtenerNota(cliente: Cliente, id: string) {
  return cliente
    .from("notas")
    .select("id, titulo, contenido, creado_en, actualizado_en")
    .eq("id", id)
    .maybeSingle();
}

export async function insertarNota(cliente: Cliente, titulo: string) {
  return cliente.from("notas").insert({ titulo }).select("id").single();
}

export async function actualizarNota(
  cliente: Cliente,
  id: string,
  cambios: { titulo: string; contenido: Json; contenido_texto: string },
) {
  return cliente.from("notas").update(cambios).eq("id", id).select("id");
}
