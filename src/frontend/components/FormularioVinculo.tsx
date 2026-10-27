"use client";

import { useActionState } from "react";
import { desvincularElementos, vincularElementos } from "@/backend/controllers/relaciones";
import type { Entidad } from "@/backend/services/catalogo";
import type { ElementoBreve } from "@/backend/services/relacionados";
import styles from "./ElementosRelacionados.module.css";

type Origen = { origenTipo: Entidad; origenId: string; destinoTipo: Entidad };

function CamposOrigen({ origenTipo, origenId, destinoTipo }: Origen) {
  return (
    <>
      <input type="hidden" name="origenTipo" value={origenTipo} />
      <input type="hidden" name="origenId" value={origenId} />
      <input type="hidden" name="destinoTipo" value={destinoTipo} />
    </>
  );
}

// Elige un elemento existente y lo vincula; solo ofrece los aún no vinculados.
export function Vincular({ candidatos, etiqueta, ...origen }: Origen & { candidatos: ElementoBreve[]; etiqueta: string }) {
  const [estado, enviar, enviando] = useActionState(vincularElementos, {});
  if (candidatos.length === 0) return null;

  return (
    <form action={enviar} className={styles.vincular}>
      <CamposOrigen {...origen} />
      <label className={styles.oculto} htmlFor={`vincular-${origen.destinoTipo}`}>
        {etiqueta}
      </label>
      <select id={`vincular-${origen.destinoTipo}`} name="destinoId" required defaultValue="">
        <option value="" disabled>
          {etiqueta}…
        </option>
        {candidatos.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
      <button type="submit" disabled={enviando}>
        Vincular
      </button>
      {estado.error && (
        <span role="alert" className={styles.error}>
          {estado.error}
        </span>
      )}
    </form>
  );
}

// Quita solo el vínculo; el elemento sigue existiendo (spec relaciones).
export function Quitar({ destinoId, nombre, ...origen }: Origen & { destinoId: string; nombre: string }) {
  const [estado, enviar, enviando] = useActionState(desvincularElementos, {});

  return (
    <form action={enviar} className={styles.quitar}>
      <CamposOrigen {...origen} />
      <input type="hidden" name="destinoId" value={destinoId} />
      <button type="submit" disabled={enviando} aria-label={`Quitar vínculo con «${nombre}»`}>
        Quitar
      </button>
      {estado.error && (
        <span role="alert" className={styles.error}>
          {estado.error}
        </span>
      )}
    </form>
  );
}
