import Link from "next/link";
import { notFound } from "next/navigation";
import { paginaEtiqueta } from "@/backend/controllers/lecturas";
import { ENTIDADES, type Entidad } from "@/backend/services/catalogo";
import styles from "./Seccion.module.css";

const FILTROS: { tipo?: Entidad; texto: string }[] = [
  { texto: "Todos" },
  { tipo: "nota", texto: "Notas" },
  { tipo: "libro", texto: "Libros" },
  { tipo: "proyecto", texto: "Proyectos" },
  { tipo: "recurso", texto: "Fuentes y recursos" },
];

// Elementos con la etiqueta, agrupados por tipo, con filtro por tipo (spec etiquetas).
export default async function Etiqueta({ id, filtro }: { id: string; filtro?: Entidad }) {
  const pagina = await paginaEtiqueta(id, filtro);
  if (!pagina) notFound();
  const { etiqueta, grupos } = pagina;
  const conElementos = grupos.filter((g) => g.elementos.length > 0);

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>{etiqueta.nombre}</h1>
        <Link href="/etiquetas" className={styles.accion}>
          Volver a etiquetas
        </Link>
      </div>

      <nav aria-label="Filtrar por tipo" className={styles.orden}>
        {FILTROS.map((f) =>
          f.tipo === filtro ? (
            <span key={f.texto} aria-current="true" className={styles.ordenActivo}>
              {f.texto}
            </span>
          ) : (
            <Link key={f.texto} href={f.tipo ? `/etiquetas/${id}?tipo=${f.tipo}` : `/etiquetas/${id}`}>
              {f.texto}
            </Link>
          ),
        )}
      </nav>

      {conElementos.length === 0 ? (
        <p className={styles.vacio}>Ningún elemento {filtro ? "de este tipo " : ""}tiene esta etiqueta.</p>
      ) : (
        conElementos.map((g) => (
          <section key={g.tipo} aria-label={FILTROS.find((f) => f.tipo === g.tipo)?.texto} className={styles.grupo}>
            <h2>{FILTROS.find((f) => f.tipo === g.tipo)?.texto}</h2>
            <ul className={styles.lista}>
              {g.elementos.map((e) => (
                <li key={e.id} className={styles.elemento}>
                  <Link href={`${ENTIDADES[g.tipo].ruta}/${e.id}`}>{e.nombre}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
