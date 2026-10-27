"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as eliminacion from "@/backend/services/eliminacion";
import * as proyectos from "@/backend/services/proyectos";

export type EstadoProyecto = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

export async function crearProyecto(_estado: EstadoProyecto, formulario: FormData): Promise<EstadoProyecto> {
  const resultado = await proyectos.crearProyecto(
    await crearClienteServidor(),
    texto(formulario, "nombre"),
    texto(formulario, "descripcion"),
  );
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/proyectos");
  redirect(`/proyectos/${resultado.valor}`);
}

export async function guardarProyecto(_estado: EstadoProyecto, formulario: FormData): Promise<EstadoProyecto> {
  const id = texto(formulario, "id");
  const resultado = await proyectos.guardarProyecto(
    await crearClienteServidor(),
    id,
    texto(formulario, "nombre"),
    texto(formulario, "descripcion"),
  );
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  return { guardado: true };
}

export async function eliminarProyecto(_estado: EstadoProyecto, formulario: FormData): Promise<EstadoProyecto> {
  const resultado = await eliminacion.eliminar(await crearClienteServidor(), {
    tipo: "proyecto",
    id: texto(formulario, "id"),
  });
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  redirect("/proyectos");
}
