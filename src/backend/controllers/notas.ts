"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as imagenes from "@/backend/services/imagenes";
import * as menciones from "@/backend/services/menciones";
import * as notas from "@/backend/services/notas";
import * as relacionados from "@/backend/services/relacionados";
import * as vinculos from "@/backend/services/vinculos";

export type EstadoNota = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

// Con «vincular» (tipo:id) la nota nace vinculada a ese libro, recurso o proyecto (cambio conexiones,
// design D5). Si el vínculo fallara, la nota ya existe y se abre igualmente.
export async function crearNota(_estado: EstadoNota, formulario: FormData): Promise<EstadoNota> {
  const cliente = await crearClienteServidor();
  const resultado = await notas.crearNota(cliente, texto(formulario, "titulo"));
  if (!resultado.ok) return { error: resultado.error };
  const destino = await relacionados.destinoNotaVinculada(cliente, texto(formulario, "vincular"));
  if (destino) {
    await vinculos.vincular(cliente, { tipo: "nota", id: resultado.valor }, destino);
    revalidatePath("/", "layout");
  }
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
  // Con sus imágenes subidas (spec editor-notas: «Limpieza de imágenes subidas»), que se borran
  // después de responder.
  const resultado = await imagenes.eliminarNota(await crearClienteServidor(), texto(formulario, "id"), after);
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/notas");
  redirect("/notas");
}

// Sube una imagen a la nota (design D3). Devuelve la ruta privada o el aviso para el usuario.
export async function subirImagen(notaId: string, formulario: FormData): Promise<imagenes.ResultadoSubida> {
  if (typeof notaId !== "string" || !(formulario instanceof FormData)) {
    return { ok: false, error: imagenes.ERROR_SUBIDA };
  }
  return imagenes.subirImagen(await crearClienteServidor(), notaId, formulario.get("archivo"));
}
