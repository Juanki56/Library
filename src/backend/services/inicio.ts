import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/inicio";
import { listarCitas, type Cita } from "./citas";

// Contenido de Inicio (spec navegacion, decidido el 2026-10-28): notas recientes, «Leyendo ahora»
// (o los últimos libros añadidos), proyectos recientes y citas. Sin métricas ni contadores.

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

export type ProyectoReciente = { id: string; nombre: string; descripcion: string | null; actualizadoEn: string };

const NOTAS = 5;
const LIBROS = 4;
const PROYECTOS = 4;
const CITAS = 3;
const LONGITUD_EXTRACTO = 160;

// Primera línea con texto, recortada sin partir palabras.
export function extracto(texto: string, longitud = LONGITUD_EXTRACTO): string {
  const linea = texto.split("\n").find((l) => l.trim())?.trim() ?? "";
  if (linea.length <= longitud) return linea;
  const corte = linea.slice(0, longitud);
  return `${corte.slice(0, corte.lastIndexOf(" ") > 0 ? corte.lastIndexOf(" ") : longitud)}…`;
}

export type ContenidoInicio = {
  notas: NotaReciente[];
  // «leyendo»: libros en lectura; «recientes»: no hay ninguno en lectura y se muestran los últimos añadidos.
  libros: { modo: "leyendo" | "recientes"; lista: LibroReciente[] };
  proyectos: ProyectoReciente[];
  citas: Cita[];
};

export async function contenidoInicio(cliente: Cliente): Promise<ContenidoInicio> {
  const [notas, leyendo, proyectos, citas] = await Promise.all([
    repo.notasRecientes(cliente, NOTAS),
    repo.librosLeyendo(cliente, LIBROS),
    repo.proyectosRecientes(cliente, PROYECTOS),
    listarCitas(cliente, CITAS),
  ]);
  if (notas.error) throw notas.error;
  if (leyendo.error) throw leyendo.error;
  if (proyectos.error) throw proyectos.error;

  let libros: ContenidoInicio["libros"] = { modo: "leyendo", lista: leyendo.data };
  if (!leyendo.data.length) {
    const recientes = await repo.librosRecientes(cliente, LIBROS);
    if (recientes.error) throw recientes.error;
    libros = { modo: "recientes", lista: recientes.data };
  }

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
    libros,
    proyectos: proyectos.data.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      actualizadoEn: p.actualizado_en,
    })),
    citas,
  };
}
