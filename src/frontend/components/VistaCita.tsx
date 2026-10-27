import Link from "next/link";
import { NOMBRE_TIPO, textoAutor, type Cita } from "@/backend/services/citas";
import { ENTIDADES } from "@/backend/services/catalogo";
import styles from "./VistaCita.module.css";

// Una cita como cita editorial: texto en cursiva, autor y origen. Sin inventar datos (spec citas).
export default function VistaCita({ cita, enlazar = true }: { cita: Cita; enlazar?: boolean }) {
  return (
    <figure className={styles.cita}>
      <blockquote className={styles.texto}>
        {enlazar ? (
          <Link href={`/citas/${cita.id}`} className={styles.enlaceTexto}>
            {cita.texto}
          </Link>
        ) : (
          cita.texto
        )}
      </blockquote>
      <figcaption className={styles.pie}>
        <span className={styles.autor}>— {textoAutor(cita)}</span>
        <span className={styles.separador} aria-hidden="true">
          ·
        </span>
        {cita.fuente && <span className={styles.origen}>{cita.fuente}</span>}
        {cita.enlace && (
          <Link href={`${ENTIDADES[cita.enlace.tipo].ruta}/${cita.enlace.id}`} className={styles.origen}>
            {cita.fuente ? `(${cita.enlace.titulo})` : cita.enlace.titulo}
          </Link>
        )}
        {!cita.fuente && !cita.enlace && <span className={styles.origen}>Sin origen</span>}
        {cita.tipo !== "cita" && <span className={styles.tipo}>{NOMBRE_TIPO[cita.tipo]}</span>}
      </figcaption>
    </figure>
  );
}
