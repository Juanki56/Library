import Link from "next/link";
import { ENTIDADES, type Entidad } from "@/backend/services/catalogo";
import type { GrupoRelacionados } from "@/backend/services/relacionados";
import { existeSeccion } from "@/frontend/navegacion";
import styles from "./ElementosRelacionados.module.css";
import { Quitar, Vincular } from "./FormularioVinculo";

const TITULOS: Record<Entidad, { grupo: string; elegir: string }> = {
  proyecto: { grupo: "Proyectos", elegir: "Vincular un proyecto" },
  nota: { grupo: "Notas", elegir: "Vincular una nota" },
  libro: { grupo: "Libros", elegir: "Vincular un libro" },
  recurso: { grupo: "Fuentes y recursos", elegir: "Vincular un recurso" },
};

type Props = { tipo: Entidad; id: string; grupos: GrupoRelacionados[] };

// Relaciones de un elemento mostradas como listas con enlaces (spec relaciones).
// La forma visual definitiva sigue pendiente; aquí se usa una lista por tipo.
export default function ElementosRelacionados({ tipo, id, grupos }: Props) {
  return (
    <section aria-labelledby="titulo-relacionados" className={styles.seccion}>
      <h2 id="titulo-relacionados" className={styles.titulo}>
        Elementos relacionados
      </h2>
      {grupos.map((g) => {
        const origen = { origenTipo: tipo, origenId: id, destinoTipo: g.tipo };
        const ruta = ENTIDADES[g.tipo].ruta;
        return (
          <section key={g.tipo} aria-label={TITULOS[g.tipo].grupo} className={styles.grupo}>
            <h3>{TITULOS[g.tipo].grupo}</h3>
            {g.elementos.length === 0 ? (
              <p className={styles.vacio}>Sin {TITULOS[g.tipo].grupo.toLowerCase()} vinculados.</p>
            ) : (
              <ul className={styles.lista}>
                {g.elementos.map((e) => (
                  <li key={e.id}>
                    {existeSeccion(ruta) ? <Link href={`${ruta}/${e.id}`}>{e.nombre}</Link> : <span>{e.nombre}</span>}
                    <Quitar {...origen} destinoId={e.id} nombre={e.nombre} />
                  </li>
                ))}
              </ul>
            )}
            <Vincular {...origen} candidatos={g.candidatos} etiqueta={TITULOS[g.tipo].elegir} />
          </section>
        );
      })}
    </section>
  );
}
