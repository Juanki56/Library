"use client";

import { useEffect, useId, useRef, useState } from "react";
import { subirImagen } from "@/backend/controllers/notas";
import { esEnlaceWeb } from "@/backend/services/enlaces";
import { ERROR_IMAGEN_GRANDE, LONGITUD_TEXTO_IMAGEN, TAMANO_MAXIMO_IMAGEN } from "@/backend/services/medios";
import { ERROR_ENLACE } from "./CuadroEnlace";
import styles from "./EditorNota.module.css";

export type DatosImagen =
  | { origen: "archivo"; ruta: string; alt: string; pie: string }
  | { origen: "web"; src: string; alt: string; pie: string };

type Props = {
  abierto: boolean;
  notaId: string;
  // Con una imagen seleccionada solo se editan el texto alternativo y el pie.
  editando: { alt: string; pie: string } | null;
  onInsertar: (imagen: DatosImagen) => void;
  onEditar: (datos: { alt: string; pie: string }) => void;
  onCerrar: () => void;
};

const ERROR_SUBIDA = "No se pudo subir la imagen. Inténtalo de nuevo.";
const TIPOS = "image/png,image/jpeg,image/gif,image/webp";

// Cuadro «Insertar imagen» / «Editar imagen» (design D7). La imagen subida solo se inserta
// cuando el servidor confirma la subida; si falla, se avisa y no se inserta nada (design D3).
export default function CuadroImagen({ abierto, notaId, editando, onInsertar, onEditar, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [origen, setOrigen] = useState<"archivo" | "web">("archivo");
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [pie, setPie] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const idTitulo = useId();

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      setOrigen("archivo");
      setSrc("");
      setAlt(editando?.alt ?? "");
      setPie(editando?.pie ?? "");
      setError(null);
      setSubiendo(false);
      d.showModal();
    } else if (!abierto && d.open) {
      d.close();
    }
  }, [abierto, editando]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const datos = { alt: alt.trim(), pie: pie.trim() };
    if (editando) return onEditar(datos);

    if (origen === "web") {
      const direccion = src.trim();
      if (!esEnlaceWeb(direccion)) return setError(ERROR_ENLACE);
      return onInsertar({ origen: "web", src: direccion, ...datos });
    }

    const elegido = archivo.current?.files?.[0];
    if (!elegido) return setError("Elige una imagen para subir.");
    if (elegido.size > TAMANO_MAXIMO_IMAGEN) return setError(ERROR_IMAGEN_GRANDE);
    const formulario = new FormData();
    formulario.set("archivo", elegido);
    setSubiendo(true);
    setError(null);
    try {
      const resultado = await subirImagen(notaId, formulario);
      if (!resultado.ok) setError(resultado.error);
      else onInsertar({ origen: "archivo", ruta: resultado.ruta, ...datos });
    } catch {
      setError(ERROR_SUBIDA);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <dialog ref={dialogo} className={styles.cuadro} aria-labelledby={idTitulo} onClose={onCerrar}>
      <form onSubmit={enviar} className={styles.cuadroFormulario}>
        <h2 id={idTitulo} className={styles.cuadroTitulo}>
          {editando ? "Editar imagen" : "Insertar imagen"}
        </h2>

        {!editando && (
          <>
            <fieldset className={styles.cuadroOpciones}>
              <legend>Origen de la imagen</legend>
              <label>
                <input type="radio" name="origen" checked={origen === "archivo"} onChange={() => setOrigen("archivo")} />
                Subir archivo
              </label>
              <label>
                <input type="radio" name="origen" checked={origen === "web"} onChange={() => setOrigen("web")} />
                Desde una dirección web
              </label>
            </fieldset>
            {origen === "archivo" ? (
              <label className={styles.cuadroCampo}>
                Archivo de imagen (PNG, JPEG, GIF o WebP, hasta 5 MB)
                <input ref={archivo} type="file" accept={TIPOS} onChange={() => setError(null)} />
              </label>
            ) : (
              <label className={styles.cuadroCampo}>
                Dirección de la imagen
                <input
                  type="text"
                  inputMode="url"
                  value={src}
                  onChange={(e) => {
                    setSrc(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://…"
                />
              </label>
            )}
          </>
        )}

        <label className={styles.cuadroCampo}>
          Texto alternativo
          <input type="text" value={alt} maxLength={LONGITUD_TEXTO_IMAGEN} onChange={(e) => setAlt(e.target.value)} />
        </label>
        <label className={styles.cuadroCampo}>
          Pie de imagen (opcional)
          <input type="text" value={pie} maxLength={LONGITUD_TEXTO_IMAGEN} onChange={(e) => setPie(e.target.value)} />
        </label>

        {error && (
          <p role="alert" className={styles.cuadroError}>
            {error}
          </p>
        )}
        {subiendo && (
          <p role="status" className={styles.cuadroAviso}>
            Subiendo imagen…
          </p>
        )}
        <div className={styles.cuadroAcciones}>
          <button type="button" className={styles.cuadroSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className={styles.cuadroPrincipal} disabled={subiendo}>
            {editando ? "Aplicar" : "Insertar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
