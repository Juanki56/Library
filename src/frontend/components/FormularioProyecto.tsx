"use client";

import { useActionState } from "react";
import { crearProyecto, guardarProyecto } from "@/backend/controllers/proyectos";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

type Props = { proyecto?: { id: string; nombre: string; descripcion: string | null } };

// Crea un proyecto nuevo o, si recibe uno, lo renombra y edita su descripción.
export default function FormularioProyecto({ proyecto }: Props) {
  const [estado, enviar, enviando] = useActionState(proyecto ? guardarProyecto : crearProyecto, {});

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      {proyecto && <input type="hidden" name="id" value={proyecto.id} />}
      <label className={styles.campo}>
        Nombre
        <input
          name="nombre"
          defaultValue={proyecto?.nombre}
          required
          maxLength={200}
          autoFocus={!proyecto}
          className={styles.titulo}
        />
      </label>
      <label className={styles.campo}>
        Descripción (opcional)
        <textarea
          name="descripcion"
          defaultValue={proyecto?.descripcion ?? ""}
          maxLength={2000}
          rows={3}
          className={styles.texto}
        />
      </label>
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          {proyecto ? "Guardar" : "Crear proyecto"}
        </button>
        {estado.error && (
          <p role="alert" className={styles.error}>
            {estado.error}
          </p>
        )}
        {estado.guardado && !enviando && <p role="status">Guardado.</p>}
      </div>
    </form>
  );
}
