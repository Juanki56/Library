import Link from "next/link";
import { listarNotas } from "@/backend/controllers/lecturas";
import type { OrdenNotas } from "@/backend/services/notas";
import { fecha } from "./fechas";
import styles from "./Seccion.module.css";

const ORDENES: { valor: OrdenNotas; texto: string }[] = [
  { valor: "modificacion", texto: "Modificadas recientemente" },
  { valor: "creacion", texto: "Creadas recientemente" },
];

export default async function ListaNotas({ orden }: { orden: OrdenNotas }) {
  const notas = await listarNotas(orden);

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Notas</h1>
        <Link href="/notas/nueva" className={styles.accion}>
          Nueva nota
        </Link>
      </div>

      <nav aria-label="Ordenar notas" className={styles.orden}>
        {ORDENES.map((o) =>
          o.valor === orden ? (
            <span key={o.valor} aria-current="true" className={styles.ordenActivo}>
              {o.texto}
            </span>
          ) : (
            <Link key={o.valor} href={`/notas?orden=${o.valor}`}>
              {o.texto}
            </Link>
          ),
        )}
      </nav>

      {notas.length === 0 ? (
        <p className={styles.vacio}>Todavía no has escrito ninguna nota.</p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de notas">
          {notas.map((n) => (
            <li key={n.id} className={styles.elemento}>
              <Link href={`/notas/${n.id}`}>{n.titulo}</Link>
              <p className={styles.metadatos}>
                Creada el {fecha(n.creadoEn)} · Modificada el {fecha(n.actualizadoEn)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
