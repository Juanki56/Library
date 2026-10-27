import "server-only";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import type { Entidad } from "@/backend/services/catalogo";
import * as apartados from "@/backend/services/apartados";
import * as eliminacion from "@/backend/services/eliminacion";
import * as inicio from "@/backend/services/inicio";
import * as libros from "@/backend/services/libros";
import * as notas from "@/backend/services/notas";
import * as proyectos from "@/backend/services/proyectos";
import * as recursos from "@/backend/services/recursos";
import * as relacionados from "@/backend/services/relacionados";

// Lecturas para las pantallas (Server Components). Las mutaciones están en los
// controllers con "use server"; estas funciones no se exponen al navegador.

export async function contenidoInicio() {
  return inicio.contenidoInicio(await crearClienteServidor());
}

export async function listarNotas(orden: notas.OrdenNotas) {
  return notas.listarNotas(await crearClienteServidor(), orden);
}

export async function obtenerNota(id: string) {
  return notas.obtenerNota(await crearClienteServidor(), id);
}

export async function listarProyectos() {
  return proyectos.listarProyectos(await crearClienteServidor());
}

export async function obtenerProyecto(id: string) {
  return proyectos.obtenerProyecto(await crearClienteServidor(), id);
}

export async function listarLibros() {
  return libros.listarLibros(await crearClienteServidor());
}

export async function obtenerLibro(id: string) {
  return libros.obtenerLibro(await crearClienteServidor(), id);
}

export async function listarRecursos() {
  return recursos.listarRecursos(await crearClienteServidor());
}

export async function obtenerRecurso(id: string) {
  return recursos.obtenerRecurso(await crearClienteServidor(), id);
}

// Apartados del proyecto con su contenido, «Sin apartado» y el aviso de eliminación de cada uno.
export async function organizacionProyecto(proyectoId: string) {
  const cliente = await crearClienteServidor();
  const org = await apartados.organizacion(cliente, proyectoId);
  const avisos = await Promise.all(
    org.apartados.map(async (a) => apartados.textoAvisoApartado(await apartados.contarContenido(cliente, a.id))),
  );
  return { ...org, apartados: org.apartados.map((a, i) => ({ ...a, aviso: avisos[i] })) };
}

export async function obtenerRelacionados(tipo: Entidad, id: string) {
  return relacionados.obtenerRelacionados(await crearClienteServidor(), { tipo, id });
}

// Texto del aviso que se muestra antes de confirmar una eliminación (spec relaciones).
export async function avisoEliminacion(tipo: Entidad, id: string) {
  const resumen = await eliminacion.resumenEliminacion(await crearClienteServidor(), { tipo, id });
  return resumen ? eliminacion.textoAviso(resumen) : null;
}
