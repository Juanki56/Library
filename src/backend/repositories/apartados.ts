import "server-only";
import { sinTipos, type Cliente } from "./clienteLibre";

export async function listarApartados(cliente: Cliente, proyectoId: string) {
  return cliente
    .from("apartados")
    .select("id, titulo, descripcion, posicion")
    .eq("proyecto_id", proyectoId)
    .order("posicion")
    .order("creado_en");
}

export async function insertarApartado(
  cliente: Cliente,
  datos: { proyecto_id: string; titulo: string; descripcion: string | null; posicion: number },
) {
  return cliente.from("apartados").insert(datos).select("id").single();
}

export async function actualizarApartado(
  cliente: Cliente,
  id: string,
  datos: { titulo: string; descripcion: string | null },
) {
  return cliente.from("apartados").update(datos).eq("id", id).select("id");
}

export async function borrarApartado(cliente: Cliente, id: string) {
  return cliente.from("apartados").delete().eq("id", id).select("id");
}

export async function moverApartado(cliente: Cliente, id: string, direccion: "subir" | "bajar") {
  return cliente.rpc("mover_apartado", { apartado: id, direccion });
}

// Asignaciones de un proyecto en una tabla de asignación (apartado_nota, apartado_libro…).
export async function listarAsignaciones(cliente: Cliente, tabla: string, columna: string, proyectoId: string) {
  return sinTipos(cliente)
    .from(tabla)
    .select(`apartado_id, ${columna}`)
    .eq("proyecto_id", proyectoId)
    .overrideTypes<Record<string, string>[], { merge: false }>();
}

// Si ya existe la asignación no hace nada (ON CONFLICT DO NOTHING).
export async function insertarAsignacion(cliente: Cliente, tabla: string, fila: Record<string, string>) {
  return sinTipos(cliente).from(tabla).upsert(fila, { ignoreDuplicates: true });
}

export async function borrarAsignacion(cliente: Cliente, tabla: string, columna: string, apartadoId: string, id: string) {
  return sinTipos(cliente).from(tabla).delete().eq("apartado_id", apartadoId).eq(columna, id);
}

export async function contarAsignaciones(cliente: Cliente, tabla: string, apartadoId: string) {
  return sinTipos(cliente)
    .from(tabla)
    .select("*", { count: "exact", head: true })
    .eq("apartado_id", apartadoId);
}
