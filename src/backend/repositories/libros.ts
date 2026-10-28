import "server-only";
import type { Cliente } from "./clienteLibre";

const COLUMNAS =
  "id, titulo, autores, anio, editorial, descripcion, isbn, estado_lectura, portada_ruta, portada_url";

// Datos que se editan en el formulario del libro; la portada tiene su propio formulario.
export type DatosLibro = {
  titulo: string;
  autores: string | null;
  anio: number | null;
  editorial: string | null;
  descripcion: string | null;
  isbn: string | null;
  estado_lectura: string | null;
};

export type Portada = { portada_ruta: string | null; portada_url: string | null };

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

export async function portadaDe(cliente: Cliente, id: string) {
  return cliente.from("libros").select("portada_ruta, portada_url").eq("id", id).maybeSingle();
}

export async function cambiarPortada(cliente: Cliente, id: string, portada: Portada) {
  return cliente.from("libros").update(portada).eq("id", id).select("id");
}
