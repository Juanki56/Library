"use client";

import type { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { borrarCopia, leerCopia, type CopiaGuardada } from "./copiaLocal";
import EditorNota from "./EditorNota";
import styles from "./Formularios.module.css";
import aviso from "./FormularioNota.module.css";
import { useGuardadoAutomatico } from "./useGuardadoAutomatico";

type Props = { id: string; titulo: string; contenido: JSONContent; version: string };

const TEXTO_ESTADO = {
  guardado: "Guardado",
  pendiente: "Cambios sin guardar",
  guardando: "Guardando…",
} as const;

// Título y contenido con guardado automático, sin botón de guardar (spec editor-notas).
export default function FormularioNota({ id, titulo, contenido, version }: Props) {
  const { situacion, cambio, guardarAhora, reintentar, guardarEncima } = useGuardadoAutomatico(id, version);
  const [inicial, setInicial] = useState({ titulo, contenido, clave: 0 });
  const [copia, setCopia] = useState<CopiaGuardada | null>(null);
  const actual = useRef({ titulo, contenido: JSON.stringify(contenido) });

  // Al abrir: si hay una copia local distinta de lo guardado, se ofrece recuperarla (design D6).
  useEffect(() => {
    const local = leerCopia(id);
    if (!local) return;
    if (local.titulo === titulo && local.contenido === JSON.stringify(contenido)) borrarCopia(id);
    else setCopia(local);
  }, [id, titulo, contenido]);

  function cambiar(parte: Partial<{ titulo: string; contenido: string }>) {
    actual.current = { ...actual.current, ...parte };
    cambio(actual.current);
  }

  function recuperar() {
    if (!copia) return;
    let doc: JSONContent = contenido;
    try {
      doc = JSON.parse(copia.contenido) as JSONContent;
    } catch {
      // Copia dañada: se conserva el contenido guardado.
    }
    setInicial((x) => ({ titulo: copia.titulo, contenido: doc, clave: x.clave + 1 }));
    setCopia(null);
    cambiar({ titulo: copia.titulo, contenido: JSON.stringify(doc) });
  }

  function descartar() {
    borrarCopia(id);
    setCopia(null);
  }

  function cargarMasReciente() {
    borrarCopia(id);
    window.location.reload();
  }

  const { estado, mensaje } = situacion;
  const esError = estado === "error" || estado === "sin-conexion";

  return (
    <div className={styles.formulario}>
      <div className={aviso.estado} role="status" aria-live="polite" aria-label="Estado del guardado">
        {estado in TEXTO_ESTADO ? (
          <span className={estado === "guardado" ? aviso.guardado : aviso.pendiente}>
            {TEXTO_ESTADO[estado as keyof typeof TEXTO_ESTADO]}
          </span>
        ) : estado === "conflicto" ? null : (
          <span className={aviso.error}>{mensaje}</span>
        )}
        {esError && (
          <button type="button" onClick={reintentar} className={aviso.boton}>
            Reintentar
          </button>
        )}
      </div>

      {copia && (
        <div role="alert" className={aviso.avisoEnLinea}>
          <p>Hay cambios de esta nota que no llegaron a guardarse en este dispositivo.</p>
          <div className={aviso.acciones}>
            <button type="button" onClick={recuperar} className={aviso.principal}>
              Recuperar cambios no guardados
            </button>
            <button type="button" onClick={descartar} className={aviso.boton}>
              Descartar
            </button>
          </div>
        </div>
      )}

      {estado === "conflicto" && (
        <div role="alert" className={aviso.avisoEnLinea}>
          <p>{mensaje} Tus cambios no se han guardado para no sobrescribir la versión más reciente.</p>
          <div className={aviso.acciones}>
            <button type="button" onClick={cargarMasReciente} className={aviso.boton}>
              Cargar la versión más reciente
            </button>
            <button type="button" onClick={guardarEncima} className={aviso.principal}>
              Guardar mis cambios encima
            </button>
          </div>
        </div>
      )}

      <label className={styles.campo}>
        Título
        <input
          key={`titulo-${inicial.clave}`}
          name="titulo"
          defaultValue={inicial.titulo}
          required
          maxLength={300}
          className={styles.titulo}
          onChange={(e) => cambiar({ titulo: e.target.value })}
          onBlur={guardarAhora}
        />
      </label>
      <EditorNota
        key={`editor-${inicial.clave}`}
        contenidoInicial={inicial.contenido}
        onCambio={(json) => cambiar({ contenido: json })}
        onSalir={guardarAhora}
      />
    </div>
  );
}
