// Entidades del archivo y las relaciones que permiten las specs (design D3).
// Es la única fuente de verdad sobre qué se puede vincular con qué.

export type Entidad = "proyecto" | "nota" | "libro" | "recurso";

export const ENTIDADES: Record<
  Entidad,
  { tabla: string; columnaVinculo: string; plural: string; campoNombre: string; ruta: string }
> = {
  proyecto: { tabla: "proyectos", columnaVinculo: "proyecto_id", plural: "proyectos", campoNombre: "nombre", ruta: "/proyectos" },
  nota: { tabla: "notas", columnaVinculo: "nota_id", plural: "notas", campoNombre: "titulo", ruta: "/notas" },
  libro: { tabla: "libros", columnaVinculo: "libro_id", plural: "libros", campoNombre: "titulo", ruta: "/libros" },
  recurso: { tabla: "recursos", columnaVinculo: "recurso_id", plural: "recursos", campoNombre: "titulo", ruta: "/recursos" },
};

export type Relacion = { tabla: string; a: Entidad; b: Entidad };

// nota_*: spec notas · libro_proyecto: spec libros · recurso_*: spec fuentes-recursos.
export const RELACIONES: Relacion[] = [
  { tabla: "nota_proyecto", a: "nota", b: "proyecto" },
  { tabla: "nota_libro", a: "nota", b: "libro" },
  { tabla: "nota_recurso", a: "nota", b: "recurso" },
  { tabla: "libro_proyecto", a: "libro", b: "proyecto" },
  { tabla: "recurso_proyecto", a: "recurso", b: "proyecto" },
  { tabla: "recurso_libro", a: "recurso", b: "libro" },
];

export function esEntidad(valor: unknown): valor is Entidad {
  return typeof valor === "string" && valor in ENTIDADES;
}

// Relación entre dos tipos, en cualquier orden. null si las specs no la contemplan.
export function relacionEntre(x: Entidad, y: Entidad): Relacion | null {
  return RELACIONES.find((r) => (r.a === x && r.b === y) || (r.a === y && r.b === x)) ?? null;
}

// Relaciones en las que participa un tipo, con la entidad del otro extremo.
export function relacionesDe(entidad: Entidad): { relacion: Relacion; otra: Entidad }[] {
  return RELACIONES.filter((r) => r.a === entidad || r.b === entidad).map((relacion) => ({
    relacion,
    otra: relacion.a === entidad ? relacion.b : relacion.a,
  }));
}
