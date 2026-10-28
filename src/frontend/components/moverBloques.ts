"use client";

import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorState, Transaction } from "@tiptap/pm/state";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";

// Subir y bajar bloques (cambio editor-fase4-organizacion-tablas, design D1). Extensión propia:
// la oficial de Tiptap para arrastrar exige los paquetes de edición colaborativa.

export type Direccion = "arriba" | "abajo";

const ELEMENTOS_LISTA = new Set(["listItem", "taskItem"]);

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    moverBloques: {
      moverBloque: (direccion: Direccion) => ReturnType;
    };
  }
}

// Bloque en una posición (también lo usa ArrastrarBloques): el ancestro más profundo que sea un
// elemento de lista o un hijo directo del documento; en el nivel superior, el nodo que empieza ahí
// (imagen, vídeo, separador).
export function bloqueEn(doc: ProseMirrorNode, pos: number): { inicio: number; nodo: ProseMirrorNode } | null {
  const $pos = doc.resolve(pos);
  for (let d = $pos.depth; d >= 1; d--) {
    const nodo = $pos.node(d);
    if (d === 1 || ELEMENTOS_LISTA.has(nodo.type.name)) return { inicio: $pos.before(d), nodo };
  }
  return $pos.nodeAfter ? { inicio: pos, nodo: $pos.nodeAfter } : null;
}

// Bloque que se mueve: el nodo seleccionado (imagen, vídeo) o el ancestro más profundo del cursor
// que sea un elemento de lista o un hijo directo del documento.
function bloqueActual(state: EditorState) {
  const { selection } = state;
  if (selection instanceof NodeSelection && selection.$from.depth === 0) {
    return { inicio: selection.from, nodo: selection.node, padre: state.doc, indice: selection.$from.index(0), nodoSeleccionado: true };
  }
  const $desde = selection.$from;
  for (let d = $desde.depth; d >= 1; d--) {
    const nodo = $desde.node(d);
    if (d === 1 || ELEMENTOS_LISTA.has(nodo.type.name)) {
      return { inicio: $desde.before(d), nodo, padre: $desde.node(d - 1), indice: $desde.index(d - 1), nodoSeleccionado: false };
    }
  }
  return null;
}

export function moverBloque(state: EditorState, direccion: Direccion, dispatch?: (tr: Transaction) => void): boolean {
  const bloque = bloqueActual(state);
  if (!bloque) return false;
  const { inicio, nodo, padre, indice } = bloque;
  const vecino = direccion === "arriba" ? padre.maybeChild(indice - 1) : padre.maybeChild(indice + 1);
  if (!vecino) return false;
  if (!dispatch) return true;

  const fin = inicio + nodo.nodeSize;
  // Desplazamiento del bloque: tanto como mide el vecino con el que se intercambia.
  const desplazamiento = direccion === "arriba" ? -vecino.nodeSize : vecino.nodeSize;
  const tr = state.tr.delete(inicio, fin);
  tr.insert(direccion === "arriba" ? inicio - vecino.nodeSize : inicio + vecino.nodeSize, nodo);

  const nuevoInicio = inicio + desplazamiento;
  if (bloque.nodoSeleccionado) {
    tr.setSelection(NodeSelection.create(tr.doc, nuevoInicio));
  } else {
    const { from, to } = state.selection;
    tr.setSelection(TextSelection.create(tr.doc, from + desplazamiento, to + desplazamiento));
  }
  dispatch(tr.scrollIntoView());
  return true;
}

export const MoverBloques = Extension.create({
  name: "moverBloques",

  addCommands() {
    return {
      moverBloque:
        (direccion) =>
        ({ state, dispatch }) =>
          moverBloque(state, direccion, dispatch),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Alt-ArrowUp": () => this.editor.commands.moverBloque("arriba"),
      "Alt-ArrowDown": () => this.editor.commands.moverBloque("abajo"),
    };
  },
});
