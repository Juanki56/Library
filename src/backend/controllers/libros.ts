"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as libros from "@/backend/services/libros";

export type EstadoLibro = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

const entrada = (formulario: FormData): libros.EntradaLibro => ({
  titulo: texto(formulario, "titulo"),
  autores: texto(formulario, "autores"),
  anio: texto(formulario, "anio"),
  editorial: texto(formulario, "editorial"),
  descripcion: texto(formulario, "descripcion"),
  isbn: texto(formulario, "isbn"),
  estadoLectura: texto(formulario, "estadoLectura"),
});

export async function crearLibro(_estado: EstadoLibro, formulario: FormData): Promise<EstadoLibro> {
  const resultado = await libros.crearLibro(await crearClienteServidor(), entrada(formulario));
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/libros");
  redirect(`/libros/${resultado.valor}`);
}

export async function guardarLibro(_estado: EstadoLibro, formulario: FormData): Promise<EstadoLibro> {
  const resultado = await libros.guardarLibro(
    await crearClienteServidor(),
    texto(formulario, "id"),
    entrada(formulario),
  );
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  return { guardado: true };
}

export async function eliminarLibro(_estado: EstadoLibro, formulario: FormData): Promise<EstadoLibro> {
  // Con su portada subida (requisito «Portada del libro»), que se borra después de responder.
  const resultado = await libros.eliminarLibro(await crearClienteServidor(), texto(formulario, "id"), after);
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  redirect("/libros");
}

// Portada del libro (design D3): subir un archivo, indicar una dirección web o quitarla.
export async function cambiarPortada(_estado: EstadoLibro, formulario: FormData): Promise<EstadoLibro> {
  const id = texto(formulario, "id");
  const accion = texto(formulario, "accion");
  const cambio: libros.CambioPortada =
    accion === "quitar"
      ? { tipo: "quitar" }
      : texto(formulario, "origen") === "web"
        ? { tipo: "web", url: texto(formulario, "url") }
        : { tipo: "archivo", archivo: formulario.get("archivo") };
  const resultado = await libros.cambiarPortada(await crearClienteServidor(), id, cambio);
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  return { guardado: true };
}
