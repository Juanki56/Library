"use client";

import { useActionState } from "react";
import { crearNota } from "@/backend/controllers/notas";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

export default function FormularioNuevaNota({ vincular }: { vincular?: { valor: string; nombre: string } }) {
  const [estado, enviar, enviando] = useActionState(crearNota, {});

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      {vincular && (
        <>
          <input type="hidden" name="vincular" value={vincular.valor} />
          <p className={styles.aviso}>Se vinculará con «{vincular.nombre}».</p>
        </>
      )}
      <label className={styles.campo}>
        Título
        <input name="titulo" required maxLength={300} autoFocus className={styles.titulo} />
      </label>
      {estado.error && (
        <p role="alert" className={styles.error}>
          {estado.error}
        </p>
      )}
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          Crear nota
        </button>
      </div>
    </form>
  );
}
