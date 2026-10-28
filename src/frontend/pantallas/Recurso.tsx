import Link from "next/link";
import { notFound } from "next/navigation";
import {
  avisoEliminacion,
  citasDe,
  etiquetasElemento,
  obtenerRecurso,
  obtenerRelacionados,
} from "@/backend/controllers/lecturas";
import { eliminarRecurso } from "@/backend/controllers/recursos";
import CitasEnlazadas from "@/frontend/components/CitasEnlazadas";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import ElementosRelacionados from "@/frontend/components/ElementosRelacionados";
import EtiquetasElemento from "@/frontend/components/EtiquetasElemento";
import FormularioRecurso from "@/frontend/components/FormularioRecurso";
import { TIPOS_RECURSO } from "@/backend/services/fichas";
import { fechaDia } from "./fechas";
import styles from "./Seccion.module.css";

// Página del recurso: sus datos y los proyectos, libros y notas con que se relaciona (spec fuentes-recursos).
export default async function Recurso({ id }: { id: string }) {
  const recurso = await obtenerRecurso(id);
  if (!recurso) notFound();
  const [relacionados, aviso, citas, etiquetas] = await Promise.all([
    obtenerRelacionados("recurso", id),
    avisoEliminacion("recurso", id),
    citasDe("recurso", id),
    etiquetasElemento("recurso", id),
  ]);

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1>{recurso.titulo}</h1>
          <p className={styles.metadatos}>
            {[TIPOS_RECURSO[recurso.tipo], recurso.autor, recurso.fecha_publicacion && fechaDia(recurso.fecha_publicacion)]
              .filter(Boolean)
              .join(" · ")}
          </p>
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
      <EtiquetasElemento tipo="recurso" id={recurso.id} propias={etiquetas.propias} todas={etiquetas.todas} />
      <ElementosRelacionados tipo="recurso" id={recurso.id} grupos={relacionados} />
      <CitasEnlazadas citas={citas} />

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
