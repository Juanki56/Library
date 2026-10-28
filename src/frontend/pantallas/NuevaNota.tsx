import Link from "next/link";
import { destinoNotaVinculada } from "@/backend/controllers/lecturas";
import FormularioNuevaNota from "@/frontend/components/FormularioNuevaNota";
import styles from "./Seccion.module.css";

// Con «vincular», la nota nace vinculada al libro, recurso o proyecto indicado (cambio conexiones).
export default async function NuevaNota({ vincular }: { vincular?: string }) {
  const destino = vincular ? await destinoNotaVinculada(vincular) : null;
  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Nueva nota</h1>
        <Link href="/notas" className={styles.accion}>
          Volver a notas
        </Link>
      </div>
      <FormularioNuevaNota vincular={destino ? { valor: `${destino.tipo}:${destino.id}`, nombre: destino.nombre } : undefined} />
    </main>
  );
}
