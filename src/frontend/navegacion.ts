// Las ocho áreas del menú principal (§6 del documento de especificación), en un único lugar.
// El orden y el diseño definitivos siguen pendientes. Las secciones acordadas que aún no
// están implementadas se muestran sin enlace hasta que existan.
export type Icono =
  | "inicio"
  | "proyectos"
  | "libros"
  | "notas"
  | "recursos"
  | "etiquetas"
  | "glosario"
  | "citas";

export const SECCIONES: { ruta: string; texto: string; icono: Icono; disponible: boolean }[] = [
  { ruta: "/", texto: "Inicio", icono: "inicio", disponible: true },
  { ruta: "/proyectos", texto: "Proyectos", icono: "proyectos", disponible: true },
  { ruta: "/libros", texto: "Libros", icono: "libros", disponible: true },
  { ruta: "/notas", texto: "Notas", icono: "notas", disponible: true },
  { ruta: "/recursos", texto: "Fuentes y recursos", icono: "recursos", disponible: true },
  { ruta: "/etiquetas", texto: "Etiquetas", icono: "etiquetas", disponible: false },
  { ruta: "/glosario", texto: "Glosario", icono: "glosario", disponible: false },
  { ruta: "/citas", texto: "Citas", icono: "citas", disponible: false },
];

// Los elementos de secciones que aún no existen se muestran sin enlace.
export function existeSeccion(ruta: string) {
  return SECCIONES.some((s) => s.ruta === ruta && s.disponible);
}

// Sección activa: Inicio solo en "/", las demás también en sus subpáginas.
export function esActiva(ruta: string, actual: string) {
  return ruta === "/" ? actual === "/" : actual === ruta || actual.startsWith(`${ruta}/`);
}
