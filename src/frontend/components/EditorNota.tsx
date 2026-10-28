"use client";

import Highlight from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useRef, useState } from "react";
import { esEnlaceWeb } from "@/backend/services/enlaces";
import { crearComandosBarra, type ControlMenuBarra, type MenuBarra } from "./comandosBarra";
import CuadroEnlace from "./CuadroEnlace";
import CuadroImagen, { type DatosImagen } from "./CuadroImagen";
import CuadroReferencia from "./CuadroReferencia";
import CuadroVideo from "./CuadroVideo";
import { ponerAbridor } from "./cuadrosEditor";
import styles from "./EditorNota.module.css";
import IndiceNota from "./IndiceNota";
import { MoverBloques } from "./moverBloques";
import { Referencia, TitulosReferencias } from "./nodoReferencia";
import { Imagen, Video } from "./nodosMedios";

// Alcance aprobado del editor (spec editor-notas, fase 1): títulos y subtítulos, negrita, cursiva,
// subrayado, resaltado, listas con viñetas, numeradas y de tareas, citas, separadores y enlaces web;
// fase 2: referencias a otras notas; fase 3: imágenes y vídeos de YouTube y Vimeo;
// fase 4: mover bloques, índice de la nota y tablas.
function extensiones(control: { actual: ControlMenuBarra | null }) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      code: false,
      codeBlock: false,
      strike: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        isAllowedUri: (url) => esEnlaceWeb(url),
      },
    }),
    Highlight.configure({ multicolor: false }),
    TaskList,
    TaskItem.configure({
      nested: true,
      // Etiqueta de la casilla para lectores de pantalla (por defecto está en inglés).
      a11y: {
        checkboxLabel: (nodo, marcada) =>
          `${marcada ? "Tarea hecha" : "Tarea pendiente"}: ${nodo.textContent || "tarea vacía"}`,
      },
    }),
    Referencia,
    Imagen,
    Video,
    TableKit.configure({ table: { resizable: false } }),
    MoverBloques,
    crearComandosBarra(control),
  ];
}

type Props = {
  notaId: string;
  contenidoInicial: JSONContent;
  // Título actual de cada nota referenciada en el contenido (design D2).
  titulosReferencias: Record<string, string>;
  // Cada cambio del contenido, como JSON (lo recoge el guardado automático).
  onCambio: (contenido: string) => void;
  // El editor pierde el foco: momento para guardar sin esperar.
  onSalir?: () => void;
};

type Boton = { etiqueta: string; titulo: string; activo?: boolean; accion: () => void };

function estadoFormatos(e: Editor | null) {
  return {
    h2: e?.isActive("heading", { level: 2 }) ?? false,
    h3: e?.isActive("heading", { level: 3 }) ?? false,
    negrita: e?.isActive("bold") ?? false,
    cursiva: e?.isActive("italic") ?? false,
    subrayado: e?.isActive("underline") ?? false,
    resaltado: e?.isActive("highlight") ?? false,
    lista: e?.isActive("bulletList") ?? false,
    numerada: e?.isActive("orderedList") ?? false,
    tareas: e?.isActive("taskList") ?? false,
    cita: e?.isActive("blockquote") ?? false,
    enlace: e?.isActive("link") ?? false,
    imagen: e?.isActive("imagen") ?? false,
    tabla: e?.isActive("table") ?? false,
  };
}

function Botones({ botones }: { botones: Boton[] }) {
  return botones.map((b) => (
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
  ));
}

