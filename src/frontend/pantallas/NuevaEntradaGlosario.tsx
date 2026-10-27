import Link from "next/link";
import FormularioGlosario from "@/frontend/components/FormularioGlosario";
import styles from "./Seccion.module.css";

export default function NuevaEntradaGlosario() {
  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Nuevo término</h1>
        <Link href="/glosario" className={styles.accion}>
          Volver al glosario
        </Link>
      </div>
      <FormularioGlosario />
    </main>
  );
}
