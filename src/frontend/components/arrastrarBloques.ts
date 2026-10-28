"use client";

import { Extension } from "@tiptap/core";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { bloqueEn } from "./moverBloques";

// Arrastrar bloques con el ratón (cambio editor-arrastrar-bloques, design D1). Extensión propia
// sin dependencias: un asa junto al bloque bajo el ratón que inicia el arrastre nativo de
// ProseMirror; al soltar, ProseMirror mueve el bloque y el guardado automático lo recoge.

// Distancia mínima desde el borde izquierdo del editor a la que se busca el bloque: a la izquierda
// de ahí solo hay margen.
const MARGEN_BUSQUEDA = 40;
const ANCHO_ASA = 22;

class VistaAsa {
  private asa: HTMLElement;
  private actual: { inicio: number; elemento: HTMLElement } | null = null;

  constructor(
    private view: EditorView,
    clase: string,
  ) {
    this.asa = document.createElement("div");
    this.asa.className = clase;
    this.asa.textContent = "⠿";
    this.asa.draggable = true;
    this.asa.title = "Arrastrar para mover";
    // Decorativa: con teclado se usan «Subir bloque» / «Bajar bloque» y Alt+↑ / Alt+↓.
    this.asa.setAttribute("aria-hidden", "true");
    this.asa.dataset.asaBloque = "";
    this.ocultar();
    view.dom.parentElement?.appendChild(this.asa);

    // Tiptap traslada el editor (y el asa con él) a su contenedor definitivo, así que los eventos
    // se escuchan en el propio editor y en el asa, no en el contenedor inicial.
    view.dom.addEventListener("mousemove", this.alMover);
    view.dom.addEventListener("mouseleave", this.alSalir);
    this.asa.addEventListener("mouseleave", this.alSalir);
    this.asa.addEventListener("dragstart", this.alEmpezar);
    this.asa.addEventListener("dragend", this.alTerminar);
  }

  // Pasar del texto al asa (o al revés) no la oculta.
  private alSalir = (evento: MouseEvent) => {
    const destino = evento.relatedTarget as Node | null;
    if (destino && (destino === this.asa || this.view.dom.contains(destino))) return;
    this.ocultar();
  };

  private ocultar = () => {
    this.asa.style.display = "none";
    this.actual = null;
  };

  private alMover = (evento: MouseEvent) => {
    if (!this.view.editable) return this.ocultar();
    // Camino del puntero hacia el asa (a la izquierda del bloque actual, a su altura): se mantiene.
    if (this.actual) {
      const r = this.actual.elemento.getBoundingClientRect();
      if (evento.clientX < r.left && evento.clientY >= r.top && evento.clientY <= r.bottom) return;
    }
    // El bloque se busca donde está el puntero, para que en una lista sea el elemento y no la lista.
    const caja = this.view.dom.getBoundingClientRect();
    const encontrado = this.view.posAtCoords({
      left: Math.max(evento.clientX, caja.left + MARGEN_BUSQUEDA),
      top: evento.clientY,
    });
    if (!encontrado) return this.ocultar();
    const bloque = bloqueEn(this.view.state.doc, encontrado.inside >= 0 ? encontrado.inside : encontrado.pos);
    const elemento = bloque && this.view.nodeDOM(bloque.inicio);
    if (!bloque || !(elemento instanceof HTMLElement)) return this.ocultar();

    this.actual = { inicio: bloque.inicio, elemento };
    this.asa.style.display = "flex";
    // Posición respecto al contenedor posicionado del editor (con «position: relative»).
    const contenedor = (this.asa.offsetParent as HTMLElement | null) ?? this.view.dom;
    const rect = elemento.getBoundingClientRect();
    const base = contenedor.getBoundingClientRect();
    this.asa.style.top = `${rect.top - base.top}px`;
    this.asa.style.left = `${Math.max(0, rect.left - base.left - ANCHO_ASA - 4)}px`;
  };

  private alEmpezar = (evento: DragEvent) => {
    if (!this.actual || !evento.dataTransfer) return;
    const { view } = this;
    const seleccion = NodeSelection.create(view.state.doc, this.actual.inicio);
    view.dispatch(view.state.tr.setSelection(seleccion));
    const slice = seleccion.content();
    const { dom, text } = view.serializeForClipboard(slice);
    evento.dataTransfer.clearData();
    evento.dataTransfer.setData("text/html", dom.innerHTML);
    evento.dataTransfer.setData("text/plain", text);
    evento.dataTransfer.effectAllowed = "move";
    const elemento = view.nodeDOM(this.actual.inicio);
    if (elemento instanceof HTMLElement) evento.dataTransfer.setDragImage(elemento, 0, 0);
    view.dragging = { slice, move: true };
  };

  // Si se suelta fuera del editor, ProseMirror no limpia el estado de arrastre: se limpia aquí.
  private alTerminar = () => {
    setTimeout(() => {
      if (this.view.dragging) this.view.dragging = null;
    }, 50);
    this.ocultar();
  };

  destroy() {
    this.view.dom.removeEventListener("mousemove", this.alMover);
    this.view.dom.removeEventListener("mouseleave", this.alSalir);
    this.asa.remove();
  }
}

export function crearArrastrarBloques(claseAsa: string) {
  return Extension.create({
    name: "arrastrarBloques",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("arrastrarBloques"),
          view: (view) => new VistaAsa(view, claseAsa),
        }),
      ];
    },
  });
}
