import Link from "next/link";
import { glosarioPorLetra } from "@/backend/controllers/lecturas";
import styles from "./Glosario.module.css";
import seccion from "./Seccion.module.css";

// Glosario en orden alfabético, agrupado por letra y con acceso por letra (spec glosario).
export default async function ListaGlosario() {
  const grupos = await glosarioPorLetra();

  return (
    <main className={seccion.pagina}>
      <div className={seccion.encabezado}>
        <h1>Glosario</h1>
        <Link href="/glosario/nuevo" className={seccion.accion}>
          Nuevo término
        </Link>
      </div>

      {grupos.length === 0 ? (
        <p className={seccion.vacio}>Todavía no has registrado ningún término.</p>
      ) : (
        <>
          <nav aria-label="Ir a la letra" className={styles.abecedario}>
            {grupos.map((g) => (
              <a key={g.letra} href={`#letra-${g.letra}`}>
                {g.letra}
              </a>
            ))}
          </nav>
          {grupos.map((g) => (
            <section key={g.letra} id={`letra-${g.letra}`} aria-label={`Letra ${g.letra}`} className={styles.letra}>
              <h2 className={styles.inicial}>{g.letra}</h2>
              <dl className={styles.lista}>
                {g.entradas.map((e) => (
                  <div key={e.id} className={styles.entrada}>
                    <dt>
                      <Link href={`/glosario/${e.id}`}>{e.termino}</Link>
                    </dt>
                    <dd className={styles.definicion}>{e.definicion}</dd>
                    {e.ejemplo && <dd className={styles.ejemplo}>Ejemplo: {e.ejemplo}</dd>}
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
