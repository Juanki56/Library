import Link from "next/link";
import { notFound } from "next/navigation";
import {
  avisoEliminacion,
  citasDe,
  etiquetasElemento,
  obtenerLibro,
  obtenerRelacionados,
} from "@/backend/controllers/lecturas";
import { eliminarLibro } from "@/backend/controllers/libros";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import Conexiones from "@/frontend/components/Conexiones";
import FormularioLibro from "@/frontend/components/FormularioLibro";
import PortadaLibro from "@/frontend/components/PortadaLibro";
import { ESTADOS_LECTURA } from "@/backend/services/fichas";
import { referencia } from "./ListaLibros";
import styles from "./Seccion.module.css";

// Página propia del libro: datos, portada y notas, recursos y proyectos relacionados (spec libros).
export default async function Libro({ id }: { id: string }) {
  const libro = await obtenerLibro(id);
  if (!libro) notFound();
  const [relacionados, aviso, citas, etiquetas] = await Promise.all([
    obtenerRelacionados("libro", id),
    avisoEliminacion("libro", id),
    citasDe("libro", id),
    etiquetasElemento("libro", id),
  ]);

  return (
    <main className={styles.paginaDetalle}>
      <div className={styles.contenidoDetalle}>
        <div className={styles.encabezado}>
          <div>
            <h1>{libro.titulo}</h1>
            {referencia(libro) && <p className={styles.metadatos}>{referencia(libro)}</p>}
            {(libro.estadoLectura || libro.isbn) && (
              <p className={styles.metadatos}>
                {[libro.estadoLectura && ESTADOS_LECTURA[libro.estadoLectura], libro.isbn && `ISBN ${libro.isbn}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <Link href="/libros" className={styles.accion}>
            Volver a libros
          </Link>
        </div>

        <FormularioLibro libro={libro} />
        <PortadaLibro id={libro.id} titulo={libro.titulo} ruta={libro.portadaRuta} url={libro.portadaUrl} />

        <div className={styles.acciones}>
          <span />
          <ConfirmarEliminacion id={libro.id} nombre={libro.titulo} aviso={aviso ?? ""} accion={eliminarLibro} />
        </div>
      </div>
      <Conexiones tipo="libro" id={libro.id} grupos={relacionados} etiquetas={etiquetas} citas={citas} />
    </main>
  );
}
