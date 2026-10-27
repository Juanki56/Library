"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as eliminacion from "@/backend/services/eliminacion";
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
  notasBibliograficas: texto(formulario, "notasBibliograficas"),
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
  const resultado = await eliminacion.eliminar(await crearClienteServidor(), {
    tipo: "libro",
    id: texto(formulario, "id"),
  });
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  redirect("/libros");
}
