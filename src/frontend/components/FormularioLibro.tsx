"use client";

import { useActionState } from "react";
import { crearLibro, guardarLibro } from "@/backend/controllers/libros";
import type { Libro } from "@/backend/services/libros";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

// Campos bibliográficos provisionales (spec libros). Solo el título es obligatorio.
export default function FormularioLibro({ libro }: { libro?: Libro }) {
  const [estado, enviar, enviando] = useActionState(libro ? guardarLibro : crearLibro, {});

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      {libro && <input type="hidden" name="id" value={libro.id} />}
      <label className={styles.campo}>
        Título
        <input
          name="titulo"
          defaultValue={libro?.titulo}
          required
          maxLength={300}
          autoFocus={!libro}
          className={styles.titulo}
        />
      </label>
      <div className={styles.fila}>
        <label className={styles.campo}>
          Autor o autores
          <input name="autores" defaultValue={libro?.autores ?? ""} maxLength={500} className={styles.texto} />
        </label>
        <label className={`${styles.campo} ${styles.corto}`}>
          Año
          <input
            name="anio"
            defaultValue={libro?.anio ?? ""}
            inputMode="numeric"
            pattern="-?[0-9]{1,4}"
            className={styles.texto}
          />
        </label>
      </div>
      <label className={styles.campo}>
        Editorial
        <input name="editorial" defaultValue={libro?.editorial ?? ""} maxLength={200} className={styles.texto} />
      </label>
      <label className={styles.campo}>
        Notas bibliográficas
        <textarea
          name="notasBibliograficas"
          defaultValue={libro?.notasBibliograficas ?? ""}
          maxLength={5000}
          rows={3}
          className={styles.texto}
        />
      </label>
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          {libro ? "Guardar" : "Crear libro"}
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
