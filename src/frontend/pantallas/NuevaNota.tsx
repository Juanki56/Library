import Link from "next/link";
import FormularioNuevaNota from "@/frontend/components/FormularioNuevaNota";
import styles from "./Seccion.module.css";

export default function NuevaNota() {
  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Nueva nota</h1>
        <Link href="/notas" className={styles.accion}>
          Volver a notas
        </Link>
      </div>
      <FormularioNuevaNota />
    </main>
  );
}
