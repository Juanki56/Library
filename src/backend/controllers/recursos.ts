"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as eliminacion from "@/backend/services/eliminacion";
import * as recursos from "@/backend/services/recursos";

export type EstadoRecurso = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

const entrada = (formulario: FormData): recursos.EntradaRecurso => ({
  titulo: texto(formulario, "titulo"),
  url: texto(formulario, "url"),
  autor: texto(formulario, "autor"),
  descripcion: texto(formulario, "descripcion"),
  tipo: texto(formulario, "tipo"),
  fechaPublicacion: texto(formulario, "fechaPublicacion"),
});

export async function crearRecurso(_estado: EstadoRecurso, formulario: FormData): Promise<EstadoRecurso> {
  const resultado = await recursos.crearRecurso(await crearClienteServidor(), entrada(formulario));
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/recursos");
  redirect(`/recursos/${resultado.valor}`);
}

export async function guardarRecurso(_estado: EstadoRecurso, formulario: FormData): Promise<EstadoRecurso> {
  const resultado = await recursos.guardarRecurso(
    await crearClienteServidor(),
    texto(formulario, "id"),
    entrada(formulario),
  );
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  return { guardado: true };
}

export async function eliminarRecurso(_estado: EstadoRecurso, formulario: FormData): Promise<EstadoRecurso> {
  const resultado = await eliminacion.eliminar(await crearClienteServidor(), {
    tipo: "recurso",
    id: texto(formulario, "id"),
  });
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  redirect("/recursos");
}
