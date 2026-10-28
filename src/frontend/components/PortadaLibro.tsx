"use client";

import { startTransition, useActionState, useState } from "react";
import { cambiarPortada } from "@/backend/controllers/libros";
import { direccionImagen, ERROR_IMAGEN_GRANDE, TAMANO_MAXIMO_IMAGEN } from "@/backend/services/medios";
import styles from "./Formularios.module.css";
import propios from "./PortadaLibro.module.css";

type Props = { id: string; titulo: string; ruta: string | null; url: string | null };

// Imagen de la portada: subida (servida por /imagen) o desde la web, con aviso si no carga.
export function ImagenPortada({ titulo, ruta, url }: Omit<Props, "id">) {
  const src = ruta ? direccionImagen(ruta) : url;
  const [fallo, setFallo] = useState<string | null>(null);
  if (!src) return null;
  if (fallo === src) return <p className={propios.aviso}>No se pudo cargar la portada.</p>;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagen privada o externa: next/image no aplica
    <img
      src={src}
      alt={`Portada de ${titulo}`}
      className={propios.portada}
      referrerPolicy="no-referrer"
      onError={() => setFallo(src)}
    />
  );
}

// Formulario «Portada» de la página del libro (cambio libros-recursos-menu-inicio, design D3).
export default function PortadaLibro({ id, titulo, ruta, url }: Props) {
  const [estado, enviar, enviando] = useActionState(cambiarPortada, {});
  const [origen, setOrigen] = useState<"archivo" | "web">("archivo");
  const [avisoLocal, setAvisoLocal] = useState<string | null>(null);
  const tiene = Boolean(ruta || url);

  // Envío desde onSubmit (como enviarSinVaciar) pero incluyendo el botón pulsado, que indica si
  // se guarda o se quita la portada. Antes se comprueba el tamaño para no enviar archivos grandes.
  function comprobar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const boton = (evento.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const datos = new FormData(evento.currentTarget, boton);
    const archivo = datos.get("archivo");
    if (datos.get("accion") !== "quitar" && archivo instanceof File && archivo.size > TAMANO_MAXIMO_IMAGEN) {
      setAvisoLocal(ERROR_IMAGEN_GRANDE);
      return;
    }
    setAvisoLocal(null);
    startTransition(() => enviar(datos));
  }

  const error = avisoLocal ?? estado.error;
  return (
    <section aria-labelledby="titulo-portada" className={propios.seccion}>
      <h2 id="titulo-portada" className={propios.titulo}>
        Portada
      </h2>
      <div className={propios.cuerpo}>
        {tiene && <ImagenPortada titulo={titulo} ruta={ruta} url={url} />}
        <form onSubmit={comprobar} className={styles.formulario}>
          <input type="hidden" name="id" value={id} />
          <fieldset className={propios.opciones}>
            <legend>Origen de la portada</legend>
            <label>
              <input type="radio" name="origen" value="archivo" checked={origen === "archivo"} onChange={() => setOrigen("archivo")} />
              Subir archivo
            </label>
            <label>
              <input type="radio" name="origen" value="web" checked={origen === "web"} onChange={() => setOrigen("web")} />
              Desde una dirección web
            </label>
          </fieldset>
          {origen === "archivo" ? (
            <label className={styles.campo}>
              Imagen de la portada (PNG, JPEG, GIF o WebP, hasta 5 MB)
              <input name="archivo" type="file" accept="image/png,image/jpeg,image/gif,image/webp" required />
            </label>
          ) : (
            <label className={styles.campo}>
              Dirección de la portada
              <input name="url" type="text" inputMode="url" placeholder="https://…" required className={styles.texto} />
            </label>
          )}
          <div className={styles.pie}>
            <button type="submit" name="accion" value="guardar" disabled={enviando} className={styles.principal}>
              {tiene ? "Cambiar portada" : "Añadir portada"}
            </button>
            {tiene && (
              <button type="submit" name="accion" value="quitar" formNoValidate disabled={enviando} className={propios.quitar}>
                Quitar portada
              </button>
            )}
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            {estado.guardado && !enviando && !error && <p role="status">Portada guardada.</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
