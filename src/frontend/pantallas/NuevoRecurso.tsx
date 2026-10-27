import Link from "next/link";
import FormularioRecurso from "@/frontend/components/FormularioRecurso";
import styles from "./Seccion.module.css";

export default function NuevoRecurso() {
  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Nuevo recurso</h1>
        <Link href="/recursos" className={styles.accion}>
          Volver a fuentes y recursos
        </Link>
      </div>
      <FormularioRecurso />
    </main>
  );
}
