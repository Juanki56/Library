import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/inicio";
import { listarCitas, type Cita } from "./citas";

// Contenido de Inicio: notas recientes, libros y citas recientes (spec navegacion).

export type NotaReciente = {
  id: string;
  titulo: string;
  extracto: string;
  actualizadoEn: string;
  proyectos: string[];
};

export type LibroReciente = {
  id: string;
  titulo: string;
  autores: string | null;
  anio: number | null;
  editorial: string | null;
};

const NOTAS = 5;
const LIBROS = 4;
const CITAS = 3;
const LONGITUD_EXTRACTO = 160;

// Primera línea con texto, recortada sin partir palabras.
export function extracto(texto: string, longitud = LONGITUD_EXTRACTO): string {
  const linea = texto.split("\n").find((l) => l.trim())?.trim() ?? "";
  if (linea.length <= longitud) return linea;
  const corte = linea.slice(0, longitud);
  return `${corte.slice(0, corte.lastIndexOf(" ") > 0 ? corte.lastIndexOf(" ") : longitud)}…`;
}

export async function contenidoInicio(
  cliente: Cliente,
): Promise<{ notas: NotaReciente[]; libros: LibroReciente[]; citas: Cita[] }> {
  const [notas, libros, citas] = await Promise.all([
    repo.notasRecientes(cliente, NOTAS),
    repo.librosRecientes(cliente, LIBROS),
    listarCitas(cliente, CITAS),
  ]);
  if (notas.error) throw notas.error;
  if (libros.error) throw libros.error;

  return {
    notas: notas.data.map((n) => ({
      id: n.id,
      titulo: n.titulo,
      extracto: extracto(n.contenido_texto),
      actualizadoEn: n.actualizado_en,
      proyectos: n.nota_proyecto
        .map((v) => v.proyectos?.nombre)
        .filter((nombre): nombre is string => Boolean(nombre))
        .sort((a, b) => a.localeCompare(b, "es")),
    })),
    libros: libros.data,
    citas,
  };
}
