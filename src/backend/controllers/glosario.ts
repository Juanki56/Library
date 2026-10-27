"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as glosario from "@/backend/services/glosario";

// `existente`: la entrada que ya tiene ese término, para ofrecer abrirla.
export type EstadoGlosario = { error?: string; existente?: { id: string; termino: string }; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

const entrada = (formulario: FormData): glosario.EntradaGlosario => ({
  termino: texto(formulario, "termino"),
  definicion: texto(formulario, "definicion"),
  ejemplo: texto(formulario, "ejemplo"),
  informacionAdicional: texto(formulario, "informacionAdicional"),
});

export async function crearEntrada(_estado: EstadoGlosario, formulario: FormData): Promise<EstadoGlosario> {
  const resultado = await glosario.crear(await crearClienteServidor(), entrada(formulario));
  if (!resultado.ok) return { error: resultado.error, existente: resultado.existente };
  revalidatePath("/glosario");
  redirect("/glosario");
}

export async function guardarEntrada(_estado: EstadoGlosario, formulario: FormData): Promise<EstadoGlosario> {
  const id = texto(formulario, "id");
  const resultado = await glosario.guardar(await crearClienteServidor(), id, entrada(formulario));
  if (!resultado.ok) return { error: resultado.error, existente: resultado.existente };
  revalidatePath("/glosario");
  revalidatePath(`/glosario/${id}`);
  return { guardado: true };
}

export async function eliminarEntrada(_estado: EstadoGlosario, formulario: FormData): Promise<EstadoGlosario> {
  const resultado = await glosario.eliminar(await crearClienteServidor(), texto(formulario, "id"));
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/glosario");
  redirect("/glosario");
}
