import Link from "next/link";
import { eliminarApartado } from "@/backend/controllers/apartados";
import type { organizacionProyecto } from "@/backend/controllers/lecturas";
import { ENTIDADES } from "@/backend/services/catalogo";
import ConfirmarEliminacion from "./ConfirmarEliminacion";
import { Anadir, Editar, Mover, Nuevo, Quitar } from "./FormulariosApartado";
import styles from "./ApartadosProyecto.module.css";

type Organizacion = Awaited<ReturnType<typeof organizacionProyecto>>;

const TIPO: Record<"nota" | "libro" | "recurso", string> = {
  nota: "nota",
  libro: "libro",
  recurso: "recurso",
};

// Apartados del proyecto en el orden elegido, con su contenido, y «Sin apartado» (spec proyectos).
export default function ApartadosProyecto({ proyectoId, organizacion }: {
  proyectoId: string;
  organizacion: Organizacion;
}) {
  const { apartados, sinApartado } = organizacion;

  return (
    <section aria-labelledby="titulo-apartados" className={styles.seccion}>
      <h2 id="titulo-apartados" className={styles.titulo}>
        Apartados
      </h2>

      {apartados.length === 0 && (
        <p className={styles.vacio}>
          Este proyecto aún no tiene apartados. Crea uno para organizar su contenido.
        </p>
      )}

      <ol className={styles.lista} aria-label="Apartados del proyecto">
        {apartados.map((a, i) => (
          <li key={a.id} className={styles.apartado}>
            <section aria-label={`${a.numero}. ${a.titulo}`}>
              <div className={styles.cabecera}>
                <h3 className={styles.nombre}>
                  <span className={styles.numero}>{a.numero}.</span> {a.titulo}
                </h3>
                <div className={styles.acciones}>
                  <Mover
                    id={a.id}
                    proyectoId={proyectoId}
                    titulo={a.titulo}
                    primero={i === 0}
                    ultimo={i === apartados.length - 1}
                  />
                  <ConfirmarEliminacion
                    id={a.id}
                    nombre={a.titulo}
                    aviso={a.aviso}
                    accion={eliminarApartado}
                    etiquetaBoton={`Eliminar el apartado «${a.titulo}»`}
                  />
                </div>
              </div>
              {a.descripcion && <p className={styles.descripcion}>{a.descripcion}</p>}

              {a.contenido.length === 0 ? (
                <p className={styles.vacio}>Apartado vacío.</p>
              ) : (
                <ul className={styles.contenido}>
                  {a.contenido.map((e) => (
                    <li key={`${e.tipo}-${e.id}`}>
                      <span className={styles.tipo}>{TIPO[e.tipo]}</span>
                      <Link href={`${ENTIDADES[e.tipo].ruta}/${e.id}`}>{e.nombre}</Link>
                      <Quitar apartadoId={a.id} proyectoId={proyectoId} tipo={e.tipo} id={e.id} nombre={e.nombre} />
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.herramientas}>
                <Anadir apartadoId={a.id} proyectoId={proyectoId} titulo={a.titulo} candidatos={a.candidatos} />
                <Editar id={a.id} proyectoId={proyectoId} titulo={a.titulo} descripcion={a.descripcion} />
              </div>
            </section>
          </li>
        ))}
      </ol>

      <section aria-label="Sin apartado" className={styles.sinApartado}>
        <h3 className={styles.nombre}>Sin apartado</h3>
        {sinApartado.length === 0 ? (
          <p className={styles.vacio}>Todo el contenido del proyecto está organizado en apartados.</p>
        ) : (
          <ul className={styles.contenido}>
            {sinApartado.map((e) => (
              <li key={`${e.tipo}-${e.id}`}>
                <span className={styles.tipo}>{TIPO[e.tipo]}</span>
                <Link href={`${ENTIDADES[e.tipo].ruta}/${e.id}`}>{e.nombre}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Nuevo proyectoId={proyectoId} />
    </section>
  );
}
