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
import CitasEnlazadas from "@/frontend/components/CitasEnlazadas";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import ElementosRelacionados from "@/frontend/components/ElementosRelacionados";
import EtiquetasElemento from "@/frontend/components/EtiquetasElemento";
import FormularioLibro from "@/frontend/components/FormularioLibro";
import { referencia } from "./ListaLibros";
import styles from "./Seccion.module.css";

// Página propia del libro: datos bibliográficos y notas, recursos y proyectos relacionados (spec libros).
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
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1>{libro.titulo}</h1>
          {referencia(libro) && <p className={styles.metadatos}>{referencia(libro)}</p>}
        </div>
        <Link href="/libros" className={styles.accion}>
          Volver a libros
        </Link>
      </div>

      <FormularioLibro libro={libro} />
      <EtiquetasElemento tipo="libro" id={libro.id} propias={etiquetas.propias} todas={etiquetas.todas} />
      <ElementosRelacionados tipo="libro" id={libro.id} grupos={relacionados} />
      <CitasEnlazadas citas={citas} />

      <div className={styles.acciones}>
        <span />
        <ConfirmarEliminacion id={libro.id} nombre={libro.titulo} aviso={aviso ?? ""} accion={eliminarLibro} />
      </div>
    </main>
  );
}
