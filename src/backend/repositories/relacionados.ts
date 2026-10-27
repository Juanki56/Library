import "server-only";
import { sinTipos, type Cliente, type FilaLibre } from "./clienteLibre";

// Elementos del otro extremo de una tabla de vínculo, embebidos por su clave foránea.
export async function listarVinculados(
  cliente: Cliente,
  tablaVinculo: string,
  columnaPropia: string,
  id: string,
  tablaOtra: string,
  campoNombre: string,
) {
  return sinTipos(cliente)
    .from(tablaVinculo)
    .select(`${tablaOtra}(id, ${campoNombre})`)
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
