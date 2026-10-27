import "server-only";
import { sinTipos, type Cliente, type FilaLibre } from "./clienteLibre";

// Inserta el vínculo; si ya existe no hace nada (ON CONFLICT DO NOTHING).
export async function insertarVinculo(cliente: Cliente, tabla: string, fila: FilaLibre) {
  return sinTipos(cliente).from(tabla).upsert(fila, { ignoreDuplicates: true });
}

export async function borrarVinculo(cliente: Cliente, tabla: string, fila: Record<string, string>) {
  let consulta = sinTipos(cliente).from(tabla).delete();
  for (const [columna, valor] of Object.entries(fila)) consulta = consulta.eq(columna, valor);
  return consulta;
}

export async function contarVinculos(cliente: Cliente, tabla: string, columna: string, id: string) {
  return sinTipos(cliente)
    .from(tabla)
    .select("*", { count: "exact", head: true })
    .eq(columna, id);
}
