import "server-only";
import { sinTipos, type Cliente, type FilaLibre } from "./clienteLibre";

// Elementos del otro extremo de una tabla de vínculo, embebidos por su clave foránea,
// con las columnas que pida el servicio (nombre y contexto).
export async function listarVinculados(
  cliente: Cliente,
  tablaVinculo: string,
  columnaPropia: string,
  id: string,
  tablaOtra: string,
  columnas: string,
) {
  return sinTipos(cliente)
    .from(tablaVinculo)
    .select(`${tablaOtra}(${columnas})`)
    .eq(columnaPropia, id)
    .overrideTypes<FilaLibre[], { merge: false }>();
}

// Todos los elementos de un tipo, para elegir con cuál vincular.
export async function listarTodos(cliente: Cliente, tabla: string, campoNombre: string) {
  return sinTipos(cliente)
    .from(tabla)
    .select(`id, ${campoNombre}`)
    .order(campoNombre)
    .overrideTypes<FilaLibre[], { merge: false }>();
}

// Nombre de un elemento concreto (para «Nueva nota vinculada»).
export async function nombreDe(cliente: Cliente, tabla: string, campoNombre: string, id: string) {
  return sinTipos(cliente)
    .from(tabla)
    .select(`id, ${campoNombre}`)
    .eq("id", id)
    .maybeSingle()
    .overrideTypes<FilaLibre | null, { merge: false }>();
}
