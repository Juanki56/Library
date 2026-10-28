import Link from "next/link";
import styles from "./ElementosRelacionados.module.css";

type Props = { notas: { id: string; titulo: string }[] };

// «Notas que la mencionan» (cambio editor-fase2-referencias, design D5): las notas cuyo
// contenido guardado referencia a esta, con su título actual. Con el mismo estilo que los relacionados.
export default function NotasQueMencionan({ notas }: Props) {
  return (
    <section aria-labelledby="titulo-menciones" className={styles.seccion}>
      <h2 id="titulo-menciones" className={styles.titulo}>
        Notas que la mencionan
      </h2>
      {notas.length === 0 ? (
        <p className={styles.vacio}>Ninguna nota menciona esta todavía.</p>
      ) : (
        <ul className={styles.lista} aria-labelledby="titulo-menciones">
          {notas.map((n) => (
            <li key={n.id}>
              <Link href={`/notas/${n.id}`}>{n.titulo}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
