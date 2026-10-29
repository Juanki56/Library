import Link from "next/link";
import type { TipoBusqueda } from "@/backend/services/busqueda";
import type { FiltrosBusqueda } from "@/backend/services/filtros";
import styles from "./PanelFiltros.module.css";

type Opcion = { id: string; nombre: string };
type Props = {
  consulta: string;
  filtro?: TipoBusqueda;
  filtros: FiltrosBusqueda;
  opciones: { etiquetas: Opcion[]; proyectos: Opcion[]; libros: Opcion[] };
  abierto: boolean;
};

function Lista({ nombre, etiqueta, opciones, valor }: { nombre: string; etiqueta: string; opciones: Opcion[]; valor?: string }) {
  return (
    <label className={styles.campo}>
      {etiqueta}
      <select name={nombre} defaultValue={valor ?? ""}>
        <option value="">Cualquiera</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

// Panel «Filtros» de la búsqueda (cambio filtros-citas-busqueda, design D2): formulario GET, así los
// filtros quedan en la dirección. Conserva el texto buscado y el tipo elegido.
export default function PanelFiltros({ consulta, filtro, filtros, opciones, abierto }: Props) {
  const quitar = `/buscar?${new URLSearchParams({ ...(consulta ? { q: consulta } : {}), ...(filtro ? { tipo: filtro } : {}) })}`;
  return (
    <details className={styles.panel} open={abierto}>
      <summary>Filtros</summary>
      <form action="/buscar" method="get" className={styles.formulario} aria-label="Filtros de búsqueda">
        {consulta && <input type="hidden" name="q" value={consulta} />}
        {filtro && <input type="hidden" name="tipo" value={filtro} />}
        <label className={styles.campo}>
          Autor
          <input name="autor" type="text" defaultValue={filtros.autor ?? ""} maxLength={100} placeholder="Por ejemplo: Marx" />
        </label>
        <Lista nombre="etiqueta" etiqueta="Etiqueta" opciones={opciones.etiquetas} valor={filtros.etiqueta} />
        <Lista nombre="proyecto" etiqueta="Proyecto" opciones={opciones.proyectos} valor={filtros.proyecto} />
        <Lista nombre="libro" etiqueta="Libro" opciones={opciones.libros} valor={filtros.libro} />
        <label className={styles.campo}>
          Modificado desde
          <input name="desde" type="date" defaultValue={filtros.desde ?? ""} />
        </label>
        <label className={styles.campo}>
          Hasta
          <input name="hasta" type="date" defaultValue={filtros.hasta ?? ""} />
        </label>
        <div className={styles.acciones}>
          <button type="submit" className={styles.aplicar}>
            Aplicar filtros
          </button>
          {abierto && (
            <Link href={quitar} className={styles.quitar}>
              Quitar filtros
            </Link>
          )}
        </div>
      </form>
    </details>
  );
}
