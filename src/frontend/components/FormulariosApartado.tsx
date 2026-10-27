"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  asignarAApartado,
  crearApartado,
  editarApartado,
  moverApartado,
  quitarDeApartado,
} from "@/backend/controllers/apartados";
import type { ElementoBreve } from "@/backend/services/relacionados";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./ApartadosProyecto.module.css";

type TipoAsignable = "nota" | "libro" | "recurso";

function Error({ mensaje }: { mensaje?: string }) {
  return mensaje ? (
    <span role="alert" className={styles.error}>
      {mensaje}
    </span>
  ) : null;
}

// Subir o bajar un apartado una posición.
export function Mover({ id, proyectoId, titulo, primero, ultimo }: {
  id: string;
  proyectoId: string;
  titulo: string;
  primero: boolean;
  ultimo: boolean;
}) {
  const [estado, enviar, enviando] = useActionState(moverApartado, {});
  // Un formulario por dirección: React no envía el valor del botón pulsado en las acciones.
  const boton = (direccion: "subir" | "bajar", deshabilitado: boolean, flecha: string, texto: string) => (
    <form action={enviar}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="proyectoId" value={proyectoId} />
      <input type="hidden" name="direccion" value={direccion} />
      <button type="submit" disabled={deshabilitado || enviando} aria-label={`${texto} «${titulo}»`}>
        {flecha}
      </button>
    </form>
  );
  return (
    <div className={styles.mover}>
      {boton("subir", primero, "↑", "Subir")}
      {boton("bajar", ultimo, "↓", "Bajar")}
      <Error mensaje={estado.error} />
    </div>
  );
}

// Editar título y descripción, desplegado bajo demanda.
export function Editar({ id, proyectoId, titulo, descripcion }: {
  id: string;
  proyectoId: string;
  titulo: string;
  descripcion: string | null;
}) {
  const [estado, enviar, enviando] = useActionState(editarApartado, {});
  return (
    <details className={styles.editar}>
      <summary>Editar</summary>
      <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="proyectoId" value={proyectoId} />
        <label className={styles.campo}>
          Título del apartado
          <input name="titulo" defaultValue={titulo} required maxLength={200} />
        </label>
        <label className={styles.campo}>
          Descripción del apartado (opcional)
          <input name="descripcion" defaultValue={descripcion ?? ""} maxLength={1000} />
        </label>
        <div className={styles.pie}>
          <button type="submit" disabled={enviando} className={styles.principal}>
            Guardar apartado
          </button>
          <Error mensaje={estado.error} />
          {estado.guardado && !enviando && <span role="status">Guardado.</span>}
        </div>
      </form>
    </details>
  );
}

const GRUPOS: { tipo: TipoAsignable; etiqueta: string }[] = [
  { tipo: "nota", etiqueta: "Notas" },
  { tipo: "libro", etiqueta: "Libros" },
  { tipo: "recurso", etiqueta: "Fuentes y recursos" },
];

// Añadir al apartado un elemento existente; si no estaba en el proyecto, se vincula.
export function Anadir({ apartadoId, proyectoId, titulo, candidatos }: {
  apartadoId: string;
  proyectoId: string;
  titulo: string;
  candidatos: Record<TipoAsignable, ElementoBreve[]>;
}) {
  const [estado, enviar, enviando] = useActionState(asignarAApartado, {});
  if (GRUPOS.every((g) => candidatos[g.tipo].length === 0)) return null;
  return (
    <form action={enviar} className={styles.anadir}>
      <input type="hidden" name="apartadoId" value={apartadoId} />
      <input type="hidden" name="proyectoId" value={proyectoId} />
      <label className={styles.oculto} htmlFor={`anadir-${apartadoId}`}>
        Añadir a «{titulo}»
      </label>
      <select id={`anadir-${apartadoId}`} name="elemento" required defaultValue="">
        <option value="" disabled>
          Añadir al apartado…
        </option>
        {GRUPOS.filter((g) => candidatos[g.tipo].length > 0).map((g) => (
          <optgroup key={g.tipo} label={g.etiqueta}>
            {candidatos[g.tipo].map((c) => (
              <option key={c.id} value={`${g.tipo}:${c.id}`}>
                {c.nombre}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <button type="submit" disabled={enviando}>
        Añadir
      </button>
      <Error mensaje={estado.error} />
    </form>
  );
}

// Quitar un elemento del apartado; sigue en el proyecto.
export function Quitar({ apartadoId, proyectoId, tipo, id, nombre }: {
  apartadoId: string;
  proyectoId: string;
  tipo: TipoAsignable;
  id: string;
  nombre: string;
}) {
  const [estado, enviar, enviando] = useActionState(quitarDeApartado, {});
  return (
    <form action={enviar} className={styles.quitar}>
      <input type="hidden" name="apartadoId" value={apartadoId} />
      <input type="hidden" name="proyectoId" value={proyectoId} />
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={enviando} aria-label={`Quitar «${nombre}» del apartado`}>
        Quitar
      </button>
      <Error mensaje={estado.error} />
    </form>
  );
}

// Crear un apartado nuevo al final de la lista.
export function Nuevo({ proyectoId }: { proyectoId: string }) {
  const [estado, enviar, enviando] = useActionState(crearApartado, {});
  const formulario = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado.guardado) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} onSubmit={enviarSinVaciar(enviar)} className={`${styles.formulario} ${styles.nuevo}`}>
      <input type="hidden" name="proyectoId" value={proyectoId} />
      <h3>Nuevo apartado</h3>
      <label className={styles.campo}>
        Título del apartado
        <input name="titulo" required maxLength={200} placeholder="Por ejemplo: Filosofía antigua" />
      </label>
      <label className={styles.campo}>
        Descripción del apartado (opcional)
        <input name="descripcion" maxLength={1000} />
      </label>
      <div className={styles.pie}>
        <button type="submit" disabled={enviando} className={styles.principal}>
          Crear apartado
        </button>
        <Error mensaje={estado.error} />
      </div>
    </form>
  );
}
