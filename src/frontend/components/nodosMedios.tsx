"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { useState } from "react";
import {
  direccionImagen,
  enlaceVideo,
  esVideo,
  NOMBRE_PROVEEDOR,
  reproductorVideo,
  type Video as DatosVideo,
} from "@/backend/services/medios";
import type { AlmacenCuadro } from "./cuadrosEditor";
import styles from "./EditorNota.module.css";

// Imágenes y vídeos de las notas (cambio editor-fase3-imagenes-videos, design D1, D5 y D6).

export const AVISO_IMAGEN = "No se pudo cargar la imagen.";

// Atributo guardado tal cual en el JSON; en el HTML del portapapeles va como data-*.
const atributo = (nombre: string, porDefecto: unknown = null) => ({
  default: porDefecto,
  parseHTML: (el: HTMLElement) => el.getAttribute(`data-${nombre}`) ?? porDefecto,
  renderHTML: (attrs: Record<string, unknown>) => (attrs[nombre] ? { [`data-${nombre}`]: attrs[nombre] } : {}),
});

function ImagenCargada({ src, alt, origen }: { src: string; alt: string; origen: string }) {
  const [fallo, setFallo] = useState(false);
  if (fallo) {
    return (
      <p className={styles.medioAviso}>
        {AVISO_IMAGEN}{" "}
        {origen === "web" && (
          <a href={src} target="_blank" rel="noreferrer noopener">
            {new URL(src).hostname}
          </a>
        )}
      </p>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- imagen privada o externa: next/image no aplica
  return <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFallo(true)} />;
}

function VistaImagen({ node }: ReactNodeViewProps) {
  const { origen, ruta, src, alt, pie } = node.attrs as Record<string, string>;
  const direccion = origen === "archivo" ? direccionImagen(ruta) : src;
  return (
    <NodeViewWrapper as="figure" className={styles.figura} data-imagen="">
      {/* key: si cambia la dirección, se vuelve a intentar cargar */}
      <ImagenCargada key={direccion} src={direccion} alt={alt ?? ""} origen={origen} />
      {pie && <figcaption>{pie}</figcaption>}
    </NodeViewWrapper>
  );
}

export const Imagen = Node.create<object, AlmacenCuadro>({
  name: "imagen",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addStorage() {
    return { abrir: () => {} };
  },

  addAttributes() {
    return {
      origen: atributo("origen", "web"),
      ruta: atributo("ruta"),
      src: atributo("src"),
      alt: atributo("alt", ""),
      pie: atributo("pie", ""),
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-imagen]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes({ "data-imagen": "" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VistaImagen);
  },
});

function VistaVideo({ node }: ReactNodeViewProps) {
  const video = node.attrs as DatosVideo;
  if (!esVideo(video.proveedor, video.id)) return <NodeViewWrapper as="div" />;
  const nombre = NOMBRE_PROVEEDOR[video.proveedor];
  return (
    <NodeViewWrapper as="figure" className={styles.figura} data-video="">
      <div className={styles.reproductor}>
        <iframe
          src={reproductorVideo(video)}
          title={`Vídeo de ${nombre}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
      <figcaption>
        <a href={enlaceVideo(video)} target="_blank" rel="noreferrer noopener">
          Ver en {nombre}
        </a>
      </figcaption>
    </NodeViewWrapper>
  );
}

export const Video = Node.create<object, AlmacenCuadro>({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addStorage() {
    return { abrir: () => {} };
  },

  addAttributes() {
    return { proveedor: atributo("proveedor"), id: atributo("id") };
  },

  parseHTML() {
    return [{ tag: "figure[data-video]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes({ "data-video": "" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VistaVideo);
  },
});
