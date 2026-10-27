"use client";

import { useEffect, useId, useRef, useState } from "react";
import { esEnlaceWeb } from "@/backend/services/enlaces";
import styles from "./EditorNota.module.css";

type Props = {
  abierto: boolean;
  hrefInicial: string;
  hayEnlace: boolean;
  onAplicar: (href: string) => void;
  onQuitar: () => void;
  onCerrar: () => void;
};

export const ERROR_ENLACE = "Solo se admiten direcciones web que empiecen por http:// o https://";

// Cuadro propio para añadir, editar y quitar enlaces (design D4); sustituye a window.prompt.
export default function CuadroEnlace({ abierto, hrefInicial, hayEnlace, onAplicar, onQuitar, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [href, setHref] = useState(hrefInicial);
  const [error, setError] = useState<string | null>(null);
  const idTitulo = useId();

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      setHref(hrefInicial);
      setError(null);
      d.showModal();
    } else if (!abierto && d.open) {
      d.close();
    }
  }, [abierto, hrefInicial]);

  function aplicar(evento: React.FormEvent) {
    evento.preventDefault();
    const valor = href.trim();
    if (!esEnlaceWeb(valor)) {
      setError(ERROR_ENLACE);
      return;
    }
    onAplicar(valor);
  }

  return (
    <dialog ref={dialogo} className={styles.cuadro} aria-labelledby={idTitulo} onClose={onCerrar}>
      <form onSubmit={aplicar} className={styles.cuadroFormulario}>
        <h2 id={idTitulo} className={styles.cuadroTitulo}>
          {hayEnlace ? "Editar enlace" : "Añadir enlace"}
        </h2>
        <label className={styles.cuadroCampo}>
          Dirección web
          <input
            type="text"
            inputMode="url"
            value={href}
            onChange={(e) => {
              setHref(e.target.value);
              setError(null);
            }}
            placeholder="https://…"
            autoFocus
          />
        </label>
        {error && (
          <p role="alert" className={styles.cuadroError}>
            {error}
          </p>
        )}
        <div className={styles.cuadroAcciones}>
          {hayEnlace && (
            <button type="button" className={styles.cuadroSecundario} onClick={onQuitar}>
              Quitar enlace
            </button>
          )}
          <button type="button" className={styles.cuadroSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className={styles.cuadroPrincipal}>
            Aplicar
          </button>
        </div>
      </form>
    </dialog>
  );
}
