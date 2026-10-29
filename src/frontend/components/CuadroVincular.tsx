"use client";

import { startTransition, useEffect, useId, useRef, useState } from "react";
import { candidatosParaVincular, desvincularElementos, vincularElementos } from "@/backend/controllers/relaciones";
import type { Entidad } from "@/backend/services/catalogo";
import { sinTildes } from "./comandosBarra";
import styles from "./Conexiones.module.css";

export type Candidato = { tipo: Entidad; id: string; nombre: string };

const TIPO: Record<Entidad, string> = { nota: "Nota", proyecto: "Proyecto", libro: "Libro", recurso: "Fuente o recurso" };
const MAXIMO_RESULTADOS = 20;

type Origen = { origenTipo: Entidad; origenId: string };

function datos(origen: Origen, destino: { tipo: Entidad; id: string }) {
  const formulario = new FormData();
  formulario.set("origenTipo", origen.origenTipo);
  formulario.set("origenId", origen.origenId);
  formulario.set("destinoTipo", destino.tipo);
  formulario.set("destinoId", destino.id);
  return formulario;
}

// «Vincular…» (cambio conexiones, design D3): un único buscador en todos los tipos que se pueden
// vincular, sin los ya vinculados, sin distinguir tildes ni mayúsculas y manejable con teclado.
// La lista se pide al abrir el cuadro, no al cargar la página (cambio rendimiento-paginas).
export default function CuadroVincular(origen: Origen) {
  const [candidatos, setCandidatos] = useState<Candidato[] | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const [consulta, setConsulta] = useState("");
  const [seleccion, setSeleccion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const idTitulo = useId();
  const idLista = useId();

  // Intro pulsado mientras la lista aún se carga: se elige el primer resultado en cuanto llegue.
  const enterPendiente = useRef(false);
  const consultaActual = useRef("");
  consultaActual.current = consulta;

  const filtrar = (lista: Candidato[], texto: string) => {
    const q = sinTildes(texto);
    return lista.filter((c) => sinTildes(c.nombre).includes(q)).slice(0, MAXIMO_RESULTADOS);
  };
  const resultados = filtrar(candidatos ?? [], consulta);

  function abrir() {
    setConsulta("");
    setSeleccion(0);
    setError(null);
    setCandidatos(null);
    enterPendiente.current = false;
    dialogo.current?.showModal();
    candidatosParaVincular(origen.origenTipo, origen.origenId)
      .then((lista) => {
        setCandidatos(lista);
        const primero = filtrar(lista, consultaActual.current)[0];
        if (enterPendiente.current && primero) elegir(primero);
        enterPendiente.current = false;
      })
      .catch(() => {
        setCandidatos([]);
        setError("No se pudo cargar la lista. Cierra y vuelve a intentarlo.");
      });
  }

  async function elegir(candidato: Candidato) {
    setEnviando(true);
    setError(null);
    try {
      const estado = await vincularElementos({}, datos(origen, candidato));
      if (estado.error) setError(estado.error);
      else startTransition(() => dialogo.current?.close());
    } catch {
      setError("No se pudo vincular. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function tecla(evento: React.KeyboardEvent) {
    if (candidatos === null && evento.key === "Enter") {
      evento.preventDefault();
      enterPendiente.current = true;
      return;
    }
    if (!resultados.length) return;
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      const paso = evento.key === "ArrowDown" ? 1 : -1;
      setSeleccion((s) => (s + paso + resultados.length) % resultados.length);
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      elegir(resultados[Math.min(seleccion, resultados.length - 1)]);
    }
  }

  useEffect(() => setSeleccion(0), [consulta]);

  return (
    <>
      <button type="button" onClick={abrir} className={styles.vincular}>
        Vincular…
      </button>
      <dialog ref={dialogo} className={styles.cuadro} aria-labelledby={idTitulo}>
        <div className={styles.cuadroCuerpo}>
          <h2 id={idTitulo} className={styles.cuadroTitulo}>
            Vincular
          </h2>
          <label className={styles.cuadroCampo}>
            Buscar
            <input
              type="text"
              role="combobox"
              autoComplete="off"
              aria-expanded={resultados.length > 0}
              aria-controls={idLista}
              aria-activedescendant={resultados.length ? `${idLista}-${seleccion}` : undefined}
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={tecla}
              placeholder="Nota, libro, recurso o proyecto"
              autoFocus
            />
          </label>
          {candidatos === null ? (
            <p role="status" className={styles.cuadroAviso}>
              Cargando…
            </p>
          ) : resultados.length === 0 ? (
            <p role="status" className={styles.cuadroAviso}>
              {candidatos.length ? "Nada coincide con lo escrito." : "No queda nada más que vincular."}
            </p>
          ) : (
            <ul id={idLista} role="listbox" aria-label="Resultados" className={styles.resultados}>
              {resultados.map((c, i) => (
                <li
                  key={`${c.tipo}-${c.id}`}
                  id={`${idLista}-${i}`}
                  role="option"
                  aria-selected={i === seleccion}
                  aria-disabled={enviando}
                  className={styles.resultado}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !enviando && elegir(c)}
                >
                  <span className={styles.resultadoNombre}>{c.nombre}</span>
                  <span className={styles.resultadoTipo}>{TIPO[c.tipo]}</span>
                </li>
              ))}
            </ul>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <div className={styles.cuadroAcciones}>
            <button type="button" onClick={() => dialogo.current?.close()} className={styles.secundario}>
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

// Quita solo el vínculo; el elemento sigue existiendo (spec relaciones).
export function QuitarVinculo({ destinoTipo, destinoId, nombre, ...origen }: Origen & { destinoTipo: Entidad; destinoId: string; nombre: string }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function quitar() {
    setEnviando(true);
    try {
      const estado = await desvincularElementos({}, datos(origen, { tipo: destinoTipo, id: destinoId }));
      setError(estado.error ?? null);
    } catch {
      setError("No se pudo quitar el vínculo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={quitar}
        disabled={enviando}
        aria-label={`Quitar vínculo con «${nombre}»`}
        title="Quitar vínculo"
        className={styles.quitar}
      >
        ×
      </button>
      {error && (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </>
  );
}
