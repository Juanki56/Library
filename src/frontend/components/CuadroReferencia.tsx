"use client";

import { useEffect, useId, useRef, useState } from "react";
import { notasParaReferencia } from "@/backend/controllers/notas";
import { sinTildes } from "./comandosBarra";
import styles from "./EditorNota.module.css";

type NotaReferida = { id: string; titulo: string };

type Props = {
  abierto: boolean;
  notaId: string;
  onElegir: (nota: NotaReferida) => void;
  onCerrar: () => void;
};

const MAXIMO_RESULTADOS = 20;

// Cuadro «Referencia a una nota» (design D3): busca por título sin distinguir tildes ni
// mayúsculas y se maneja con flechas e Intro. No ofrece la propia nota.
export default function CuadroReferencia({ abierto, notaId, onElegir, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [notas, setNotas] = useState<NotaReferida[] | null>(null);
  const [error, setError] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [seleccion, setSeleccion] = useState(0);
  const idTitulo = useId();
  const idLista = useId();

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      setConsulta("");
      setSeleccion(0);
      setNotas(null);
      setError(false);
      d.showModal();
      notasParaReferencia(notaId)
        .then(setNotas)
        .catch(() => setError(true));
    } else if (!abierto && d.open) {
      d.close();
    }
  }, [abierto, notaId]);

  const q = sinTildes(consulta);
  const resultados = (notas ?? []).filter((n) => sinTildes(n.titulo).includes(q)).slice(0, MAXIMO_RESULTADOS);

  function tecla(evento: React.KeyboardEvent) {
    if (!resultados.length) return;
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      const paso = evento.key === "ArrowDown" ? 1 : -1;
      setSeleccion((s) => (s + paso + resultados.length) % resultados.length);
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      onElegir(resultados[Math.min(seleccion, resultados.length - 1)]);
    }
  }

  let aviso: string | null = null;
  if (error) aviso = "No se pudieron cargar las notas. Inténtalo de nuevo.";
  else if (notas === null) aviso = "Cargando notas…";
  else if (!resultados.length) aviso = notas.length ? "Ninguna nota tiene ese título." : "No hay otras notas todavía.";

  return (
    <dialog ref={dialogo} className={styles.cuadro} aria-labelledby={idTitulo} onClose={onCerrar}>
      <div className={styles.cuadroFormulario}>
        <h2 id={idTitulo} className={styles.cuadroTitulo}>
          Referencia a una nota
        </h2>
        <label className={styles.cuadroCampo}>
          Buscar nota
          <input
            type="text"
            role="combobox"
            autoComplete="off"
            aria-expanded={resultados.length > 0}
            aria-controls={idLista}
            aria-activedescendant={resultados.length ? `${idLista}-${seleccion}` : undefined}
            value={consulta}
            onChange={(e) => {
              setConsulta(e.target.value);
              setSeleccion(0);
            }}
            onKeyDown={tecla}
            placeholder="Título de la nota"
            autoFocus
          />
        </label>
        {aviso ? (
          <p role={error ? "alert" : "status"} className={error ? styles.cuadroError : styles.cuadroAviso}>
            {aviso}
          </p>
        ) : (
          <ul id={idLista} role="listbox" aria-label="Notas" className={styles.cuadroLista}>
            {resultados.map((n, i) => (
              <li
                key={n.id}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === seleccion}
                className={styles.opcion}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onElegir(n)}
              >
                {n.titulo}
              </li>
            ))}
          </ul>
        )}
        <div className={styles.cuadroAcciones}>
          <button type="button" className={styles.cuadroSecundario} onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </div>
    </dialog>
  );
}
