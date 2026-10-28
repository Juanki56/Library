"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import Link from "next/link";
import { createContext, useContext } from "react";
import styles from "./EditorNota.module.css";

// Referencia a otra nota dentro del texto (cambio editor-fase2-referencias, design D1 y D2).
// El contenido guarda solo { tipo, id }; el título actual llega de la página por este contexto.
export const TitulosReferencias = createContext<Record<string, string>>({});

export const TEXTO_ELIMINADA = "Nota eliminada";

function VistaReferencia({ node }: ReactNodeViewProps) {
  const titulos = useContext(TitulosReferencias);
  const id = String(node.attrs.id);
  const titulo = titulos[id];
  return (
    <NodeViewWrapper as="span" className={styles.referencia} data-referencia="">
      {titulo ? (
        <Link href={`/notas/${id}`} className={styles.referenciaEnlace}>
          {titulo}
        </Link>
      ) : (
        <span className={styles.referenciaEliminada}>{TEXTO_ELIMINADA}</span>
      )}
    </NodeViewWrapper>
  );
}

// El menú «/» y la barra abren el cuadro de búsqueda a través de este almacén.
export type AlmacenReferencia = { abrir: () => void };

export const Referencia = Node.create<object, AlmacenReferencia>({
  name: "referencia",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addStorage() {
    return { abrir: () => {} };
  },

  addAttributes() {
    return {
      tipo: {
        default: "nota",
        parseHTML: (el) => el.getAttribute("data-tipo"),
        renderHTML: (attrs) => ({ "data-tipo": attrs.tipo }),
      },
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-id"),
        renderHTML: (attrs) => ({ "data-id": attrs.id }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-referencia]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ "data-referencia": "" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VistaReferencia);
  },
});

export function abrirCuadroReferencia(storage: unknown) {
  (storage as { referencia?: AlmacenReferencia }).referencia?.abrir();
}
