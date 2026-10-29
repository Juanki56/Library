import Link from "next/link";
import { notFound } from "next/navigation";
import {
  etiquetasElemento,
  obtenerProyecto,
  obtenerRelacionados,
  organizacionProyecto,
} from "@/backend/controllers/lecturas";
import { eliminarProyecto } from "@/backend/controllers/proyectos";
import ApartadosProyecto from "@/frontend/components/ApartadosProyecto";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import Conexiones from "@/frontend/components/Conexiones";
import FormularioProyecto from "@/frontend/components/FormularioProyecto";
import styles from "./Seccion.module.css";

// Página del proyecto: sus datos, sus apartados y sus notas, libros y recursos relacionados (spec proyectos).
export default async function Proyecto({ id }: { id: string }) {
  const proyecto = await obtenerProyecto(id);
  if (!proyecto) notFound();
  const [organizacion, relacionados, etiquetas] = await Promise.all([
    organizacionProyecto(id),
    obtenerRelacionados("proyecto", id),
    etiquetasElemento("proyecto", id),
  ]);

  return (
    <main className={styles.paginaDetalle}>
      <div className={styles.contenidoDetalle}>
        <div className={styles.encabezado}>
          <h1>{proyecto.nombre}</h1>
          <Link href="/proyectos" className={styles.accion}>
            Volver a proyectos
          </Link>
        </div>

        <FormularioProyecto proyecto={proyecto} />
        <ApartadosProyecto proyectoId={proyecto.id} organizacion={organizacion} />

        <div className={styles.acciones}>
          <span />
          <ConfirmarEliminacion
            id={proyecto.id}
            nombre={proyecto.nombre}
            avisoDe="proyecto"
            accion={eliminarProyecto}
          />
        </div>
      </div>
      <Conexiones tipo="proyecto" id={proyecto.id} grupos={relacionados} etiquetas={etiquetas} />
    </main>
  );
}
