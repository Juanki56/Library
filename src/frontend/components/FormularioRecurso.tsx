"use client";

import { useActionState } from "react";
import { crearRecurso, guardarRecurso } from "@/backend/controllers/recursos";
import type { Recurso } from "@/backend/services/recursos";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

// Campos provisionales de fuentes y recursos (spec fuentes-recursos). Solo el título es obligatorio.
export default function FormularioRecurso({ recurso }: { recurso?: Recurso }) {
  const [estado, enviar, enviando] = useActionState(recurso ? guardarRecurso : crearRecurso, {});

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      {recurso && <input type="hidden" name="id" value={recurso.id} />}
      <label className={styles.campo}>
        Título
        <input
          name="titulo"
          defaultValue={recurso?.titulo}
          required
          maxLength={300}
          autoFocus={!recurso}
          className={styles.titulo}
        />
      </label>
      <label className={styles.campo}>
        Dirección web (opcional)
        <input
          name="url"
          type="url"
          placeholder="https://…"
          defaultValue={recurso?.url ?? ""}
          maxLength={2000}
          className={styles.texto}
        />
      </label>
      <label className={styles.campo}>
        Autor
        <input name="autor" defaultValue={recurso?.autor ?? ""} maxLength={300} className={styles.texto} />
      </label>
      <label className={styles.campo}>
        Descripción
        <textarea
          name="descripcion"
          defaultValue={recurso?.descripcion ?? ""}
          maxLength={5000}
          rows={3}
          className={styles.texto}
        />
      </label>
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          {recurso ? "Guardar" : "Crear recurso"}
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
