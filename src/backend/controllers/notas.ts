"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as eliminacion from "@/backend/services/eliminacion";
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

export async function guardarNota(_estado: EstadoNota, formulario: FormData): Promise<EstadoNota> {
  const id = texto(formulario, "id");
  const resultado = await notas.guardarNota(
    await crearClienteServidor(),
    id,
    texto(formulario, "titulo"),
    texto(formulario, "contenido"),
  );
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/notas");
  revalidatePath(`/notas/${id}`);
  return { guardado: true };
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
