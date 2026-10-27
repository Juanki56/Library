"use client";

import type { JSONContent } from "@tiptap/react";
import { useActionState } from "react";
import { guardarNota } from "@/backend/controllers/notas";
import EditorNota from "./EditorNota";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

type Props = { id: string; titulo: string; contenido: JSONContent };

export default function FormularioNota({ id, titulo, contenido }: Props) {
  const [estado, enviar, enviando] = useActionState(guardarNota, {});

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      <input type="hidden" name="id" value={id} />
      <label className={styles.campo}>
        Título
        <input name="titulo" defaultValue={titulo} required maxLength={300} className={styles.titulo} />
      </label>
      <EditorNota contenidoInicial={contenido} nombreCampo="contenido" />
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          {enviando ? "Guardando…" : "Guardar"}
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
