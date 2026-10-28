"use client";

import { Extension, type Editor, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import { abrirCuadroReferencia } from "./nodoReferencia";

// Menú «/» para insertar bloques (design D3): se activa con «/» al principio de un bloque
// vacío y filtra sin distinguir tildes ni mayúsculas. También abre el cuadro de referencias.

export type Comando = { titulo: string; descripcion: string; ejecutar: (editor: Editor, range: Range) => void };

export const COMANDOS: Comando[] = [
  {
    titulo: "Subtítulo",
    descripcion: "Título de sección",
    ejecutar: (e, r) => e.chain().focus().deleteRange(r).setNode("heading", { level: 2 }).run(),
  },
  {
    titulo: "Subtítulo menor",
    descripcion: "Título de apartado",
    ejecutar: (e, r) => e.chain().focus().deleteRange(r).setNode("heading", { level: 3 }).run(),
  },
  {
    titulo: "Lista",
    descripcion: "Lista con viñetas",
    ejecutar: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run(),
  },
  {
    titulo: "Lista numerada",
    descripcion: "Lista con números",
    ejecutar: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run(),
  },
  {
    titulo: "Lista de tareas",
    descripcion: "Tareas con casilla",
    ejecutar: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run(),
  },
  {
    titulo: "Cita",
    descripcion: "Cita en bloque",
    ejecutar: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run(),
  },
  {
    titulo: "Separador",
    descripcion: "Línea de separación",
    ejecutar: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
  },
  {
    titulo: "Referencia a una nota",
    descripcion: "Enlace a otra nota que muestra su título",
    ejecutar: (e, r) => {
      e.chain().focus().deleteRange(r).run();
      abrirCuadroReferencia(e.storage);
    },
  },
];

export const sinTildes = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export function filtrarComandos(consulta: string): Comando[] {
  const q = sinTildes(consulta);
  return COMANDOS.filter((c) => sinTildes(c.titulo).includes(q));
}

// Estado del menú para la interfaz React, y las teclas que este gestiona.
export type MenuBarra = {
  items: Comando[];
  seleccion: number;
  rect: DOMRect | null;
  elegir: (indice: number) => void;
};

export type ControlMenuBarra = {
  abrir: (menu: MenuBarra) => void;
  actualizar: (menu: MenuBarra) => void;
  cerrar: () => void;
  tecla: (evento: KeyboardEvent) => boolean;
};

export const clavePluginBarra = new PluginKey("comandosBarra");

export function crearComandosBarra(control: { actual: ControlMenuBarra | null }) {
  return Extension.create({
    name: "comandosBarra",
    addProseMirrorPlugins() {
      return [
        Suggestion<Comando, Comando>({
          editor: this.editor,
          pluginKey: clavePluginBarra,
          char: "/",
          startOfLine: true,
          // Solo en un bloque que contiene únicamente la orden «/…».
          allow: ({ state, range }) => {
            const $desde = state.doc.resolve(range.from);
            return $desde.parent.textContent.startsWith("/") && $desde.parentOffset === 0;
          },
          items: ({ query }) => filtrarComandos(query),
          command: ({ editor, range, props }) => props.ejecutar(editor, range),
          render: () => {
            const menu = (p: SuggestionProps<Comando, Comando>, seleccion = 0): MenuBarra => ({
              items: p.items,
              seleccion,
              rect: p.clientRect?.() ?? null,
              elegir: (i) => p.items[i] && p.command(p.items[i]),
            });
            return {
              onStart: (p) => control.actual?.abrir(menu(p)),
              onUpdate: (p) => control.actual?.actualizar(menu(p)),
              onExit: () => control.actual?.cerrar(),
              onKeyDown: ({ event }: SuggestionKeyDownProps) => control.actual?.tecla(event) ?? false,
            };
          },
        }),
      ];
    },
  });
}
