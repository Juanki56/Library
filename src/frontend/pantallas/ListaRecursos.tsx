import Link from "next/link";
import { listarRecursos } from "@/backend/controllers/lecturas";
import { TIPOS_RECURSO, type TipoRecurso } from "@/backend/services/fichas";
import styles from "./Seccion.module.css";

// Cada recurso aparece una sola vez aunque esté en varios espacios (spec fuentes-recursos),
// con su tipo y filtro por tipo (requisito «Filtro por tipo en la lista de recursos»).
export default async function ListaRecursos({ tipo }: { tipo?: TipoRecurso }) {
  const recursos = await listarRecursos(tipo);
  const filtros: { tipo?: TipoRecurso; texto: string }[] = [
    { texto: "Todos" },
    ...(Object.entries(TIPOS_RECURSO) as [TipoRecurso, string][]).map(([t, texto]) => ({ tipo: t, texto })),
  ];

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Fuentes y recursos</h1>
        <Link href="/recursos/nuevo" className={styles.accion}>
          Nuevo recurso
        </Link>
      </div>

      <nav aria-label="Filtrar por tipo" className={styles.orden}>
        {filtros.map((f) =>
          f.tipo === tipo ? (
            <span key={f.texto} aria-current="true" className={styles.ordenActivo}>
              {f.texto}
            </span>
          ) : (
            <Link key={f.texto} href={f.tipo ? `/recursos?tipo=${f.tipo}` : "/recursos"}>
              {f.texto}
            </Link>
          ),
        )}
      </nav>

      {recursos.length === 0 ? (
        <p className={styles.vacio}>
          {tipo ? "No hay recursos de este tipo." : "Todavía no has guardado ninguna fuente ni recurso."}
        </p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de recursos">
          {recursos.map((r) => (
            <li key={r.id} className={styles.elemento}>
              <Link href={`/recursos/${r.id}`}>{r.titulo}</Link>
              <p className={styles.metadatos}>
                {[TIPOS_RECURSO[r.tipo], r.autor, r.url && new URL(r.url).hostname].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
