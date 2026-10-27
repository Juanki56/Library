import Link from "next/link";
import { listarRecursos } from "@/backend/controllers/lecturas";
import styles from "./Seccion.module.css";

// Cada recurso aparece una sola vez aunque esté en varios espacios (spec fuentes-recursos).
export default async function ListaRecursos() {
  const recursos = await listarRecursos();

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Fuentes y recursos</h1>
        <Link href="/recursos/nuevo" className={styles.accion}>
          Nuevo recurso
        </Link>
      </div>

      {recursos.length === 0 ? (
        <p className={styles.vacio}>Todavía no has guardado ninguna fuente ni recurso.</p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de recursos">
          {recursos.map((r) => (
            <li key={r.id} className={styles.elemento}>
              <Link href={`/recursos/${r.id}`}>{r.titulo}</Link>
              {(r.autor || r.url) && (
                <p className={styles.metadatos}>{[r.autor, r.url && new URL(r.url).hostname].filter(Boolean).join(" · ")}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
