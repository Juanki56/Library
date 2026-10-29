"use client";

import { useActionState, useId, useRef, useState } from "react";
import { avisoParaEliminar } from "@/backend/controllers/relaciones";
import type { Entidad } from "@/backend/services/catalogo";
import styles from "./ConfirmarEliminacion.module.css";

type Estado = { error?: string };
type Props = {
  id: string;
  nombre: string;
  // Aviso ya calculado (apartados) o el elemento cuyo aviso se calcula al abrir el cuadro
  // (cambio rendimiento-paginas): así no se cuentan vínculos en cada visita a la página.
  aviso?: string;
  avisoDe?: Entidad;
  accion: (estado: Estado, formulario: FormData) => Promise<Estado>;
  // Nombre accesible del botón cuando hay varios en la misma página (por ejemplo, un apartado).
  etiquetaBoton?: string;
};

// Pide confirmación antes de eliminar y muestra cuántos vínculos se perderán (spec relaciones).
export default function ConfirmarEliminacion({ id, nombre, aviso, avisoDe, accion, etiquetaBoton }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const [estado, enviar, enviando] = useActionState(accion, {});
  const [avisoCargado, setAvisoCargado] = useState<string | null>(null);
  // Aviso pedido al pasar por el botón (cambio velocidad-respuesta): suele estar listo al abrir.
  // Se descarta al salir del botón para no mostrar uno antiguo si los vínculos cambian.
  const avisoPedido = useRef<Promise<string> | null>(null);

  function pedirAviso() {
    if (!avisoDe || avisoPedido.current) return;
    avisoPedido.current = avisoParaEliminar(avisoDe, id).catch(
      () => "No se pudo comprobar qué vínculos se perderán.",
    );
  }

  function abrir() {
    dialogo.current?.showModal();
    if (!avisoDe) return;
    pedirAviso();
    const pedido = avisoPedido.current!;
    avisoPedido.current = null;
    setAvisoCargado(null);
    pedido.then(setAvisoCargado);
  }
  const textoAviso = avisoDe ? (avisoCargado ?? "Comprobando qué vínculos se perderán…") : aviso;

  return (
    <>
      <button
        type="button"
        className={styles.abrir}
        aria-label={etiquetaBoton}
        onPointerEnter={pedirAviso}
        onFocus={pedirAviso}
        onPointerLeave={() => (avisoPedido.current = null)}
        onBlur={() => (avisoPedido.current = null)}
        onClick={abrir}
      >
        Eliminar
      </button>
      <dialog ref={dialogo} className={styles.dialogo} aria-labelledby={idTitulo}>
        <h2 id={idTitulo} className={styles.titulo}>
          ¿Eliminar «{nombre}»?
        </h2>
        <p>{textoAviso}</p>
        {estado.error && (
          <p role="alert" className={styles.error}>
            {estado.error}
          </p>
        )}
        <form action={enviar} className={styles.acciones}>
          <input type="hidden" name="id" value={id} />
          <button
            type="button"
            className={styles.cancelar}
            disabled={enviando}
            onClick={() => dialogo.current?.close()}
          >
            Cancelar
          </button>
          {/* Respuesta inmediata mientras el servidor elimina y carga la página siguiente. */}
          <button type="submit" className={styles.confirmar} disabled={enviando} aria-busy={enviando}>
            {enviando ? "Eliminando…" : "Eliminar definitivamente"}
          </button>
        </form>
      </dialog>
    </>
  );
}
