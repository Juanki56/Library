"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearEtiqueta, renombrarEtiqueta } from "@/backend/controllers/etiquetas";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./FormulariosEtiqueta.module.css";

export function NuevaEtiqueta() {
  const [estado, enviar, enviando] = useActionState(crearEtiqueta, {});
  const formulario = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado.guardado) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      <label className={styles.campo}>
        Nueva etiqueta
        <input name="nombre" required maxLength={60} placeholder="Por ejemplo: Filosofía" />
      </label>
      <button type="submit" disabled={enviando} className={styles.boton}>
        Crear etiqueta
      </button>
      {estado.error && (
        <span role="alert" className={styles.error}>
          {estado.error}
        </span>
      )}
    </form>
  );
}

export function RenombrarEtiqueta({ id, nombre }: { id: string; nombre: string }) {
  const [estado, enviar, enviando] = useActionState(renombrarEtiqueta, {});
  return (
    <details className={styles.renombrar}>
      <summary aria-label={`Renombrar «${nombre}»`}>Renombrar</summary>
      <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
        <input type="hidden" name="id" value={id} />
        <label className={styles.campo}>
          Nuevo nombre
          <input name="nombre" defaultValue={nombre} required maxLength={60} />
        </label>
        <button type="submit" disabled={enviando} className={styles.boton}>
          Guardar nombre
        </button>
        {estado.error && (
          <span role="alert" className={styles.error}>
            {estado.error}
          </span>
        )}
      </form>
    </details>
  );
}
