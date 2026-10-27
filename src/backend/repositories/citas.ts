import "server-only";
import type { Cliente } from "./clienteLibre";

const COLUMNAS =
  "id, texto, tipo, autor, fuente, libro_id, recurso_id, creado_en, libros(titulo), recursos(titulo)";

export type DatosCita = {
  texto: string;
  tipo: string;
  autor: string | null;
  fuente: string | null;
  libro_id: string | null;
  recurso_id: string | null;
};

export async function listarCitas(cliente: Cliente, limite?: number) {
  const consulta = cliente.from("citas").select(COLUMNAS).order("creado_en", { ascending: false });
  return limite ? consulta.limit(limite) : consulta;
}

export async function citasDe(cliente: Cliente, columna: "libro_id" | "recurso_id", id: string) {
  return cliente.from("citas").select(COLUMNAS).eq(columna, id).order("creado_en", { ascending: false });
}

export async function obtenerCita(cliente: Cliente, id: string) {
  return cliente.from("citas").select(COLUMNAS).eq("id", id).maybeSingle();
}

export async function insertarCita(cliente: Cliente, datos: DatosCita) {
  return cliente.from("citas").insert(datos).select("id").single();
}

export async function actualizarCita(cliente: Cliente, id: string, datos: DatosCita) {
  return cliente.from("citas").update(datos).eq("id", id).select("id");
}

export async function borrarCita(cliente: Cliente, id: string) {
  return cliente.from("citas").delete().eq("id", id).select("id");
}

export async function contarCitasDe(cliente: Cliente, columna: "libro_id" | "recurso_id", id: string) {
  return cliente.from("citas").select("*", { count: "exact", head: true }).eq(columna, id);
}
