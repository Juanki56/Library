import "server-only";
import type { Cliente } from "./clienteLibre";

const COLUMNAS = "id, titulo, url, autor, descripcion, tipo, fecha_publicacion";

export type DatosRecurso = {
  titulo: string;
  url: string | null;
  autor: string | null;
  descripcion: string | null;
  tipo: string;
  fecha_publicacion: string | null;
};

export async function listarRecursos(cliente: Cliente, tipo?: string) {
  const consulta = cliente.from("recursos").select(COLUMNAS).order("titulo");
  return tipo ? consulta.eq("tipo", tipo) : consulta;
}

export async function obtenerRecurso(cliente: Cliente, id: string) {
  return cliente.from("recursos").select(COLUMNAS).eq("id", id).maybeSingle();
}

export async function insertarRecurso(cliente: Cliente, datos: DatosRecurso) {
  return cliente.from("recursos").insert(datos).select("id").single();
}

export async function actualizarRecurso(cliente: Cliente, id: string, datos: DatosRecurso) {
  return cliente.from("recursos").update(datos).eq("id", id).select("id");
}
