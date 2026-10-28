"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as eliminacion from "@/backend/services/eliminacion";
import * as menciones from "@/backend/services/menciones";
import * as notas from "@/backend/services/notas";

export type EstadoNota = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

export async function crearNota(_estado: EstadoNota, formulario: FormData): Promise<EstadoNota> {
  const resultado = await notas.crearNota(await crearClienteServidor(), texto(formulario, "titulo"));
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/notas");
  redirect(`/notas/${resultado.valor}`);
}

// Guardado automático con versión (design D5 y D7). No refresca la página: las secciones del
// archivo son dinámicas y leen la versión guardada al volver a abrirlas.
export async function guardarNotaAutomatico(
  id: string,
  titulo: string,
  contenido: string,
  versionBase: string,
): Promise<notas.ResultadoGuardado> {
  if (typeof id !== "string" || typeof titulo !== "string" || typeof contenido !== "string" || typeof versionBase !== "string") {
    return { tipo: "error", error: notas.ERROR_CONTENIDO, validacion: true };
  }
  return notas.guardarConVersion(await crearClienteServidor(), id, titulo, contenido, versionBase);
}

// Notas que se pueden referenciar desde la nota abierta (cuadro «Referencia a una nota», design D3).
export async function notasParaReferencia(excluirId: string): Promise<menciones.NotaReferida[]> {
  if (typeof excluirId !== "string") return [];
  return menciones.notasParaReferencia(await crearClienteServidor(), excluirId);
}

export async function eliminarNota(_estado: EstadoNota, formulario: FormData): Promise<EstadoNota> {
  const resultado = await eliminacion.eliminar(await crearClienteServidor(), {
    tipo: "nota",
    id: texto(formulario, "id"),
  });
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/notas");
  redirect("/notas");
}
