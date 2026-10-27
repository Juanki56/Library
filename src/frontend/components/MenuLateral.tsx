"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { salirCuenta } from "@/backend/controllers/cuentas";
import { SECCIONES, esActiva } from "@/frontend/navegacion";
import Icono from "./Icono";
import Ornamento from "./Ornamento";
import styles from "./MenuLateral.module.css";

// Menú lateral permanente con las ocho áreas y la sección activa resaltada (§6).
export default function MenuLateral() {
  const actual = usePathname();

  return (
    <aside className={styles.lateral}>
      <div className={styles.marca}>
        <Ornamento ancho={72} clase={styles.fleuron} />
        <Link href="/" className={styles.nombre}>
          Biblioteca
        </Link>
        <span className={styles.lema}>Archivo de conocimiento</span>
      </div>

      <nav aria-label="Principal" className={styles.navegacion}>
        <ul>
          {SECCIONES.map((s) => {
            const activa = esActiva(s.ruta, actual);
            return (
              <li key={s.ruta}>
                {s.disponible ? (
                  <Link
                    href={s.ruta}
                    aria-current={activa ? "page" : undefined}
                    className={activa ? `${styles.enlace} ${styles.activa}` : styles.enlace}
                  >
                    <Icono nombre={s.icono} clase={styles.icono} />
                    <span>{s.texto}</span>
                  </Link>
                ) : (
                  <span className={`${styles.enlace} ${styles.pendiente}`} aria-disabled="true">
                    <Icono nombre={s.icono} clase={styles.icono} />
                    <span>{s.texto}</span>
                    <span className={styles.pronto}>en preparación</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <form action={salirCuenta} className={styles.pie}>
        <button type="submit" className={styles.salir}>
          <Icono nombre="salir" clase={styles.icono} />
          <span>Salir</span>
        </button>
      </form>
    </aside>
  );
}
