import type { Icono as NombreIcono } from "@/frontend/navegacion";

// Iconos de trazo fino y estilo único (1,5 px, extremos redondeados). Decorativos:
// el texto de cada enlace ya nombra la sección.
const TRAZOS: Record<NombreIcono | "buscar" | "salir", React.ReactNode> = {
  inicio: (
    <>
      <path d="M4 9.5 12 5l8 4.5" />
      <path d="M5 9.5h14M4 19.5h16M5.5 17h13" />
      <path d="M7 10v7M10.3 10v7M13.7 10v7M17 10v7" />
    </>
  ),
  proyectos: (
    <>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h3.8l2 2h7.2a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 10.5h17" />
    </>
  ),
  libros: (
    <>
      <path d="M6 4.5h11.5v15H6.8A1.8 1.8 0 0 1 5 17.7V5.5a1 1 0 0 1 1-1z" />
      <path d="M5 16.5a1.8 1.8 0 0 1 1.8-1.8h10.7M9 8h5" />
    </>
  ),
  notas: (
    <>
      <path d="M19.5 4.5c-6 .8-10.4 5.4-12.3 11.8L6 19.5l3-1.4c6.2-1.9 10.6-6.4 10.5-13.6z" />
      <path d="M7.5 16.5 13 11" />
    </>
  ),
  recursos: (
    <>
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-.9.9" />
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l.9-.9" />
    </>
  ),
  etiquetas: (
    <>
      <path d="M4 4.5h7.2l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-4.6 4.6a1.5 1.5 0 0 1-2.1 0L4.5 11.2V5a.5.5 0 0 1 .5-.5z" />
      <circle cx="8.3" cy="8.8" r="1.2" />
    </>
  ),
  glosario: (
    <>
      <path d="M4 18.5 8 6.5l4 12M5.4 14.5h5.2" />
      <path d="M17.3 18.5v-5.2a2.3 2.3 0 0 0-4.3-1.1M17.3 15.3c-3.3-.4-4.6.5-4.6 1.7 0 1 .8 1.6 1.9 1.6 1.6 0 2.7-1.2 2.7-3.3" />
    </>
  ),
  citas: (
    <>
      <path d="M10 7c-2.8.9-4.5 3-4.5 5.8V17H10v-4.5H7.3c.2-1.6 1.2-2.7 3.1-3.4z" />
      <path d="M18.5 7c-2.8.9-4.5 3-4.5 5.8V17h4.5v-4.5h-2.7c.2-1.6 1.2-2.7 3.1-3.4z" />
    </>
  ),
  buscar: (
    <>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4.5 4.5" />
    </>
  ),
  salir: (
    <>
      <path d="M14 5.5H6.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1H14" />
      <path d="M11 12h8.5M16.5 9l3 3-3 3" />
    </>
  ),
};

export default function Icono({ nombre, clase }: { nombre: keyof typeof TRAZOS; clase?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={clase}
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