export default function EditorNota({ notaId, contenidoInicial, titulosReferencias, onCambio, onSalir }: Props) {
  const [titulos, setTitulos] = useState(titulosReferencias);
  const [cuadroReferencia, setCuadroReferencia] = useState(false);
  const [cuadroImagen, setCuadroImagen] = useState<{ abierto: boolean; editando: { alt: string; pie: string } | null }>({
    abierto: false,
    editando: null,
  });
  const [cuadroVideo, setCuadroVideo] = useState(false);
  const [menuBarra, setMenuBarra] = useState<MenuBarra | null>(null);
  const [cuadro, setCuadro] = useState<{ abierto: boolean; href: string; hayEnlace: boolean }>({
    abierto: false,
    href: "",
    hayEnlace: false,
  });
  const menuActual = useRef<MenuBarra | null>(null);
  const abrirEnlaceRef = useRef<() => void>(() => {});
  const avisos = useRef({ onCambio, onSalir });
  avisos.current = { onCambio, onSalir };

  // Puente entre el menú «/» (plugin de ProseMirror) y su interfaz React.
  const control = useMemo(() => {
    const ref: { actual: ControlMenuBarra | null } = { actual: null };
    const poner = (m: MenuBarra | null) => {
      menuActual.current = m;
      setMenuBarra(m);
    };
    ref.actual = {
      abrir: poner,
      actualizar: (m) => poner({ ...m, seleccion: 0 }),
      cerrar: () => poner(null),
      tecla: (evento) => {
        const m = menuActual.current;
        if (!m || m.items.length === 0) return false;
        if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
          const paso = evento.key === "ArrowDown" ? 1 : -1;
          poner({ ...m, seleccion: (m.seleccion + paso + m.items.length) % m.items.length });
          return true;
        }
        if (evento.key === "Enter") {
          m.elegir(m.seleccion);
          return true;
        }
        if (evento.key === "Escape") {
          poner(null);
          return true;
        }
        return false;
      },
    };
    return ref;
  }, []);

  const editor = useEditor({
    extensions: extensiones(control),
    content: contenidoInicial,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: styles.contenido, "aria-label": "Contenido de la nota" },
      handleKeyDown: (_vista, evento) => {
        if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
          evento.preventDefault();
          abrirEnlaceRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => avisos.current.onCambio(JSON.stringify(e.getJSON())),
    onBlur: () => avisos.current.onSalir?.(),
  });

  const activo = useEditorState({ editor, selector: ({ editor: e }) => estadoFormatos(e) });

  function abrirEnlace() {
    if (!editor) return;
    setCuadro({
      abierto: true,
      href: (editor.getAttributes("link").href as string | undefined) ?? "",
      hayEnlace: editor.isActive("link"),
    });
  }
  abrirEnlaceRef.current = abrirEnlace;

  // El menú «/» abre el cuadro de referencias a través del almacén del nodo.
  useEffect(() => {
    if (!editor) return;
    ponerAbridor(editor.storage, "referencia", () => setCuadroReferencia(true));
    ponerAbridor(editor.storage, "imagen", () => setCuadroImagen({ abierto: true, editando: null }));
    ponerAbridor(editor.storage, "video", () => setCuadroVideo(true));
  }, [editor]);

  // Con una imagen seleccionada, el botón edita su texto alternativo y su pie.
  function abrirImagen() {
    if (!editor) return;
    const seleccionada = editor.isActive("imagen");
    const attrs = editor.getAttributes("imagen");
    setCuadroImagen({
      abierto: true,
      editando: seleccionada ? { alt: String(attrs.alt ?? ""), pie: String(attrs.pie ?? "") } : null,
    });
  }

  function insertarImagen(imagen: DatosImagen) {
    setCuadroImagen({ abierto: false, editando: null });
    editor?.chain().focus().insertContent({ type: "imagen", attrs: imagen }).run();
  }

  function editarImagen(datos: { alt: string; pie: string }) {
    setCuadroImagen({ abierto: false, editando: null });
    editor?.chain().focus().updateAttributes("imagen", datos).run();
  }

  function insertarReferencia(nota: { id: string; titulo: string }) {
    setTitulos((t) => ({ ...t, [nota.id]: nota.titulo }));
    setCuadroReferencia(false);
    editor
      ?.chain()
      .focus()
      .insertContent([
        { type: "referencia", attrs: { tipo: "nota", id: nota.id } },
        { type: "text", text: " " },
      ])
      .run();
  }

  function aplicarEnlace(href: string) {
    if (!editor) return;
    if (editor.state.selection.empty && !editor.isActive("link")) {
      editor.chain().focus().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setCuadro((c) => ({ ...c, abierto: false }));
  }

  function quitarEnlace() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setCuadro((c) => ({ ...c, abierto: false }));
  }

  const c = () => editor!.chain().focus();
  const grupos: Boton[][] = editor
    ? [
        [
          { etiqueta: "T2", titulo: "Subtítulo", activo: activo?.h2, accion: () => c().toggleHeading({ level: 2 }).run() },
          { etiqueta: "T3", titulo: "Subtítulo menor", activo: activo?.h3, accion: () => c().toggleHeading({ level: 3 }).run() },
        ],
        [
          { etiqueta: "N", titulo: "Negrita", activo: activo?.negrita, accion: () => c().toggleBold().run() },
          { etiqueta: "C", titulo: "Cursiva", activo: activo?.cursiva, accion: () => c().toggleItalic().run() },
          { etiqueta: "S", titulo: "Subrayado", activo: activo?.subrayado, accion: () => c().toggleUnderline().run() },
          { etiqueta: "R", titulo: "Resaltar", activo: activo?.resaltado, accion: () => c().toggleHighlight().run() },
        ],
        [
          { etiqueta: "•", titulo: "Lista", activo: activo?.lista, accion: () => c().toggleBulletList().run() },
          { etiqueta: "1.", titulo: "Lista numerada", activo: activo?.numerada, accion: () => c().toggleOrderedList().run() },
          { etiqueta: "☐", titulo: "Lista de tareas", activo: activo?.tareas, accion: () => c().toggleTaskList().run() },
          { etiqueta: "❝", titulo: "Cita en bloque", activo: activo?.cita, accion: () => c().toggleBlockquote().run() },
          { etiqueta: "—", titulo: "Separador", accion: () => c().setHorizontalRule().run() },
        ],
        [
          { etiqueta: "↗", titulo: activo?.enlace ? "Editar enlace" : "Enlace", activo: activo?.enlace, accion: abrirEnlace },
          { etiqueta: "§", titulo: "Referencia a una nota", accion: () => setCuadroReferencia(true) },
        ],
        [
          { etiqueta: "▣", titulo: activo?.imagen ? "Editar imagen" : "Imagen", activo: activo?.imagen, accion: abrirImagen },
          { etiqueta: "▶", titulo: "Vídeo", accion: () => setCuadroVideo(true) },
          { etiqueta: "▦", titulo: "Tabla", activo: activo?.tabla, accion: () => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        ],
        [
          { etiqueta: "↑", titulo: "Subir bloque", accion: () => c().moverBloque("arriba").run() },
          { etiqueta: "↓", titulo: "Bajar bloque", accion: () => c().moverBloque("abajo").run() },
        ],
        // Acciones de tabla: solo con el cursor dentro de una tabla (design D3).
        ...(activo?.tabla
          ? [
              [
                { etiqueta: "+F", titulo: "Añadir fila", accion: () => c().addRowAfter().run() },
                { etiqueta: "+C", titulo: "Añadir columna", accion: () => c().addColumnAfter().run() },
                { etiqueta: "−F", titulo: "Eliminar fila", accion: () => c().deleteRow().run() },
                { etiqueta: "−C", titulo: "Eliminar columna", accion: () => c().deleteColumn().run() },
                { etiqueta: "✕▦", titulo: "Eliminar tabla", accion: () => c().deleteTable().run() },
              ],
            ]
          : []),
      ]
    : [];

  const enBurbuja: Boton[] = editor
    ? [
        { etiqueta: "N", titulo: "Negrita", activo: activo?.negrita, accion: () => c().toggleBold().run() },
        { etiqueta: "C", titulo: "Cursiva", activo: activo?.cursiva, accion: () => c().toggleItalic().run() },
        { etiqueta: "S", titulo: "Subrayado", activo: activo?.subrayado, accion: () => c().toggleUnderline().run() },
        { etiqueta: "R", titulo: "Resaltar", activo: activo?.resaltado, accion: () => c().toggleHighlight().run() },
        { etiqueta: "↗", titulo: activo?.enlace ? "Editar enlace" : "Enlace", activo: activo?.enlace, accion: abrirEnlace },
      ]
    : [];

  return (
    <div className={styles.editor}>
      <div role="toolbar" aria-label="Formato" className={styles.barra}>
        {grupos.map((g, i) => (
          <div key={i} className={styles.grupo}>
            <Botones botones={g} />
          </div>
        ))}
      </div>

      {editor && (
        <BubbleMenu editor={editor}>
          {/* El rol y el nombre van en un contenedor propio: BubbleMenu no copia esos atributos. */}
          <div role="toolbar" aria-label="Formato de la selección" className={styles.burbuja}>
            <Botones botones={enBurbuja} />
          </div>
        </BubbleMenu>
      )}

      <IndiceNota editor={editor} />

      <TitulosReferencias.Provider value={titulos}>
        <EditorContent editor={editor} />
      </TitulosReferencias.Provider>

      {menuBarra && menuBarra.items.length > 0 && (
        <div
          role="listbox"
          aria-label="Insertar bloque"
          className={styles.menuBarra}
          style={{
            top: (menuBarra.rect?.bottom ?? 0) + 6,
            left: menuBarra.rect?.left ?? 0,
          }}
        >
          {menuBarra.items.map((item, i) => (
            <div
              key={item.titulo}
              role="option"
              aria-selected={i === menuBarra.seleccion}
              className={styles.opcion}
              onMouseDown={(e) => {
                e.preventDefault();
                menuBarra.elegir(i);
              }}
            >
              <span className={styles.opcionTitulo}>{item.titulo}</span>
              <span className={styles.opcionDescripcion}>{item.descripcion}</span>
            </div>
          ))}
        </div>
      )}

      <CuadroEnlace
        abierto={cuadro.abierto}
        hrefInicial={cuadro.href}
        hayEnlace={cuadro.hayEnlace}
        onAplicar={aplicarEnlace}
        onQuitar={quitarEnlace}
        onCerrar={() => {
          setCuadro((x) => ({ ...x, abierto: false }));
          editor?.commands.focus();
        }}
      />

      <CuadroImagen
        abierto={cuadroImagen.abierto}
        notaId={notaId}
        editando={cuadroImagen.editando}
        onInsertar={insertarImagen}
        onEditar={editarImagen}
        onCerrar={() => {
          setCuadroImagen({ abierto: false, editando: null });
          editor?.commands.focus();
        }}
      />

      <CuadroVideo
        abierto={cuadroVideo}
        onInsertar={(video) => {
          setCuadroVideo(false);
          editor?.chain().focus().insertContent({ type: "video", attrs: video }).run();
        }}
        onCerrar={() => {
          setCuadroVideo(false);
          editor?.commands.focus();
        }}
      />

      <CuadroReferencia
        abierto={cuadroReferencia}
        notaId={notaId}
        onElegir={insertarReferencia}
        onCerrar={() => {
          setCuadroReferencia(false);
          editor?.commands.focus();
        }}
      />
    </div>
  );
}
