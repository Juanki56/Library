import "server-only";
import * as repo from "@/backend/repositories/busqueda";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import { fragmento, terminosDe, type ParteFragmento } from "./fragmento";

// Búsqueda global (spec busqueda, design D5).

export const TIPOS_BUSQUEDA = ["proyecto", "nota", "libro", "recurso", "cita", "termino"] as const;
export type TipoBusqueda = (typeof TIPOS_BUSQUEDA)[number];

const RUTA: Record<TipoBusqueda, string> = {
  proyecto: "/proyectos",
  nota: "/notas",
  libro: "/libros",
  recurso: "/recursos",
  cita: "/citas",
  termino: "/glosario",
};

export type Resultado = {
  tipo: TipoBusqueda;
  id: string;
  titulo: string;
  ruta: string;
  fragmento: ParteFragmento[];
  // Proyectos y libros de una nota: la nota aparece una vez, con sus relaciones (spec busqueda).
  relaciones: string[];
};

export function esTipoBusqueda(valor: unknown): valor is TipoBusqueda {
  return typeof valor === "string" && (TIPOS_BUSQUEDA as readonly string[]).includes(valor);
}

export async function buscar(cliente: Cliente, consulta: string, filtro?: TipoBusqueda): Promise<Resultado[]> {
  const terminos = terminosDe(consulta);
  if (terminos.length === 0) return [];

  const { data, error } = await repo.buscar(cliente, terminos.join(" "), filtro);
  if (error) throw error;

  const idsNotas = data.filter((r) => r.tipo === "nota").map((r) => r.id);
  const relaciones = new Map<string, string[]>();
  if (idsNotas.length) {
    const [proyectos, libros] = await repo.relacionesDeNotas(cliente, idsNotas);
    if (proyectos.error) throw proyectos.error;
    if (libros.error) throw libros.error;
    const anadir = (id: string, nombre: string | undefined) => {
      if (!nombre) return;
      relaciones.set(id, [...(relaciones.get(id) ?? []), nombre]);
    };
    proyectos.data.forEach((f) => anadir(f.nota_id, f.proyectos?.nombre));
    libros.data.forEach((f) => anadir(f.nota_id, f.libros?.titulo));
  }

  return data
    .filter((r): r is typeof r & { tipo: TipoBusqueda } => esTipoBusqueda(r.tipo))
    .map((r) => ({
      tipo: r.tipo,
      id: r.id,
      titulo: r.titulo,
      ruta: `${RUTA[r.tipo]}/${r.id}`,
      fragmento: fragmento(r.cuerpo, terminos),
      relaciones: (relaciones.get(r.id) ?? []).sort((x, y) => x.localeCompare(y, "es")),
    }));
}
