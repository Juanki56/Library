"use client";

import { useActionState, useId, useRef } from "react";
import styles from "./ConfirmarEliminacion.module.css";

type Estado = { error?: string };
type Props = {
  id: string;
  nombre: string;
  aviso: string;
  accion: (estado: Estado, formulario: FormData) => Promise<Estado>;
  // Nombre accesible del botón cuando hay varios en la misma página (por ejemplo, un apartado).
  etiquetaBoton?: string;
};

// Pide confirmación antes de eliminar y muestra cuántos vínculos se perderán (spec relaciones).
export default function ConfirmarEliminacion({ id, nombre, aviso, accion, etiquetaBoton }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const [estado, enviar, enviando] = useActionState(accion, {});

  return (
    <>
      <button
        type="button"
        className={styles.abrir}
        aria-label={etiquetaBoton}
        onClick={() => dialogo.current?.showModal()}
      >
        Eliminar
      </button>
      <dialog ref={dialogo} className={styles.dialogo} aria-labelledby={idTitulo}>
        <h2 id={idTitulo} className={styles.titulo}>
          ¿Eliminar «{nombre}»?
        </h2>
        <p>{aviso}</p>
        {estado.error && (
          <p role="alert" className={styles.error}>
            {estado.error}
          </p>
        )}
        <form action={enviar} className={styles.acciones}>
          <input type="hidden" name="id" value={id} />
          <button type="button" className={styles.cancelar} onClick={() => dialogo.current?.close()}>
            Cancelar
          </button>
          <button type="submit" className={styles.confirmar} disabled={enviando}>
            Eliminar definitivamente
          </button>
        </form>
      </dialog>
    </>
  );
}
