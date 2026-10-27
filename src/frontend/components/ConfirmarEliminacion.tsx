"use client";

import { useActionState, useRef } from "react";
import styles from "./ConfirmarEliminacion.module.css";

type Estado = { error?: string };
type Props = {
  id: string;
  nombre: string;
  aviso: string;
  accion: (estado: Estado, formulario: FormData) => Promise<Estado>;
};

// Pide confirmación antes de eliminar y muestra cuántos vínculos se perderán (spec relaciones).
export default function ConfirmarEliminacion({ id, nombre, aviso, accion }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [estado, enviar, enviando] = useActionState(accion, {});

  return (
    <>
      <button type="button" className={styles.abrir} onClick={() => dialogo.current?.showModal()}>
        Eliminar
      </button>
      <dialog ref={dialogo} className={styles.dialogo} aria-labelledby="titulo-eliminar">
        <h2 id="titulo-eliminar" className={styles.titulo}>
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
