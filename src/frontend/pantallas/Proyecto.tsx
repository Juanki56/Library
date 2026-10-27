import Link from "next/link";
import { notFound } from "next/navigation";
import { avisoEliminacion, obtenerProyecto, obtenerRelacionados } from "@/backend/controllers/lecturas";
import { eliminarProyecto } from "@/backend/controllers/proyectos";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import ElementosRelacionados from "@/frontend/components/ElementosRelacionados";
import FormularioProyecto from "@/frontend/components/FormularioProyecto";
import styles from "./Seccion.module.css";

// Página del proyecto: sus datos y sus notas, libros y recursos relacionados (spec proyectos).
export default async function Proyecto({ id }: { id: string }) {
  const proyecto = await obtenerProyecto(id);
  if (!proyecto) notFound();
  const [relacionados, aviso] = await Promise.all([
    obtenerRelacionados("proyecto", id),
    avisoEliminacion("proyecto", id),
  ]);

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>{proyecto.nombre}</h1>
        <Link href="/proyectos" className={styles.accion}>
          Volver a proyectos
        </Link>
      </div>

      <FormularioProyecto proyecto={proyecto} />
      <ElementosRelacionados tipo="proyecto" id={proyecto.id} grupos={relacionados} />

      <div className={styles.acciones}>
        <span />
        <ConfirmarEliminacion
          id={proyecto.id}
          nombre={proyecto.nombre}
          aviso={aviso ?? ""}
          accion={eliminarProyecto}
        />
      </div>
    </main>
  );
}
