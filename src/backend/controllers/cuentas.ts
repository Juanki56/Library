"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as cuentas from "@/backend/services/cuentas";

export type EstadoFormulario = { error?: string; mensaje?: string };

function leer(formulario: FormData, campo: string) {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export async function registrarCuenta(
  _estado: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const origen = (await headers()).get("origin") ?? "";
  const resultado = await cuentas.registrar(
    await crearClienteServidor(),
    leer(formulario, "correo"),
    String(formulario.get("contrasena") ?? ""),
    `${origen}/auth/confirmar`,
  );
  return resultado.ok ? { mensaje: resultado.mensaje } : { error: resultado.error };
}

export async function entrarCuenta(
  _estado: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const resultado = await cuentas.entrar(
    await crearClienteServidor(),
    leer(formulario, "correo"),
    String(formulario.get("contrasena") ?? ""),
  );
  if (!resultado.ok) return { error: resultado.error };
  redirect("/");
}

export async function salirCuenta() {
  await cuentas.salir(await crearClienteServidor());
  redirect("/entrar");
}
