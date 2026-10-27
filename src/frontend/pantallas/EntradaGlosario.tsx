import Link from "next/link";
import { notFound } from "next/navigation";
import { eliminarEntrada } from "@/backend/controllers/glosario";
import { obtenerEntradaGlosario } from "@/backend/controllers/lecturas";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import FormularioGlosario from "@/frontend/components/FormularioGlosario";
import styles from "./Seccion.module.css";

export default async function EntradaGlosario({ id }: { id: string }) {
  const entrada = await obtenerEntradaGlosario(id);
  if (!entrada) notFound();

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>{entrada.termino}</h1>
        <Link href="/glosario" className={styles.accion}>
          Volver al glosario
        </Link>
      </div>

      <FormularioGlosario entrada={entrada} />

      <div className={styles.acciones}>
        <span />
        <ConfirmarEliminacion
          id={entrada.id}
          nombre={entrada.termino}
          aviso="El término se eliminará del glosario."
          accion={eliminarEntrada}
        />
      </div>
    </main>
  );
}
