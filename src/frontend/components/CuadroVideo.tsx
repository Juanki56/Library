"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ERROR_VIDEO, reconocerVideo, type Video } from "@/backend/services/medios";
import styles from "./EditorNota.module.css";

type Props = { abierto: boolean; onInsertar: (video: Video) => void; onCerrar: () => void };

// Cuadro «Insertar vídeo» (design D6 y D7): solo enlaces de YouTube o Vimeo.
export default function CuadroVideo({ abierto, onInsertar, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [enlace, setEnlace] = useState("");
  const [error, setError] = useState<string | null>(null);
  const idTitulo = useId();

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      setEnlace("");
      setError(null);
      d.showModal();
    } else if (!abierto && d.open) {
      d.close();
    }
  }, [abierto]);

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const video = reconocerVideo(enlace);
    if (!video) return setError(ERROR_VIDEO);
    onInsertar(video);
  }

  return (
    <dialog ref={dialogo} className={styles.cuadro} aria-labelledby={idTitulo} onClose={onCerrar}>
      <form onSubmit={enviar} className={styles.cuadroFormulario}>
        <h2 id={idTitulo} className={styles.cuadroTitulo}>
          Insertar vídeo
        </h2>
        <label className={styles.cuadroCampo}>
          Enlace del vídeo
          <input
            type="text"
            inputMode="url"
            value={enlace}
            onChange={(e) => {
              setEnlace(e.target.value);
              setError(null);
            }}
            placeholder="https://www.youtube.com/watch?v=… o https://vimeo.com/…"
            autoFocus
          />
        </label>
        {error && (
          <p role="alert" className={styles.cuadroError}>
            {error}
          </p>
        )}
        <div className={styles.cuadroAcciones}>
          <button type="button" className={styles.cuadroSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className={styles.cuadroPrincipal}>
            Insertar
          </button>
        </div>
      </form>
    </dialog>
  );
}
