import "server-only";
import { crearClienteServidor } from "@/backend/auth/clienteServidor";
import type { Entidad } from "@/backend/services/catalogo";
import * as apartados from "@/backend/services/apartados";
import * as busqueda from "@/backend/services/busqueda";
import * as citas from "@/backend/services/citas";
import * as eliminacion from "@/backend/services/eliminacion";
import * as etiquetas from "@/backend/services/etiquetas";
import type { TipoRecurso } from "@/backend/services/fichas";
import * as glosario from "@/backend/services/glosario";
import * as imagenes from "@/backend/services/imagenes";
import * as inicio from "@/backend/services/inicio";
import * as libros from "@/backend/services/libros";
import * as menciones from "@/backend/services/menciones";
import * as notas from "@/backend/services/notas";
import * as proyectos from "@/backend/services/proyectos";
import * as recursos from "@/backend/services/recursos";
import * as relacionados from "@/backend/services/relacionados";

// Lecturas para las pantallas (Server Components). Las mutaciones están en los
// controllers con "use server"; estas funciones no se exponen al navegador.

export async function listarCitas(limite?: number) {
  return citas.listarCitas(await crearClienteServidor(), limite);
}

export async function obtenerCita(id: string) {
  return citas.obtenerCita(await crearClienteServidor(), id);
}

export async function citasDe(tipo: "libro" | "recurso", id: string) {
  return citas.citasDe(await crearClienteServidor(), tipo, id);
}

// Libros y recursos del usuario, para el enlace opcional de una cita.
export async function opcionesEnlaceCita() {
  const cliente = await crearClienteServidor();
  const [l, r] = await Promise.all([libros.listarLibros(cliente), recursos.listarRecursos(cliente)]);
  return {
    libros: l.map((x) => ({ id: x.id, nombre: x.titulo })),
    recursos: r.map((x) => ({ id: x.id, nombre: x.titulo })),
  };
}

// Etiquetas de un elemento y todas las del usuario (para sugerir al asignar).
export async function etiquetasElemento(tipo: Entidad, id: string) {
  const cliente = await crearClienteServidor();
  const [propias, todas] = await Promise.all([
    etiquetas.etiquetasDe(cliente, tipo, id),
    etiquetas.listarEtiquetas(cliente),
  ]);
  return { propias, todas };
}

// Lista de etiquetas con el aviso de eliminación de cada una.
export async function listarEtiquetasConAviso() {
  const cliente = await crearClienteServidor();
  const lista = await etiquetas.listarEtiquetas(cliente);
  return Promise.all(
    lista.map(async (e) => ({ ...e, aviso: etiquetas.textoAvisoEtiqueta(await etiquetas.contarUsos(cliente, e.id)) })),
  );
}

export async function paginaEtiqueta(id: string, filtro?: Entidad) {
  const cliente = await crearClienteServidor();
  const etiqueta = await etiquetas.obtenerEtiqueta(cliente, id);
  if (!etiqueta) return null;
  return { etiqueta, grupos: await etiquetas.elementosDe(cliente, id, filtro) };
}

export async function glosarioPorLetra() {
  return glosario.listarPorLetra(await crearClienteServidor());
}

export async function obtenerEntradaGlosario(id: string) {
  return glosario.obtenerEntrada(await crearClienteServidor(), id);
}

export async function buscar(consulta: string, filtro?: busqueda.TipoBusqueda) {
  return busqueda.buscar(await crearClienteServidor(), consulta, filtro);
}

export async function contenidoInicio() {
  return inicio.contenidoInicio(await crearClienteServidor());
}

export async function listarNotas(orden: notas.OrdenNotas) {
  return notas.listarNotas(await crearClienteServidor(), orden);
}

export async function destinoNotaVinculada(valor: unknown) {
  return relacionados.destinoNotaVinculada(await crearClienteServidor(), valor);
}

export async function obtenerNota(id: string) {
  return notas.obtenerNota(await crearClienteServidor(), id);
}

// Referencias de una nota (editor-fase2-referencias): títulos actuales y quién la menciona.
export async function referenciasDeNota(nota: notas.Nota) {
  const cliente = await crearClienteServidor();
  const [titulos, mencionan] = await Promise.all([
    menciones.titulosReferenciados(cliente, nota.contenido),
    menciones.notasQueMencionan(cliente, nota.id),
  ]);
  return { titulos, mencionan };
}

// Al abrir una nota se borran las imágenes subidas que ya no están en su contenido guardado
// (editor-fase3-imagenes-videos, design D8).
export async function limpiarImagenesDeNota(nota: notas.Nota) {
  return imagenes.limpiarNoUsadas(await crearClienteServidor(), nota.id, nota.contenido);
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

export async function listarRecursos(tipo?: TipoRecurso) {
  return recursos.listarRecursos(await crearClienteServidor(), tipo);
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
