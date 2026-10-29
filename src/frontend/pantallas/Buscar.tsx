import Link from "next/link";
import { buscar, opcionesFiltrosBusqueda } from "@/backend/controllers/lecturas";
import type { TipoBusqueda } from "@/backend/services/busqueda";
import { CLAVES_FILTROS, hayFiltros, type FiltrosBusqueda } from "@/backend/services/filtros";
import styles from "./Buscar.module.css";
import seccion from "./Seccion.module.css";
import PanelFiltros from "@/frontend/components/PanelFiltros";

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

type Props = { consulta: string; filtro?: TipoBusqueda; filtros: FiltrosBusqueda };

// Dirección de la búsqueda con sus filtros; los enlaces de tipo conservan los demás.
function direccion(consulta: string, tipo: TipoBusqueda | undefined, filtros: FiltrosBusqueda) {
  const p = new URLSearchParams();
  if (consulta) p.set("q", consulta);
  if (tipo) p.set("tipo", tipo);
  for (const clave of CLAVES_FILTROS) if (filtros[clave]) p.set(clave, filtros[clave]!);
  return `/buscar?${p.toString()}`;
}

// Resultados de la búsqueda global con filtro por tipo y filtros adicionales (spec busqueda).
export default async function Buscar({ consulta, filtro, filtros }: Props) {
  const conFiltros = hayFiltros(filtros);
  const [resultados, opciones] = await Promise.all([
    consulta || conFiltros ? buscar(consulta, filtro, filtros) : [],
    opcionesFiltrosBusqueda(),
  ]);
  const enlace = (tipo?: TipoBusqueda) => direccion(consulta, tipo, filtros);

  return (
    <main className={seccion.pagina}>
      <div className={seccion.encabezado}>
        <h1>Búsqueda</h1>
      </div>

      <PanelFiltros consulta={consulta} filtro={filtro} filtros={filtros} opciones={opciones} abierto={conFiltros} />

      {!consulta && !conFiltros ? (
        <p className={seccion.vacio}>Escribe en el buscador de arriba qué quieres encontrar, o usa los filtros.</p>
      ) : (
        <>
          <p className={styles.consulta}>
            {consulta ? (
              <>
                Resultados para <strong>«{consulta}»</strong>
              </>
            ) : (
              "Resultados de los filtros"
            )}
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
            <p className={seccion.vacio}>
              No se ha encontrado nada{filtro || conFiltros ? " con estos filtros" : ""}.
            </p>
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
