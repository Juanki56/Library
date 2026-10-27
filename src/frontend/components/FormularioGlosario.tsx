"use client";

import Link from "next/link";
import { useActionState } from "react";
import { crearEntrada, guardarEntrada } from "@/backend/controllers/glosario";
import type { Entrada } from "@/backend/services/glosario";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./Formularios.module.css";

// Término y definición obligatorios; ejemplo e información adicional opcionales (spec glosario).
export default function FormularioGlosario({ entrada }: { entrada?: Entrada }) {
  const [estado, enviar, enviando] = useActionState(entrada ? guardarEntrada : crearEntrada, {});

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      {entrada && <input type="hidden" name="id" value={entrada.id} />}
      <label className={styles.campo}>
        Término
        <input
          name="termino"
          defaultValue={entrada?.termino}
          required
          maxLength={200}
          autoFocus={!entrada}
          className={styles.titulo}
        />
      </label>
      <label className={styles.campo}>
        Definición
        <textarea
          name="definicion"
          defaultValue={entrada?.definicion}
          required
          maxLength={5000}
          rows={4}
          className={styles.texto}
        />
      </label>
      <label className={styles.campo}>
        Ejemplo (opcional)
        <textarea name="ejemplo" defaultValue={entrada?.ejemplo ?? ""} maxLength={2000} rows={2} className={styles.texto} />
      </label>
      <label className={styles.campo}>
        Información adicional (opcional)
        <textarea
          name="informacionAdicional"
          defaultValue={entrada?.informacionAdicional ?? ""}
          maxLength={5000}
          rows={2}
          className={styles.texto}
        />
      </label>
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          {entrada ? "Guardar" : "Añadir al glosario"}
        </button>
        {estado.error && (
          <p role="alert" className={styles.error}>
            {estado.error}{" "}
            {estado.existente && estado.existente.id !== entrada?.id && (
              <Link href={`/glosario/${estado.existente.id}`}>Abrir «{estado.existente.termino}»</Link>
            )}
          </p>
        )}
        {estado.guardado && !enviando && <p role="status">Guardado.</p>}
      </div>
    </form>
  );
}
