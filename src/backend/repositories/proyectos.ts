import "server-only";
import type { Cliente } from "./clienteLibre";

export async function listarProyectos(cliente: Cliente) {
  return cliente.from("proyectos").select("id, nombre, descripcion").order("nombre");
}

export async function obtenerProyecto(cliente: Cliente, id: string) {
  return cliente.from("proyectos").select("id, nombre, descripcion").eq("id", id).maybeSingle();
}

export async function insertarProyecto(cliente: Cliente, datos: { nombre: string; descripcion: string | null }) {
  return cliente.from("proyectos").insert(datos).select("id").single();
}

export async function actualizarProyecto(
  cliente: Cliente,
  id: string,
  datos: { nombre: string; descripcion: string | null },
) {
  return cliente.from("proyectos").update(datos).eq("id", id).select("id");
}
