"use client";

import { useEffect, useRef, useState } from "react";
import { guardarNotaAutomatico } from "@/backend/controllers/notas";
import { copiaLocalDe } from "./copiaLocal";
import { GuardadoAutomatico, type Borrador, type Situacion } from "./guardadoAutomatico";

// Conecta la lógica del guardado automático con la página (design D5): guarda al ocultar la
// pestaña o salir de la página, reintenta al volver la conexión y avisa al cerrar con cambios.
export function useGuardadoAutomatico(idNota: string, versionInicial: string) {
  const [situacion, setSituacion] = useState<Situacion>({ estado: "guardado" });
  const guardado = useRef<GuardadoAutomatico | null>(null);

  if (!guardado.current) {
    guardado.current = new GuardadoAutomatico({
      versionInicial,
      guardar: (b, version) => guardarNotaAutomatico(idNota, b.titulo, b.contenido, version),
      alCambiar: setSituacion,
      copiaLocal: copiaLocalDe(idNota),
      enLinea: () => (typeof navigator === "undefined" ? true : navigator.onLine),
    });
  }

  useEffect(() => {
    const g = guardado.current!;
    const alOcultar = () => {
      if (document.visibilityState === "hidden") g.guardarAhora();
    };
    const alVolverConexion = () => g.reintentar();
    const antesDeSalir = (evento: BeforeUnloadEvent) => {
      if (!g.hayCambiosSinGuardar()) return;
      g.guardarAhora();
      evento.preventDefault();
      evento.returnValue = "";
    };
    document.addEventListener("visibilitychange", alOcultar);
    window.addEventListener("online", alVolverConexion);
    window.addEventListener("beforeunload", antesDeSalir);
    return () => {
      document.removeEventListener("visibilitychange", alOcultar);
      window.removeEventListener("online", alVolverConexion);
      window.removeEventListener("beforeunload", antesDeSalir);
      // Al salir de la nota dentro de la app: se envía lo pendiente.
      g.guardarAhora();
      g.destruir();
    };
  }, []);

  const g = guardado.current;
  return {
    situacion,
    cambio: (b: Borrador) => g.cambio(b),
    guardarAhora: () => g.guardarAhora(),
    reintentar: () => g.reintentar(),
    guardarEncima: () => g.guardarEncima(),
  };
}
