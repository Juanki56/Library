import "server-only";
import type { Cliente } from "./clienteLibre";

// Imágenes de las notas (editor-fase3-imagenes-videos, design D2): archivos en el bucket
// privado «imagenes» y su registro en imagenes_nota. Todo con la sesión del usuario.
const BUCKET = "imagenes";

export async function subirArchivo(cliente: Cliente, ruta: string, datos: ArrayBuffer, tipo: string) {
  return cliente.storage.from(BUCKET).upload(ruta, datos, { contentType: tipo, upsert: false });
}

export async function borrarArchivos(cliente: Cliente, rutas: string[]) {
  return cliente.storage.from(BUCKET).remove(rutas);
}

export async function urlFirmada(cliente: Cliente, ruta: string, segundos: number) {
  return cliente.storage.from(BUCKET).createSignedUrl(ruta, segundos);
}

export async function registrarImagen(cliente: Cliente, ruta: string, notaId: string) {
  return cliente.from("imagenes_nota").insert({ ruta, nota_id: notaId });
}

export async function rutasDeNota(cliente: Cliente, notaId: string) {
  return cliente.from("imagenes_nota").select("ruta, creado_en").eq("nota_id", notaId);
}

export async function borrarRegistros(cliente: Cliente, rutas: string[]) {
  return cliente.from("imagenes_nota").delete().in("ruta", rutas);
}
