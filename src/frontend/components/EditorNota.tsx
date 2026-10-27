"use client";

import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import styles from "./EditorNota.module.css";

// Alcance inicial aprobado (spec editor-notas): títulos y subtítulos, negrita, cursiva,
// listas, citas en bloque y enlaces web. Todo lo demás de StarterKit queda desactivado.
const EXTENSIONES = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["http", "https"],
      isAllowedUri: (url) => /^https?:\/\//i.test(url),
    },
  }),
];

type Props = { contenidoInicial: JSONContent; nombreCampo: string };

export default function EditorNota({ contenidoInicial, nombreCampo }: Props) {
  const [json, setJson] = useState(() => JSON.stringify(contenidoInicial));

  const editor = useEditor({
    extensions: EXTENSIONES,
    content: contenidoInicial,
    immediatelyRender: false,
    editorProps: { attributes: { class: styles.contenido, "aria-label": "Contenido de la nota" } },
    onUpdate: ({ editor: e }) => setJson(JSON.stringify(e.getJSON())),
  });

  const activo = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e?.isActive("heading", { level: 2 }) ?? false,
      h3: e?.isActive("heading", { level: 3 }) ?? false,
      negrita: e?.isActive("bold") ?? false,
      cursiva: e?.isActive("italic") ?? false,
      lista: e?.isActive("bulletList") ?? false,
      numerada: e?.isActive("orderedList") ?? false,
      cita: e?.isActive("blockquote") ?? false,
      enlace: e?.isActive("link") ?? false,
    }),
  });

  function editarEnlace() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Dirección del enlace (https://…)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url.trim())) {
      window.alert("Solo se admiten enlaces web que empiecen por http:// o https://");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const botones: { etiqueta: string; titulo: string; activo?: boolean; accion: () => void }[] = editor
    ? [
        { etiqueta: "T2", titulo: "Subtítulo", activo: activo?.h2, accion: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { etiqueta: "T3", titulo: "Subtítulo menor", activo: activo?.h3, accion: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { etiqueta: "N", titulo: "Negrita", activo: activo?.negrita, accion: () => editor.chain().focus().toggleBold().run() },
        { etiqueta: "C", titulo: "Cursiva", activo: activo?.cursiva, accion: () => editor.chain().focus().toggleItalic().run() },
        { etiqueta: "•", titulo: "Lista", activo: activo?.lista, accion: () => editor.chain().focus().toggleBulletList().run() },
        { etiqueta: "1.", titulo: "Lista numerada", activo: activo?.numerada, accion: () => editor.chain().focus().toggleOrderedList().run() },
        { etiqueta: "❝", titulo: "Cita en bloque", activo: activo?.cita, accion: () => editor.chain().focus().toggleBlockquote().run() },
        { etiqueta: "↗", titulo: activo?.enlace ? "Quitar enlace" : "Enlace", activo: activo?.enlace, accion: editarEnlace },
      ]
    : [];

  return (
    <div className={styles.editor}>
      <div role="toolbar" aria-label="Formato" className={styles.barra}>
        {botones.map((b) => (
          <button
            key={b.titulo}
            type="button"
            title={b.titulo}
            aria-label={b.titulo}
            aria-pressed={b.activo}
            // Evita que el botón le quite el foco al editor: así no se pierde lo que se teclea justo después.
            onMouseDown={(e) => e.preventDefault()}
            onClick={b.accion}
            className={styles.boton}
          >
            {b.etiqueta}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={nombreCampo} value={json} />
    </div>
  );
}
