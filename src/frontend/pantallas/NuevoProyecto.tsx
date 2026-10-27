import Link from "next/link";
import FormularioProyecto from "@/frontend/components/FormularioProyecto";
import styles from "./Seccion.module.css";

export default function NuevoProyecto() {
  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Nuevo proyecto</h1>
        <Link href="/proyectos" className={styles.accion}>
          Volver a proyectos
        </Link>
      </div>
      <FormularioProyecto />
    </main>
  );
}
