"use client";

import { useActionState } from "react";
import { crearRecurso, guardarRecurso } from "@/backend/controllers/recursos";
import { TIPOS_RECURSO } from "@/backend/services/fichas";
import type { Recurso } from "@/backend/services/recursos";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

// Tipos y datos de fuentes y recursos decididos el 2026-10-28 (spec fuentes-recursos).
// Solo el título es obligatorio; el tipo es «Otro» si no se elige.
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
      <div className={styles.fila}>
        <label className={styles.campo}>
          Tipo
          <select name="tipo" defaultValue={recurso?.tipo ?? "otro"} className={styles.texto}>
            {Object.entries(TIPOS_RECURSO).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.campo}>
          Fecha de publicación
          <input
            name="fechaPublicacion"
            type="date"
            defaultValue={recurso?.fecha_publicacion ?? ""}
            className={styles.texto}
          />
        </label>
      </div>
      <label className={styles.campo}>
        Autor o creador
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
