"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import * as apartados from "@/backend/services/apartados";

export type EstadoApartado = { error?: string; guardado?: boolean };

const texto = (formulario: FormData, campo: string) => {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor : "";
};

function refrescar(proyectoId: string) {
  revalidatePath(`/proyectos/${proyectoId}`);
}

export async function crearApartado(_estado: EstadoApartado, formulario: FormData): Promise<EstadoApartado> {
  const proyectoId = texto(formulario, "proyectoId");
  const resultado = await apartados.crear(
    await crearClienteServidor(),
    proyectoId,
    texto(formulario, "titulo"),
    texto(formulario, "descripcion"),
  );
  if (!resultado.ok) return { error: resultado.error };
  refrescar(proyectoId);
  return { guardado: true };
}

export async function editarApartado(_estado: EstadoApartado, formulario: FormData): Promise<EstadoApartado> {
  const resultado = await apartados.editar(
    await crearClienteServidor(),
    texto(formulario, "id"),
    texto(formulario, "titulo"),
    texto(formulario, "descripcion"),
  );
  if (!resultado.ok) return { error: resultado.error };
  refrescar(texto(formulario, "proyectoId"));
  return { guardado: true };
}

export async function moverApartado(_estado: EstadoApartado, formulario: FormData): Promise<EstadoApartado> {
  const direccion = texto(formulario, "direccion");
  if (direccion !== "subir" && direccion !== "bajar") return { error: "Movimiento no válido." };
  const resultado = await apartados.mover(await crearClienteServidor(), texto(formulario, "id"), direccion);
  if (!resultado.ok) return { error: resultado.error };
  refrescar(texto(formulario, "proyectoId"));
  return {};
}

export async function eliminarApartado(_estado: EstadoApartado, formulario: FormData): Promise<EstadoApartado> {
  const resultado = await apartados.eliminar(await crearClienteServidor(), texto(formulario, "id"));
  if (!resultado.ok) return { error: resultado.error };
  // El diálogo de confirmación solo envía el id: se refrescan todas las páginas del archivo.
  revalidatePath("/", "layout");
  return {};
}

// El valor del selector es "tipo:id" (por ejemplo "libro:…"), para elegir entre varios tipos.
export async function asignarAApartado(_estado: EstadoApartado, formulario: FormData): Promise<EstadoApartado> {
  const [tipo, id] = texto(formulario, "elemento").split(":");
  if (!apartados.esTipoAsignable(tipo) || !id) return { error: "Elige un elemento." };
  const proyectoId = texto(formulario, "proyectoId");
  const resultado = await apartados.asignar(
    await crearClienteServidor(),
    proyectoId,
    texto(formulario, "apartadoId"),
    tipo,
    id,
  );
  if (!resultado.ok) return { error: resultado.error };
  revalidatePath("/", "layout");
  return {};
}

export async function quitarDeApartado(_estado: EstadoApartado, formulario: FormData): Promise<EstadoApartado> {
  const tipo = texto(formulario, "tipo");
  if (!apartados.esTipoAsignable(tipo)) return { error: "Elemento no válido." };
  const resultado = await apartados.quitar(
    await crearClienteServidor(),
    texto(formulario, "apartadoId"),
    tipo,
    texto(formulario, "id"),
  );
  if (!resultado.ok) return { error: resultado.error };
  refrescar(texto(formulario, "proyectoId"));
  return {};
}
