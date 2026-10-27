import "server-only";
import { sinTipos, type Cliente } from "./clienteLibre";

export async function existeEntidad(cliente: Cliente, tabla: string, id: string) {
  return sinTipos(cliente).from(tabla).select("id", { count: "exact", head: true }).eq("id", id);
}

// Las tablas de vínculo se limpian solas por ON DELETE CASCADE (design D3).
export async function borrarEntidad(cliente: Cliente, tabla: string, id: string) {
  return sinTipos(cliente).from(tabla).delete().eq("id", id).select("id");
}
