import Link from "next/link";
import { contenidoInicio } from "@/backend/controllers/lecturas";
import Ornamento from "@/frontend/components/Ornamento";
import { fecha } from "./fechas";
import { referencia } from "./ListaLibros";
import styles from "./Inicio.module.css";

// Inicio: portada y listas editoriales de notas recientes, libros y citas (§6 y §7).
// Propuesta visual en revisión: no aprobada. Sin métricas, contadores ni tiempos
// relativos (spec exclusiones-alcance, navegacion).

function Encabezado({ id, numeral, titulo, ruta, enlace }: {
  id: string;
  numeral: string;
  titulo: string;
  ruta?: string;
  enlace?: string;
}) {
  return (
    <div className={styles.encabezado}>
      <h2 id={id} className={styles.tituloBloque}>
        <span className={styles.numeral} aria-hidden="true">
          {numeral} ·
        </span>{" "}
        {titulo}
      </h2>
      <span className={styles.rombo} aria-hidden="true" />
      {ruta && enlace && (
        <Link href={ruta} className={styles.verTodas}>
          {enlace} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export default async function Inicio() {
  const { notas, libros } = await contenidoInicio();

  return (
    <main className={styles.pagina}>
      <header className={styles.portada}>
        <Ornamento ancho={96} clase={styles.fleuron} />
        <span className={styles.fileteDoble} aria-hidden="true" />
        <h1 className={styles.titulo}>Archivo de conocimiento</h1>
        <span className={styles.fileteDoble} aria-hidden="true" />
      </header>

      <div className={styles.columnas}>
        <section aria-labelledby="inicio-notas" className={styles.columnaPrincipal}>
          <Encabezado id="inicio-notas" numeral="I" titulo="Notas recientes" ruta="/notas" enlace="Ver todas" />
          {notas.length === 0 ? (
            <p className={styles.vacio}>
              Todavía no has escrito ninguna nota. <Link href="/notas/nueva">Escribir la primera</Link>
            </p>
          ) : (
            <ol className={styles.listaNotas} aria-label="Notas recientes">
              {notas.map((n) => (
                <li key={n.id} className={styles.nota}>
                  <Link href={`/notas/${n.id}`} className={styles.tituloNota}>
                    {n.titulo}
                  </Link>
                  {n.extracto && <p className={styles.extracto}>{n.extracto}</p>}
                  <p className={styles.metadatos}>
                    Modificada el {fecha(n.actualizadoEn)}
                    {n.proyectos.length > 0 && <> · en {n.proyectos.join(" · ")}</>}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className={styles.columnaLateral}>
          <section aria-labelledby="inicio-libros">
            <Encabezado id="inicio-libros" numeral="II" titulo="Libros" ruta="/libros" enlace="Ver todos" />
            {libros.length === 0 ? (
              <p className={styles.vacio}>
                Todavía no has añadido ningún libro. <Link href="/libros/nuevo">Añadir uno</Link>
              </p>
            ) : (
              <ul className={styles.listaLibros} aria-label="Libros">
                {libros.map((l) => (
                  <li key={l.id}>
                    <Link href={`/libros/${l.id}`} className={styles.tituloLibro}>
                      {l.titulo}
                    </Link>
                    {referencia(l) && <p className={styles.metadatos}>{referencia(l)}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="inicio-citas">
            <Encabezado id="inicio-citas" numeral="III" titulo="Citas guardadas" />
            <p className={styles.vacio}>
              Aquí aparecerán tus citas más recientes cuando la sección de citas esté disponible.
            </p>
          </section>
        </div>
      </div>

      <div className={styles.colofon}>
        <Ornamento ancho={80} />
      </div>
    </main>
  );
}
