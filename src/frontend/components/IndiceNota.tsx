"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import styles from "./EditorNota.module.css";

type Entrada = { nivel: number; texto: string; posicion: number };

// Subtítulos del documento en orden (cambio editor-fase4-organizacion-tablas, design D2).
function subtitulos(editor: Editor | null): Entrada[] {
  const entradas: Entrada[] = [];
  editor?.state.doc.descendants((nodo, posicion) => {
    if (nodo.type.name === "heading") {
      entradas.push({ nivel: nodo.attrs.level as number, texto: nodo.textContent, posicion });
      return false;
    }
    return true;
  });
  return entradas;
}

const iguales = (a: Entrada[], b: Entrada[]) =>
  a.length === b.length && a.every((x, i) => x.nivel === b[i].nivel && x.texto === b[i].texto && x.posicion === b[i].posicion);

// Índice de la nota: se calcula del contenido mientras se escribe y no se guarda.
export default function IndiceNota({ editor }: { editor: Editor | null }) {
  const [entradas, setEntradas] = useState<Entrada[]>([]);

  // Suscripción propia: se calcula al crearse el editor (sin esperar a una edición) y en cada cambio.
  useEffect(() => {
    if (!editor) return;
    const actualizar = () => setEntradas((previas) => {
      const nuevas = subtitulos(editor);
      return iguales(nuevas, previas) ? previas : nuevas;
    });
    actualizar();
    editor.on("update", actualizar);
    return () => {
      editor.off("update", actualizar);
    };
  }, [editor]);

  if (!editor || entradas.length === 0) return null;

  function ir(posicion: number) {
    if (!editor) return;
    editor.chain().focus().setTextSelection(posicion + 1).run();
    const elemento = editor.view.nodeDOM(posicion);
    if (elemento instanceof HTMLElement) elemento.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  return (
    <nav aria-label="Índice de la nota" className={styles.indice}>
      <h2 className={styles.indiceTitulo}>Índice</h2>
      <ol>
        {entradas.map((e) => (
          <li key={e.posicion} className={e.nivel === 3 ? styles.indiceMenor : undefined}>
            <button type="button" onClick={() => ir(e.posicion)}>
              {e.texto || "Subtítulo sin texto"}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
