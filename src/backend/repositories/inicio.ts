import "server-only";
import type { Cliente } from "./clienteLibre";

// Notas más recientes con su texto plano y los proyectos a los que pertenecen.
export async function notasRecientes(cliente: Cliente, cantidad: number) {
  return cliente
    .from("notas")
    .select("id, titulo, contenido_texto, actualizado_en, nota_proyecto(proyectos(nombre))")
    .order("actualizado_en", { ascending: false })
    .limit(cantidad);
}

const COLUMNAS_LIBRO = "id, titulo, autores, anio, editorial";

// Libros en lectura, los últimos modificados primero.
export async function librosLeyendo(cliente: Cliente, cantidad: number) {
  return cliente
    .from("libros")
    .select(COLUMNAS_LIBRO)
    .eq("estado_lectura", "leyendo")
    .order("actualizado_en", { ascending: false })
    .limit(cantidad);
}

// Últimos libros añadidos.
export async function librosRecientes(cliente: Cliente, cantidad: number) {
  return cliente
    .from("libros")
    .select(COLUMNAS_LIBRO)
    .order("creado_en", { ascending: false })
    .limit(cantidad);
}

export async function proyectosRecientes(cliente: Cliente, cantidad: number) {
  return cliente
    .from("proyectos")
    .select("id, nombre, descripcion, actualizado_en")
    .order("actualizado_en", { ascending: false })
    .limit(cantidad);
}
