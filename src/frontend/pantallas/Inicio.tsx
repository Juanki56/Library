import Link from "next/link";
import { contenidoInicio } from "@/backend/controllers/lecturas";
import Ornamento from "@/frontend/components/Ornamento";
import VistaCita from "@/frontend/components/VistaCita";
import { fecha } from "./fechas";
import { referencia } from "./ListaLibros";
import styles from "./Inicio.module.css";

// Inicio (spec navegacion, decidido el 2026-10-28): accesos rápidos y listas editoriales de notas
// recientes, «Leyendo ahora», proyectos y citas (§6 y §7).
// Sin métricas, contadores ni tiempos relativos (spec exclusiones-alcance).

const ACCESOS = [
  { ruta: "/notas/nueva", texto: "Nueva nota" },
  { ruta: "/libros/nuevo", texto: "Nuevo libro" },
  { ruta: "/recursos/nuevo", texto: "Nuevo recurso" },
  { ruta: "/citas/nueva", texto: "Nueva cita" },
];

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
  const { notas, libros, proyectos, citas } = await contenidoInicio();
  const leyendo = libros.modo === "leyendo";

  return (
    <main className={styles.pagina}>
      <header className={styles.portada}>
        <Ornamento ancho={96} clase={styles.fleuron} />
        <span className={styles.fileteDoble} aria-hidden="true" />
        <h1 className={styles.titulo}>Archivo de conocimiento</h1>
        <span className={styles.fileteDoble} aria-hidden="true" />
        <nav aria-label="Crear" className={styles.accesos}>
          {ACCESOS.map((a) => (
            <Link key={a.ruta} href={a.ruta} className={styles.acceso}>
              {a.texto}
            </Link>
          ))}
        </nav>
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
            <Encabezado
              id="inicio-libros"
              numeral="II"
              titulo={leyendo ? "Leyendo ahora" : "Libros recientes"}
              ruta="/libros"
              enlace="Ver todos"
            />
            {libros.lista.length === 0 ? (
              <p className={styles.vacio}>
                Todavía no has añadido ningún libro. <Link href="/libros/nuevo">Añadir uno</Link>
              </p>
            ) : (
              <ul className={styles.listaLibros} aria-label={leyendo ? "Leyendo ahora" : "Libros recientes"}>
                {libros.lista.map((l) => (
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

          <section aria-labelledby="inicio-proyectos">
            <Encabezado id="inicio-proyectos" numeral="III" titulo="Proyectos" ruta="/proyectos" enlace="Ver todos" />
            {proyectos.length === 0 ? (
              <p className={styles.vacio}>
                Todavía no has creado ningún proyecto. <Link href="/proyectos/nuevo">Crear uno</Link>
              </p>
            ) : (
              <ul className={styles.listaLibros} aria-label="Proyectos recientes">
                {proyectos.map((p) => (
                  <li key={p.id}>
                    <Link href={`/proyectos/${p.id}`} className={styles.tituloLibro}>
                      {p.nombre}
                    </Link>
                    <p className={styles.metadatos}>Modificado el {fecha(p.actualizadoEn)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="inicio-citas">
            <Encabezado id="inicio-citas" numeral="IV" titulo="Citas guardadas" ruta="/citas" enlace="Ver todas" />
            {citas.length === 0 ? (
              <p className={styles.vacio}>
                Todavía no has guardado ninguna cita. <Link href="/citas/nueva">Guardar la primera</Link>
              </p>
            ) : (
              <ul className={styles.listaCitas} aria-label="Citas guardadas">
                {citas.map((c) => (
                  <li key={c.id}>
                    <VistaCita cita={c} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className={styles.colofon}>
        <Ornamento ancho={80} />
      </div>
    </main>
  );
}
