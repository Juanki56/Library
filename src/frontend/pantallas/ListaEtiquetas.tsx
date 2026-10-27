import Link from "next/link";
import { eliminarEtiqueta } from "@/backend/controllers/etiquetas";
import { listarEtiquetasConAviso } from "@/backend/controllers/lecturas";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import { NuevaEtiqueta, RenombrarEtiqueta } from "@/frontend/components/FormulariosEtiqueta";
import styles from "./Seccion.module.css";

// Etiquetas: crear, renombrar y eliminar con advertencia (spec etiquetas).
export default async function ListaEtiquetas() {
  const etiquetas = await listarEtiquetasConAviso();

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Etiquetas</h1>
      </div>

      <NuevaEtiqueta />
      <div className={styles.separacion} />

      {etiquetas.length === 0 ? (
        <p className={styles.vacio}>
          Todavía no tienes etiquetas. También puedes crearlas al etiquetar una nota, un libro, un proyecto o un
          recurso.
        </p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de etiquetas">
          {etiquetas.map((e) => (
            <li key={e.id} className={`${styles.elemento} ${styles.filaAcciones}`}>
              <Link href={`/etiquetas/${e.id}`}>{e.nombre}</Link>
              <div className={styles.accionesFila}>
                <RenombrarEtiqueta id={e.id} nombre={e.nombre} />
                <ConfirmarEliminacion
                  id={e.id}
                  nombre={e.nombre}
                  aviso={e.aviso}
                  accion={eliminarEtiqueta}
                  etiquetaBoton={`Eliminar la etiqueta «${e.nombre}»`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
