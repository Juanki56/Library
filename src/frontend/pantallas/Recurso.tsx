import Link from "next/link";
import { notFound } from "next/navigation";
import { avisoEliminacion, obtenerRecurso, obtenerRelacionados } from "@/backend/controllers/lecturas";
import { eliminarRecurso } from "@/backend/controllers/recursos";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import ElementosRelacionados from "@/frontend/components/ElementosRelacionados";
import FormularioRecurso from "@/frontend/components/FormularioRecurso";
import styles from "./Seccion.module.css";

// Página del recurso: sus datos y los proyectos, libros y notas con que se relaciona (spec fuentes-recursos).
export default async function Recurso({ id }: { id: string }) {
  const recurso = await obtenerRecurso(id);
  if (!recurso) notFound();
  const [relacionados, aviso] = await Promise.all([
    obtenerRelacionados("recurso", id),
    avisoEliminacion("recurso", id),
  ]);

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1>{recurso.titulo}</h1>
          {recurso.url && (
            <p className={styles.metadatos}>
              <a href={recurso.url} target="_blank" rel="noopener noreferrer">
                Abrir {new URL(recurso.url).hostname} ↗
              </a>
            </p>
          )}
        </div>
        <Link href="/recursos" className={styles.accion}>
          Volver a fuentes y recursos
        </Link>
      </div>

      <FormularioRecurso recurso={recurso} />
      <ElementosRelacionados tipo="recurso" id={recurso.id} grupos={relacionados} />

      <div className={styles.acciones}>
        <span />
        <ConfirmarEliminacion
          id={recurso.id}
          nombre={recurso.titulo}
          aviso={aviso ?? ""}
          accion={eliminarRecurso}
        />
      </div>
    </main>
  );
}
