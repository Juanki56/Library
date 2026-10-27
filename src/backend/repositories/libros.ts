import "server-only";
import type { Cliente } from "./clienteLibre";

const COLUMNAS = "id, titulo, autores, anio, editorial, notas_bibliograficas";

export type DatosLibro = {
  titulo: string;
  autores: string | null;
  anio: number | null;
  editorial: string | null;
  notas_bibliograficas: string | null;
};

export async function listarLibros(cliente: Cliente) {
  return cliente.from("libros").select(COLUMNAS).order("titulo");
}

export async function obtenerLibro(cliente: Cliente, id: string) {
  return cliente.from("libros").select(COLUMNAS).eq("id", id).maybeSingle();
}

export async function insertarLibro(cliente: Cliente, datos: DatosLibro) {
  return cliente.from("libros").insert(datos).select("id").single();
}

export async function actualizarLibro(cliente: Cliente, id: string, datos: DatosLibro) {
  return cliente.from("libros").update(datos).eq("id", id).select("id");
}
