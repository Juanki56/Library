"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import { esEntidad } from "@/backend/services/catalogo";
import * as etiquetas from "@/backend/services/etiquetas";

export type EstadoEtiqueta = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

// Etiquetar afecta a la ficha del elemento, a la página de la etiqueta y a la lista.
const refrescar = () => revalidatePath("/", "layout");

export async function asignarEtiqueta(_estado: EstadoEtiqueta, formulario: FormData): Promise<EstadoEtiqueta> {
  const tipo = texto(formulario, "tipo");
  if (!esEntidad(tipo)) return { error: "Elemento no válido." };
  const resultado = await etiquetas.asignar(
    await crearClienteServidor(),
    tipo,
    texto(formulario, "id"),
    texto(formulario, "nombre"),
  );
  if (!resultado.ok) return { error: resultado.error };
  refrescar();
  return { guardado: true };
}

export async function quitarEtiqueta(_estado: EstadoEtiqueta, formulario: FormData): Promise<EstadoEtiqueta> {
  const tipo = texto(formulario, "tipo");
  if (!esEntidad(tipo)) return { error: "Elemento no válido." };
  const resultado = await etiquetas.quitar(
    await crearClienteServidor(),
    tipo,
    texto(formulario, "id"),
    texto(formulario, "etiquetaId"),
  );
  if (!resultado.ok) return { error: resultado.error };
  refrescar();
  return {};
}

export async function crearEtiqueta(_estado: EstadoEtiqueta, formulario: FormData): Promise<EstadoEtiqueta> {
  const resultado = await etiquetas.crear(await crearClienteServidor(), texto(formulario, "nombre"));
  if (!resultado.ok) return { error: resultado.error };
  refrescar();
  return { guardado: true };
}

export async function renombrarEtiqueta(_estado: EstadoEtiqueta, formulario: FormData): Promise<EstadoEtiqueta> {
  const resultado = await etiquetas.renombrar(
    await crearClienteServidor(),
    texto(formulario, "id"),
    texto(formulario, "nombre"),
  );
  if (!resultado.ok) return { error: resultado.error };
  refrescar();
  return { guardado: true };
}

export async function eliminarEtiqueta(_estado: EstadoEtiqueta, formulario: FormData): Promise<EstadoEtiqueta> {
  const resultado = await etiquetas.eliminar(await crearClienteServidor(), texto(formulario, "id"));
  if (!resultado.ok) return { error: resultado.error };
  refrescar();
  redirect("/etiquetas");
}
