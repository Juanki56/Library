import Link from "next/link";
import type { Entidad } from "@/backend/services/catalogo";
import type { Cita } from "@/backend/services/citas";
import type { Etiqueta } from "@/backend/services/etiquetas";
import type { GrupoRelacionados } from "@/backend/services/relacionados";
import { existeSeccion } from "@/frontend/navegacion";
import { fecha } from "@/frontend/pantallas/fechas";
import CuadroVincular, { QuitarVinculo, type Candidato } from "./CuadroVincular";
import EtiquetasElemento from "./EtiquetasElemento";
import VistaCita from "./VistaCita";
import styles from "./Conexiones.module.css";

const GRUPOS: Record<Entidad, string> = {
  nota: "Notas",
  proyecto: "Proyectos",
  libro: "Libros",
  recurso: "Fuentes y recursos",
};
const ORDEN: Entidad[] = ["nota", "proyecto", "libro", "recurso"];
const RUTAS: Record<Entidad, string> = { nota: "/notas", proyecto: "/proyectos", libro: "/libros", recurso: "/recursos" };

type Props = {
  tipo: Entidad;
  id: string;
  grupos: GrupoRelacionados[];
  etiquetas: { propias: Etiqueta[]; todas: Etiqueta[] };
  // Solo en notas: las notas cuyo contenido la referencia (editor fase 2).
  mencionan?: { id: string; titulo: string }[];
  // Solo en libros y recursos: citas enlazadas (spec relaciones).
  citas?: Cita[];
};

// «Conexiones» (cambio conexiones, §2.8): todo lo conectado con el elemento en un solo lugar,
// con el contexto de cada uno y solo los grupos que tienen algo. Columna lateral en pantallas anchas.
export default function Conexiones({ tipo, id, grupos, etiquetas, mencionan = [], citas = [] }: Props) {
  const conContenido = ORDEN.map((t) => grupos.find((g) => g.tipo === t)).filter(
    (g): g is GrupoRelacionados => Boolean(g && g.elementos.length),
  );
  const candidatos: Candidato[] = ORDEN.flatMap(
    (t) => grupos.find((g) => g.tipo === t)?.candidatos.map((c) => ({ tipo: t, ...c })) ?? [],
  );
  const vacio = conContenido.length === 0 && mencionan.length === 0 && citas.length === 0;
  const puedeNotaVinculada = tipo !== "nota";

  return (
    <aside aria-labelledby="titulo-conexiones" className={styles.conexiones}>
      <h2 id="titulo-conexiones" className={styles.titulo}>
        Conexiones
      </h2>
      <div className={styles.acciones}>
        <CuadroVincular origenTipo={tipo} origenId={id} candidatos={candidatos} />
        {puedeNotaVinculada && (
          <Link href={`/notas/nueva?vincular=${tipo}:${id}`} className={styles.nuevaNota}>
            Nueva nota vinculada
          </Link>
        )}
      </div>

      {vacio && (
        <p className={styles.vacio}>
          Todavía no hay conexiones. Usa «Vincular…» para relacionarlo con notas, libros, recursos o proyectos.
        </p>
      )}

      <EtiquetasElemento tipo={tipo} id={id} propias={etiquetas.propias} todas={etiquetas.todas} />

      {conContenido.map((g) => (
        <section key={g.tipo} aria-label={GRUPOS[g.tipo]} className={styles.grupo}>
          <h3 className={styles.grupoTitulo}>{GRUPOS[g.tipo]}</h3>
          <ul className={styles.lista}>
            {g.elementos.map((e) => (
              <li key={e.id} className={styles.elemento}>
                <div className={styles.texto}>
                  {existeSeccion(RUTAS[g.tipo]) ? (
                    <Link href={`${RUTAS[g.tipo]}/${e.id}`} className={styles.nombre}>
                      {e.nombre}
                    </Link>
                  ) : (
                    <span className={styles.nombre}>{e.nombre}</span>
                  )}
                  {e.extracto && <p className={styles.extracto}>{e.extracto}</p>}
                  {(e.detalle || e.modificado) && (
                    <p className={styles.detalle}>{e.detalle ?? `Modificada el ${fecha(e.modificado!)}`}</p>
                  )}
                </div>
                <QuitarVinculo origenTipo={tipo} origenId={id} destinoTipo={g.tipo} destinoId={e.id} nombre={e.nombre} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {mencionan.length > 0 && (
        <section aria-label="Notas que la mencionan" className={styles.grupo}>
          <h3 className={styles.grupoTitulo}>Notas que la mencionan</h3>
          <ul className={styles.lista}>
            {mencionan.map((n) => (
              <li key={n.id} className={styles.elemento}>
                <Link href={`/notas/${n.id}`} className={styles.nombre}>
                  {n.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {citas.length > 0 && (
        <section aria-label="Citas enlazadas" className={styles.grupo}>
          <h3 className={styles.grupoTitulo}>Citas</h3>
          <ul className={styles.listaCitas}>
            {citas.map((c) => (
              <li key={c.id}>
                <VistaCita cita={c} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
