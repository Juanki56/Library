"use client";

import { useActionState } from "react";
import { crearLibro, guardarLibro } from "@/backend/controllers/libros";
import { ESTADOS_LECTURA } from "@/backend/services/fichas";
import type { Libro } from "@/backend/services/libros";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

// Campos del libro decididos el 2026-10-28 (spec libros). Solo el título es obligatorio.
// La portada tiene su propio formulario en la página del libro.
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
          Año de publicación
          <input
            name="anio"
            defaultValue={libro?.anio ?? ""}
            inputMode="numeric"
            pattern="-?[0-9]{1,4}"
            className={styles.texto}
          />
        </label>
      </div>
      <div className={styles.fila}>
        <label className={styles.campo}>
          Editorial
          <input name="editorial" defaultValue={libro?.editorial ?? ""} maxLength={200} className={styles.texto} />
        </label>
        <label className={styles.campo}>
          ISBN
          <input
            name="isbn"
            defaultValue={libro?.isbn ?? ""}
            maxLength={20}
            placeholder="978-…"
            inputMode="numeric"
            className={styles.texto}
          />
        </label>
        <label className={`${styles.campo} ${styles.corto}`}>
          Estado de lectura
          <select name="estadoLectura" defaultValue={libro?.estadoLectura ?? ""} className={styles.texto}>
            <option value="">Sin estado</option>
            {Object.entries(ESTADOS_LECTURA).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={styles.campo}>
        Descripción
        <textarea
          name="descripcion"
          defaultValue={libro?.descripcion ?? ""}
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
