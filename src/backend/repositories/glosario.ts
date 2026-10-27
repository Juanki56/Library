import "server-only";
import type { Cliente } from "./clienteLibre";

const COLUMNAS = "id, termino, termino_normalizado, definicion, ejemplo, informacion_adicional";

export type DatosEntrada = {
  termino: string;
  definicion: string;
  ejemplo: string | null;
  informacion_adicional: string | null;
};

export async function listarGlosario(cliente: Cliente) {
  return cliente.from("glosario").select(COLUMNAS).order("termino_normalizado");
}

export async function obtenerEntrada(cliente: Cliente, id: string) {
  return cliente.from("glosario").select(COLUMNAS).eq("id", id).maybeSingle();
}

export async function buscarPorNormalizado(cliente: Cliente, normalizado: string) {
  return cliente.from("glosario").select("id, termino").eq("termino_normalizado", normalizado).maybeSingle();
}

export async function insertarEntrada(cliente: Cliente, datos: DatosEntrada) {
  return cliente.from("glosario").insert(datos).select("id").single();
}

export async function actualizarEntrada(cliente: Cliente, id: string, datos: DatosEntrada) {
  return cliente.from("glosario").update(datos).eq("id", id).select("id");
}

export async function borrarEntrada(cliente: Cliente, id: string) {
  return cliente.from("glosario").delete().eq("id", id).select("id");
}
