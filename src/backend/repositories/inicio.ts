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

export async function librosRecientes(cliente: Cliente, cantidad: number) {
  return cliente
    .from("libros")
    .select("id, titulo, autores, anio, editorial")
    .order("actualizado_en", { ascending: false })
    .limit(cantidad);
}
