import type { JSONContent } from "@tiptap/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  avisoEliminacion,
  etiquetasElemento,
  obtenerNota,
  obtenerRelacionados,
} from "@/backend/controllers/lecturas";
import { eliminarNota } from "@/backend/controllers/notas";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import ElementosRelacionados from "@/frontend/components/ElementosRelacionados";
import EtiquetasElemento from "@/frontend/components/EtiquetasElemento";
import FormularioNota from "@/frontend/components/FormularioNota";
import { fecha } from "./fechas";
import styles from "./Seccion.module.css";

export default async function Nota({ id }: { id: string }) {
  const nota = await obtenerNota(id);
  if (!nota) notFound();
  const [relacionados, aviso, etiquetas] = await Promise.all([
    obtenerRelacionados("nota", id),
    avisoEliminacion("nota", id),
    etiquetasElemento("nota", id),
  ]);

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <p className={styles.metadatos}>
          Creada el {fecha(nota.creadoEn)} · Modificada el {fecha(nota.actualizadoEn)}
        </p>
        <Link href="/notas" className={styles.accion}>
          Volver a notas
        </Link>
      </div>

      <FormularioNota
        id={nota.id}
        titulo={nota.titulo}
        contenido={nota.contenido as JSONContent}
      />
      <EtiquetasElemento tipo="nota" id={nota.id} propias={etiquetas.propias} todas={etiquetas.todas} />
      <ElementosRelacionados tipo="nota" id={nota.id} grupos={relacionados} />

      <div className={styles.acciones}>
        <span />
        <ConfirmarEliminacion id={nota.id} nombre={nota.titulo} aviso={aviso ?? ""} accion={eliminarNota} />
      </div>
    </main>
  );
}
