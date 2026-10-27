import Link from "next/link";
import { buscar } from "@/backend/controllers/lecturas";
import type { TipoBusqueda } from "@/backend/services/busqueda";
import styles from "./Buscar.module.css";
import seccion from "./Seccion.module.css";

const FILTROS: { tipo?: TipoBusqueda; texto: string }[] = [
  { texto: "Todos" },
  { tipo: "proyecto", texto: "Proyectos" },
  { tipo: "nota", texto: "Notas" },
  { tipo: "libro", texto: "Libros" },
  { tipo: "recurso", texto: "Fuentes y recursos" },
  { tipo: "cita", texto: "Citas" },
  { tipo: "termino", texto: "Glosario" },
];

const NOMBRE_TIPO: Record<TipoBusqueda, string> = {
  proyecto: "proyecto",
  nota: "nota",
  libro: "libro",
  recurso: "recurso",
  cita: "cita",
  termino: "glosario",
};

// Resultados de la búsqueda global con filtro por tipo (spec busqueda).
export default async function Buscar({ consulta, filtro }: { consulta: string; filtro?: TipoBusqueda }) {
  const resultados = consulta ? await buscar(consulta, filtro) : [];
  const enlace = (tipo?: TipoBusqueda) =>
    `/buscar?q=${encodeURIComponent(consulta)}${tipo ? `&tipo=${tipo}` : ""}`;

  return (
    <main className={seccion.pagina}>
      <div className={seccion.encabezado}>
        <h1>Búsqueda</h1>
      </div>

      {!consulta ? (
        <p className={seccion.vacio}>Escribe en el buscador de arriba qué quieres encontrar.</p>
      ) : (
        <>
          <p className={styles.consulta}>
            Resultados para <strong>«{consulta}»</strong>
          </p>
          <nav aria-label="Filtrar por tipo" className={seccion.orden}>
            {FILTROS.map((f) =>
              f.tipo === filtro ? (
                <span key={f.texto} aria-current="true" className={seccion.ordenActivo}>
                  {f.texto}
                </span>
              ) : (
                <Link key={f.texto} href={enlace(f.tipo)}>
                  {f.texto}
                </Link>
              ),
            )}
          </nav>

          {resultados.length === 0 ? (
            <p className={seccion.vacio}>No se ha encontrado nada{filtro ? " de este tipo" : ""}.</p>
          ) : (
            <ol className={styles.resultados} aria-label="Resultados">
              {resultados.map((r) => (
                <li key={`${r.tipo}-${r.id}`} className={styles.resultado}>
                  <span className={styles.tipo}>{NOMBRE_TIPO[r.tipo]}</span>
                  <Link href={r.ruta} className={r.tipo === "cita" ? `${styles.titulo} ${styles.cita}` : styles.titulo}>
                    {r.titulo}
                  </Link>
                  {r.fragmento.length > 0 && (
                    <p className={styles.fragmento}>
                      {r.fragmento.map((p, i) => (p.marcado ? <mark key={i}>{p.texto}</mark> : <span key={i}>{p.texto}</span>))}
                    </p>
                  )}
                  {r.relaciones.length > 0 && <p className={styles.relaciones}>en {r.relaciones.join(" · ")}</p>}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </main>
  );
}
