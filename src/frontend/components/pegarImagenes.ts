"use client";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// Pegar o soltar archivos de imagen en el editor (cambio editor-pegar-imagenes, design D1).
// La extensión solo detecta los archivos; subirlos, avisar e insertar lo hace EditorNota.

// pos: donde se soltó el archivo, o null si se pegó (se inserta donde esté el cursor).
export type SubirArchivos = (archivos: File[], pos: number | null) => void;

function imagenes(lista: FileList | null | undefined): File[] {
  return Array.from(lista ?? []).filter((f) => f.type.startsWith("image/"));
}

export function crearPegarImagenes(control: { actual: SubirArchivos | null }) {
  return Extension.create({
    name: "pegarImagenes",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("pegarImagenes"),
          props: {
            handlePaste: (_vista, evento) => {
              const archivos = imagenes(evento.clipboardData?.files);
              if (!archivos.length || !control.actual) return false;
              evento.preventDefault();
              control.actual(archivos, null);
              return true;
            },
            // «moved»: arrastre de un bloque dentro del editor; lo resuelve ProseMirror.
            handleDrop: (vista, evento, _slice, moved) => {
              if (moved) return false;
              const archivos = imagenes(evento.dataTransfer?.files);
              if (!archivos.length || !control.actual) return false;
              evento.preventDefault();
              const pos = vista.posAtCoords({ left: evento.clientX, top: evento.clientY })?.pos ?? null;
              control.actual(archivos, pos);
              return true;
            },
          },
        }),
      ];
    },
  });
}
