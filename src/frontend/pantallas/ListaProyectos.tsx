import Link from "next/link";
import { listarProyectos } from "@/backend/controllers/lecturas";
import styles from "./Seccion.module.css";

export default async function ListaProyectos() {
  const proyectos = await listarProyectos();

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Proyectos</h1>
        <Link href="/proyectos/nuevo" className={styles.accion}>
          Nuevo proyecto
        </Link>
      </div>

      {proyectos.length === 0 ? (
        <p className={styles.vacio}>Todavía no has creado ningún proyecto de estudio.</p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de proyectos">
          {proyectos.map((p) => (
            <li key={p.id} className={styles.elemento}>
              <Link href={`/proyectos/${p.id}`}>{p.nombre}</Link>
              {p.descripcion && <p className={styles.metadatos}>{p.descripcion}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
