import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import { listarTodos, listarVinculados } from "@/backend/repositories/relacionados";
import { ENTIDADES, relacionesDe, type Entidad } from "./catalogo";
import type { Referencia } from "./vinculos";

export type ElementoBreve = { id: string; nombre: string };
export type GrupoRelacionados = {
  tipo: Entidad;
  elementos: ElementoBreve[];
  // Elementos aún no vinculados, para ofrecerlos sin duplicar vínculos (spec relaciones).
  candidatos: ElementoBreve[];
};

function aBreve(fila: Record<string, unknown> | null, campo: string): ElementoBreve | null {
  if (!fila || typeof fila.id !== "string") return null;
  return { id: fila.id, nombre: String(fila[campo] ?? "") };
}

// Elementos relacionados con uno dado, agrupados por tipo (spec relaciones:
// "Elementos relacionados visibles"). Cada elemento aparece una sola vez.
export async function obtenerRelacionados(cliente: Cliente, { tipo, id }: Referencia): Promise<GrupoRelacionados[]> {
  return Promise.all(
    relacionesDe(tipo).map(async ({ relacion, otra }) => {
      const destino = ENTIDADES[otra];
      const [vinculados, todos] = await Promise.all([
        listarVinculados(cliente, relacion.tabla, ENTIDADES[tipo].columnaVinculo, id, destino.tabla, destino.campoNombre),
        listarTodos(cliente, destino.tabla, destino.campoNombre),
      ]);
      if (vinculados.error) throw vinculados.error;
      if (todos.error) throw todos.error;

      const elementos = vinculados.data
        .map((fila) => aBreve(fila[destino.tabla] as Record<string, unknown> | null, destino.campoNombre))
        .filter((e): e is ElementoBreve => e !== null)
        .sort((x, y) => x.nombre.localeCompare(y.nombre, "es"));
      const yaVinculados = new Set(elementos.map((e) => e.id));
      const candidatos = todos.data
        .map((fila) => aBreve(fila, destino.campoNombre))
        .filter((e): e is ElementoBreve => e !== null && !yaVinculados.has(e.id));

      return { tipo: otra, elementos, candidatos };
    }),
  );
}
