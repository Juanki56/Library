"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as citas from "@/backend/services/citas";

export type EstadoCita = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

const entrada = (formulario: FormData): citas.EntradaCita => ({
  texto: texto(formulario, "texto"),
  tipo: texto(formulario, "tipo"),
  autor: texto(formulario, "autor"),
  fuente: texto(formulario, "fuente"),
  enlace: texto(formulario, "enlace"),
});

export async function crearCita(_estado: EstadoCita, formulario: FormData): Promise<EstadoCita> {
  const resultado = await citas.crearCita(await crearClienteServidor(), entrada(formulario));
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  redirect("/citas");
}

export async function guardarCita(_estado: EstadoCita, formulario: FormData): Promise<EstadoCita> {
  const resultado = await citas.guardarCita(await crearClienteServidor(), texto(formulario, "id"), entrada(formulario));
  if (!resultado.ok) return { error: resultado.error };
  // La cita también aparece en su libro o recurso y en Inicio.
  revalidatePath("/", "layout");
  return { guardado: true };
}

export async function eliminarCita(_estado: EstadoCita, formulario: FormData): Promise<EstadoCita> {
  const resultado = await citas.eliminarCita(await crearClienteServidor(), texto(formulario, "id"));
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  redirect("/citas");
}
