import Link from "next/link";
import { listarLibros } from "@/backend/controllers/lecturas";
import { ESTADOS_LECTURA } from "@/backend/services/fichas";
import type { Libro } from "@/backend/services/libros";
import styles from "./Seccion.module.css";

export function referencia(libro: Pick<Libro, "autores" | "anio" | "editorial">) {
  return [libro.autores, libro.editorial, libro.anio].filter((v) => v !== null && v !== "").join(" · ");
}

// Cada libro aparece una sola vez aunque esté en varios proyectos (spec libros).
export default async function ListaLibros() {
  const libros = await listarLibros();

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Libros</h1>
        <Link href="/libros/nuevo" className={styles.accion}>
          Nuevo libro
        </Link>
      </div>

      {libros.length === 0 ? (
        <p className={styles.vacio}>Todavía no has añadido ningún libro.</p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de libros">
          {libros.map((l) => (
            <li key={l.id} className={styles.elemento}>
              <Link href={`/libros/${l.id}`}>{l.titulo}</Link>
              {(referencia(l) || l.estadoLectura) && (
                <p className={styles.metadatos}>
                  {[referencia(l), l.estadoLectura && ESTADOS_LECTURA[l.estadoLectura]].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
