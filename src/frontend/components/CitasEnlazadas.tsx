import Link from "next/link";
import type { Cita } from "@/backend/services/citas";
import VistaCita from "./VistaCita";
import styles from "./ElementosRelacionados.module.css";

// Citas enlazadas a un libro o recurso: la misma cita de la sección Citas, no una copia (spec relaciones).
export default function CitasEnlazadas({ citas }: { citas: Cita[] }) {
  return (
    <section aria-labelledby="titulo-citas-enlazadas" className={styles.seccion}>
      <h2 id="titulo-citas-enlazadas" className={styles.titulo}>
        Citas
      </h2>
      {citas.length === 0 ? (
        <p className={styles.vacio}>
          Ninguna cita enlazada. Puedes enlazarlas desde <Link href="/citas">Citas</Link>.
        </p>
      ) : (
        <ul className={styles.lista} aria-label="Citas enlazadas">
          {citas.map((c) => (
            <li key={c.id} className={styles.citaEnlazada}>
              <VistaCita cita={c} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
