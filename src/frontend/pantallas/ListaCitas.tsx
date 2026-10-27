import Link from "next/link";
import { listarCitas } from "@/backend/controllers/lecturas";
import VistaCita from "@/frontend/components/VistaCita";
import styles from "./Seccion.module.css";

// Citas, frases de autor y proverbios; las más recientes primero (spec citas).
export default async function ListaCitas() {
  const citas = await listarCitas();

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Citas</h1>
        <Link href="/citas/nueva" className={styles.accion}>
          Nueva cita
        </Link>
      </div>

      {citas.length === 0 ? (
        <p className={styles.vacio}>Todavía no has guardado ninguna cita, frase ni proverbio.</p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de citas">
          {citas.map((c) => (
            <li key={c.id} className={styles.elementoCita}>
              <VistaCita cita={c} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
