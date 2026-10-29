import "server-only";
import { randomUUID } from "node:crypto";
import type { Cliente } from "@/backend/repositories/clienteLibre";
import * as repo from "@/backend/repositories/imagenes";
import { versionDeNota } from "@/backend/repositories/notas";
import type { NodoContenido } from "./contenidoNota";
import * as eliminacion from "./eliminacion";
import {
  ERROR_IMAGEN_GRANDE,
  ERROR_IMAGEN_TIPO,
  TAMANO_MAXIMO_IMAGEN,
  TIPOS_IMAGEN,
  esRutaImagen,
  extensionPorFirma,
  rutasImagenes,
} from "./medios";
import { esIdentificador } from "./referencias";

export type ResultadoSubida = { ok: true; ruta: string } | { ok: false; error: string };

export const ERROR_SUBIDA = "No se pudo subir la imagen. Inténtalo de nuevo.";
export const ERROR_SIN_IMAGEN = "Elige una imagen para subir.";
export const ERROR_NOTA = "La nota no existe o ya se eliminó.";
const CADUCIDAD_URL = 3600; // segundos
// Una imagen recién subida puede no haber llegado aún al contenido guardado (guardado
// automático en curso): solo se limpian las subidas hace más de este tiempo.
export const ESPERA_LIMPIEZA_MS = 2 * 60 * 1000;

// Valida y sube una imagen a <usuario>/<carpeta>/<archivo> en el almacenamiento privado (design D3).
// El tipo se comprueba por el contenido del archivo, no por su nombre ni por lo que declara el navegador.
// La usan las imágenes de las notas y las portadas de los libros (la carpeta es la nota o el libro).
export async function subirArchivoImagen(cliente: Cliente, carpeta: string, archivo: unknown): Promise<ResultadoSubida> {
  if (!(archivo instanceof Blob) || archivo.size === 0) return { ok: false, error: ERROR_SIN_IMAGEN };
  if (archivo.size > TAMANO_MAXIMO_IMAGEN) return { ok: false, error: ERROR_IMAGEN_GRANDE };

  const datos = await archivo.arrayBuffer();
  const extension = extensionPorFirma(new Uint8Array(datos, 0, Math.min(16, datos.byteLength)));
  if (!extension) return { ok: false, error: ERROR_IMAGEN_TIPO };

  const { data: sesion } = await cliente.auth.getUser();
  if (!sesion.user) return { ok: false, error: ERROR_SUBIDA };

  const ruta = `${sesion.user.id}/${carpeta.toLowerCase()}/${randomUUID()}.${extension}`;
  const subida = await repo.subirArchivo(cliente, ruta, datos, TIPOS_IMAGEN[extension]);
  return subida.error ? { ok: false, error: ERROR_SUBIDA } : { ok: true, ruta };
}

// Programa una tarea para después de responder (los controllers pasan after() de Next); sin él,
// la tarea se espera en el momento. Así borrar los archivos de un elemento eliminado no retrasa
// la respuesta (cambio velocidad-respuesta).
export type Diferir = (tarea: () => Promise<void>) => void;

export async function enSuMomento(diferir: Diferir | undefined, tarea: () => Promise<void>) {
  if (diferir) diferir(tarea);
  else await tarea();
}

export async function borrarArchivos(cliente: Cliente, rutas: string[]) {
  const { error } = await repo.borrarArchivos(cliente, rutas);
  if (error) console.error("No se pudieron borrar imágenes", error);
}

// Sube una imagen a una nota propia y la registra para poder limpiarla después (design D8).
export async function subirImagen(cliente: Cliente, notaId: string, archivo: unknown): Promise<ResultadoSubida> {
  if (!esIdentificador(notaId)) return { ok: false, error: ERROR_NOTA };
  const nota = await versionDeNota(cliente, notaId);
  if (nota.error || !nota.data) return { ok: false, error: ERROR_NOTA };

  const subida = await subirArchivoImagen(cliente, notaId, archivo);
  if (!subida.ok) return subida;
  const ruta = subida.ruta;

  const registro = await repo.registrarImagen(cliente, ruta, notaId.toLowerCase());
  if (registro.error) {
    await repo.borrarArchivos(cliente, [ruta]);
    return { ok: false, error: ERROR_SUBIDA };
  }
  return { ok: true, ruta };
}

// Dirección firmada y temporal de una imagen propia (design D4); null si no existe o no es suya.
export async function urlImagen(cliente: Cliente, ruta: unknown): Promise<string | null> {
  if (!esRutaImagen(ruta)) return null;
  const { data, error } = await repo.urlFirmada(cliente, ruta, CADUCIDAD_URL);
  return error || !data ? null : data.signedUrl;
}

// Borra las imágenes subidas a la nota que ya no aparecen en su contenido guardado (design D8).
// Se llama al abrir la nota; un fallo no impide mostrarla.
export async function limpiarNoUsadas(
  cliente: Cliente,
  notaId: string,
  contenido: NodoContenido,
  ahora = Date.now(),
): Promise<void> {
  const { data, error } = await repo.rutasDeNota(cliente, notaId);
  if (error || !data.length) return;
  const enUso = new Set(rutasImagenes(contenido));
  const sobrantes = data
    .filter((r) => !enUso.has(r.ruta) && ahora - Date.parse(r.creado_en) > ESPERA_LIMPIEZA_MS)
    .map((r) => r.ruta);
  if (!sobrantes.length) return;
  const borrado = await repo.borrarArchivos(cliente, sobrantes);
  if (borrado.error) {
    console.error("No se pudieron borrar imágenes sin usar", borrado.error);
    return;
  }
  await repo.borrarRegistros(cliente, sobrantes);
}

// Elimina la nota y después los archivos de sus imágenes (los registros caen en cascada).
export async function eliminarNota(
  cliente: Cliente,
  id: string,
  diferir?: Diferir,
): Promise<eliminacion.ResultadoEliminacion> {
  const { data } = await repo.rutasDeNota(cliente, id);
  const resultado = await eliminacion.eliminar(cliente, { tipo: "nota", id });
  if (resultado.ok && data?.length) {
    await enSuMomento(diferir, async () => {
      const borrado = await repo.borrarArchivos(
        cliente,
        data.map((r) => r.ruta),
      );
      if (borrado.error) console.error("No se pudieron borrar las imágenes de la nota eliminada", borrado.error);
    });
  }
  return resultado;
}
