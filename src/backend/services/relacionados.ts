import "server-only";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import { listarTodos, listarVinculados, nombreDe } from "@/backend/repositories/relacionados";
import { ENTIDADES, esEntidad, relacionEntre, relacionesDe, type Entidad } from "./catalogo";
import { ESTADOS_LECTURA, TIPOS_RECURSO, esEstadoLectura, esTipoRecurso } from "./fichas";
import { extracto } from "./inicio";
import { esIdentificador } from "./referencias";
import type { Referencia } from "./vinculos";

export type ElementoBreve = { id: string; nombre: string };

// Elemento vinculado con su contexto (cambio conexiones, design D1): una línea de detalle y,
// en las notas, un extracto y la fecha de modificación (la formatea la interfaz).
export type ElementoConexion = ElementoBreve & { detalle: string | null; extracto?: string; modificado?: string };

export type GrupoRelacionados = {
  tipo: Entidad;
  elementos: ElementoConexion[];
  // Elementos aún no vinculados, para ofrecerlos sin duplicar vínculos (spec relaciones).
  candidatos: ElementoBreve[];
};

type Fila = Record<string, unknown>;
const texto = (valor: unknown) => (typeof valor === "string" && valor.trim() ? valor.trim() : null);
const linea = (...partes: unknown[]) => partes.filter((p) => p !== null && p !== undefined && p !== "").join(" · ") || null;

function sitio(url: unknown): string | null {
  try {
    return typeof url === "string" ? new URL(url).hostname.replace(/^www\./, "") : null;
  } catch {
    return null;
  }
}

// Columnas y contexto de cada tipo (§2.8 del documento de especificación).
const CONTEXTO: Record<Entidad, { columnas: string; contexto: (f: Fila) => Omit<ElementoConexion, "id" | "nombre"> }> = {
  nota: {
    columnas: "id, titulo, contenido_texto, actualizado_en",
    contexto: (f) => ({
      detalle: null,
      extracto: extracto(String(f.contenido_texto ?? ""), 110),
      modificado: String(f.actualizado_en ?? ""),
    }),
  },
  libro: {
    columnas: "id, titulo, autores, editorial, anio, estado_lectura",
    contexto: (f) => ({
      detalle: linea(texto(f.autores), texto(f.editorial), f.anio, esEstadoLectura(f.estado_lectura) ? ESTADOS_LECTURA[f.estado_lectura] : null),
    }),
  },
  recurso: {
    columnas: "id, titulo, tipo, autor, url",
    contexto: (f) => ({
      detalle: linea(esTipoRecurso(f.tipo) ? TIPOS_RECURSO[f.tipo] : null, texto(f.autor), sitio(f.url)),
    }),
  },
  proyecto: {
    columnas: "id, nombre, descripcion",
    contexto: (f) => ({ detalle: texto(f.descripcion) ? extracto(String(f.descripcion), 90) : null }),
  },
};

function aBreve(fila: Fila | null, campo: string): ElementoBreve | null {
  if (!fila || typeof fila.id !== "string") return null;
  return { id: fila.id, nombre: String(fila[campo] ?? "") };
}

// Elementos relacionados con uno dado, agrupados por tipo y con su contexto (spec relaciones:
// "Elementos relacionados visibles"). Cada elemento aparece una sola vez.
export async function obtenerRelacionados(cliente: Cliente, { tipo, id }: Referencia): Promise<GrupoRelacionados[]> {
  return Promise.all(
    relacionesDe(tipo).map(async ({ relacion, otra }) => {
      const destino = ENTIDADES[otra];
      const [vinculados, todos] = await Promise.all([
        listarVinculados(cliente, relacion.tabla, ENTIDADES[tipo].columnaVinculo, id, destino.tabla, CONTEXTO[otra].columnas),
        listarTodos(cliente, destino.tabla, destino.campoNombre),
      ]);
      if (vinculados.error) throw vinculados.error;
      if (todos.error) throw todos.error;

      const elementos = vinculados.data
        .map((fila) => {
          const datos = fila[destino.tabla] as Fila | null;
          const breve = aBreve(datos, destino.campoNombre);
          return breve && datos ? { ...breve, ...CONTEXTO[otra].contexto(datos) } : null;
        })
        .filter((e): e is ElementoConexion => e !== null)
        .sort((x, y) => x.nombre.localeCompare(y.nombre, "es"));
      const yaVinculados = new Set(elementos.map((e) => e.id));
      const candidatos = todos.data
        .map((fila) => aBreve(fila, destino.campoNombre))
        .filter((e): e is ElementoBreve => e !== null && !yaVinculados.has(e.id));

      return { tipo: otra, elementos, candidatos };
    }),
  );
}

// Destino de «Nueva nota vinculada» (design D5): «tipo:id» de un elemento propio que se puede
// vincular con una nota. null si no es válido o no existe.
export async function destinoNotaVinculada(cliente: Cliente, valor: unknown): Promise<(Referencia & { nombre: string }) | null> {
  if (typeof valor !== "string") return null;
  const [tipo, id] = valor.split(":");
  if (!esEntidad(tipo) || tipo === "nota" || !relacionEntre("nota", tipo) || !esIdentificador(id)) return null;
  const { data, error } = await nombreDe(cliente, ENTIDADES[tipo].tabla, ENTIDADES[tipo].campoNombre, id);
  if (error || !data) return null;
  return { tipo, id, nombre: String(data[ENTIDADES[tipo].campoNombre] ?? "") };
}
