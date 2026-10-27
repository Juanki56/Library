"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { asignarEtiqueta, quitarEtiqueta } from "@/backend/controllers/etiquetas";
import type { Entidad } from "@/backend/services/catalogo";
import type { Etiqueta } from "@/backend/services/etiquetas";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./EtiquetasElemento.module.css";

type Props = { tipo: Entidad; id: string; propias: Etiqueta[]; todas: Etiqueta[] };

function Quitar({ tipo, id, etiqueta }: { tipo: Entidad; id: string; etiqueta: Etiqueta }) {
  const [, enviar, enviando] = useActionState(quitarEtiqueta, {});
  return (
    <form action={enviar}>
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="etiquetaId" value={etiqueta.id} />
      <button type="submit" disabled={enviando} className={styles.quitar} aria-label={`Quitar la etiqueta «${etiqueta.nombre}»`}>
        ×
      </button>
    </form>
  );
}

// Etiquetas del elemento: asignar una existente o crear una nueva al escribirla, y quitar (spec etiquetas).
export default function EtiquetasElemento({ tipo, id, propias, todas }: Props) {
  const [estado, enviar, enviando] = useActionState(asignarEtiqueta, {});
  const formulario = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado.guardado) formulario.current?.reset();
  }, [estado]);
  const sugeridas = todas.filter((t) => !propias.some((p) => p.id === t.id));
  const lista = `etiquetas-${tipo}-${id}`;

  return (
    <section aria-labelledby="titulo-etiquetas" className={styles.seccion}>
      <h2 id="titulo-etiquetas" className={styles.titulo}>
        Etiquetas
      </h2>
      {propias.length === 0 ? (
        <p className={styles.vacio}>Sin etiquetas.</p>
      ) : (
        <ul className={styles.lista} aria-label="Etiquetas del elemento">
          {propias.map((e) => (
            <li key={e.id} className={styles.etiqueta}>
              <Link href={`/etiquetas/${e.id}`}>{e.nombre}</Link>
              <Quitar tipo={tipo} id={id} etiqueta={e} />
            </li>
          ))}
        </ul>
      )}
      <form ref={formulario} onSubmit={enviarSinVaciar(enviar)} className={styles.anadir}>
        <input type="hidden" name="tipo" value={tipo} />
        <input type="hidden" name="id" value={id} />
        <label className={styles.oculto} htmlFor={`${lista}-campo`}>
          Añadir etiqueta
        </label>
        <input
          id={`${lista}-campo`}
          name="nombre"
          list={lista}
          required
          maxLength={60}
          placeholder="Añadir etiqueta…"
          autoComplete="off"
        />
        <datalist id={lista}>
          {sugeridas.map((e) => (
            <option key={e.id} value={e.nombre} />
          ))}
        </datalist>
        <button type="submit" disabled={enviando}>
          Añadir
        </button>
        {estado.error && (
          <span role="alert" className={styles.error}>
            {estado.error}
          </span>
        )}
      </form>
    </section>
  );
}
