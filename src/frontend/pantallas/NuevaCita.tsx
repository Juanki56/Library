import Link from "next/link";
import { opcionesEnlaceCita } from "@/backend/controllers/lecturas";
import FormularioCita from "@/frontend/components/FormularioCita";
import styles from "./Seccion.module.css";

export default async function NuevaCita() {
  const opciones = await opcionesEnlaceCita();
  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Nueva cita</h1>
        <Link href="/citas" className={styles.accion}>
          Volver a citas
        </Link>
      </div>
      <FormularioCita opciones={opciones} />
    </main>
  );
}
