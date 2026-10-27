"use client";

import { useActionState } from "react";
import { crearCita, guardarCita } from "@/backend/controllers/citas";
import type { Cita } from "@/backend/services/citas";
import type { ElementoBreve } from "@/backend/services/relacionados";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

type Props = {
  cita?: Cita;
  opciones: { libros: ElementoBreve[]; recursos: ElementoBreve[] };
};

// Solo el texto es obligatorio; autor, origen y enlace son opcionales (spec citas).
export default function FormularioCita({ cita, opciones }: Props) {
  const [estado, enviar, enviando] = useActionState(cita ? guardarCita : crearCita, {});
  const enlace = cita?.enlace ? `${cita.enlace.tipo}:${cita.enlace.id}` : "";

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      {cita && <input type="hidden" name="id" value={cita.id} />}
      <label className={styles.campo}>
        Texto de la cita
        <textarea
          name="texto"
          defaultValue={cita?.texto}
          required
          maxLength={5000}
          rows={4}
          autoFocus={!cita}
          className={`${styles.texto} ${styles.textoCita}`}
        />
      </label>
      <div className={styles.fila}>
        <label className={styles.campo}>
          Autor (opcional)
          <input name="autor" defaultValue={cita?.autor ?? ""} maxLength={300} className={styles.texto} />
        </label>
        <label className={`${styles.campo} ${styles.corto}`}>
          Tipo
          <select name="tipo" defaultValue={cita?.tipo ?? "cita"} className={styles.texto}>
            <option value="cita">Cita</option>
            <option value="frase">Frase de autor</option>
            <option value="proverbio">Proverbio</option>
          </select>
        </label>
      </div>
      <label className={styles.campo}>
        Fuente u origen (opcional)
        <input
          name="fuente"
          defaultValue={cita?.fuente ?? ""}
          maxLength={500}
          placeholder="Por ejemplo: Tesis sobre Feuerbach, XI"
          className={styles.texto}
        />
      </label>
      <label className={styles.campo}>
        Enlazar con un libro o recurso (opcional)
        <select name="enlace" defaultValue={enlace} className={styles.texto}>
          <option value="">Sin enlace</option>
          {opciones.libros.length > 0 && (
            <optgroup label="Libros">
              {opciones.libros.map((l) => (
                <option key={l.id} value={`libro:${l.id}`}>
                  {l.nombre}
                </option>
              ))}
            </optgroup>
          )}
          {opciones.recursos.length > 0 && (
            <optgroup label="Fuentes y recursos">
              {opciones.recursos.map((r) => (
                <option key={r.id} value={`recurso:${r.id}`}>
                  {r.nombre}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          {cita ? "Guardar" : "Guardar cita"}
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
