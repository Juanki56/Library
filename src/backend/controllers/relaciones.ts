"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import { esEntidad } from "@/backend/services/catalogo";
import * as eliminacion from "@/backend/services/eliminacion";
import * as relacionados from "@/backend/services/relacionados";
import * as vinculos from "@/backend/services/vinculos";

export type EstadoRelacion = { error?: string };

function referencia(formulario: FormData, prefijo: "origen" | "destino"): vinculos.Referencia | null {
  const tipo = formulario.get(`${prefijo}Tipo`);
  const id = formulario.get(`${prefijo}Id`);
  if (!esEntidad(tipo) || typeof id !== "string" || !id) return null;
  return { tipo, id };
}

async function aplicar(
  formulario: FormData,
  operacion: typeof vinculos.vincular,
): Promise<EstadoRelacion> {
  const origen = referencia(formulario, "origen");
  const destino = referencia(formulario, "destino");
  if (!origen || !destino) return { error: "Elige un elemento." };
  const resultado = await operacion(await crearClienteServidor(), origen, destino);
  if (!resultado.ok) return { error: resultado.error };
  // Los dos extremos muestran el vínculo: se refrescan todas las páginas del archivo.
  revalidatePath("/", "layout");
  return {};
}

export async function vincularElementos(_estado: EstadoRelacion, formulario: FormData) {
  return aplicar(formulario, vinculos.vincular);
}

export async function desvincularElementos(_estado: EstadoRelacion, formulario: FormData) {
  return aplicar(formulario, vinculos.desvincular);
}

// Lo que se puede vincular desde «Conexiones», pedido al abrir «Vincular…» (cambio rendimiento-paginas).
export async function candidatosParaVincular(origenTipo: string, origenId: string) {
  if (!esEntidad(origenTipo) || typeof origenId !== "string") return [];
  return relacionados.candidatosParaVincular(await crearClienteServidor(), { tipo: origenTipo, id: origenId });
}

// Aviso de lo que se perderá al eliminar, pedido al abrir el cuadro de confirmación (spec relaciones).
export async function avisoParaEliminar(tipo: string, id: string): Promise<string> {
  if (!esEntidad(tipo) || typeof id !== "string") return "";
  const resumen = await eliminacion.resumenEliminacion(await crearClienteServidor(), { tipo, id });
  return resumen ? eliminacion.textoAviso(resumen) : "";
}
