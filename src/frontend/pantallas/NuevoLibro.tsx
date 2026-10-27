import Link from "next/link";
import FormularioLibro from "@/frontend/components/FormularioLibro";
import styles from "./Seccion.module.css";

export default function NuevoLibro() {
  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Nuevo libro</h1>
        <Link href="/libros" className={styles.accion}>
          Volver a libros
        </Link>
      </div>
      <FormularioLibro />
    </main>
  );
}
