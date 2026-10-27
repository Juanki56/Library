// Copia local de seguridad de una nota con cambios sin guardar (design D6). Es una ayuda de
// este dispositivo, no la fuente de verdad: si localStorage no está disponible, no hace nada.
import type { Borrador, CopiaLocal } from "./guardadoAutomatico";

export type CopiaGuardada = Borrador & { versionBase: string; guardadaEn: number };

const clave = (idNota: string) => `biblioteca:borrador:${idNota}`;

function almacen(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function leerCopia(idNota: string): CopiaGuardada | null {
  try {
    const texto = almacen()?.getItem(clave(idNota));
    if (!texto) return null;
    const copia = JSON.parse(texto) as Partial<CopiaGuardada>;
    if (typeof copia.titulo !== "string" || typeof copia.contenido !== "string" || typeof copia.versionBase !== "string")
      return null;
    return copia as CopiaGuardada;
  } catch {
    return null;
  }
}

export function borrarCopia(idNota: string): void {
  try {
    almacen()?.removeItem(clave(idNota));
  } catch {
    // Sin almacenamiento disponible: nada que borrar.
  }
}

export function copiaLocalDe(idNota: string): CopiaLocal {
  return {
    escribir: (borrador, versionBase) => {
      try {
        const copia: CopiaGuardada = { ...borrador, versionBase, guardadaEn: Date.now() };
        almacen()?.setItem(clave(idNota), JSON.stringify(copia));
      } catch {
        // Sin espacio o en modo privado: se pierde solo esta red de seguridad.
      }
    },
    borrar: () => borrarCopia(idNota),
  };
}
