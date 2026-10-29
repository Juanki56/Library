import Link from "next/link";
import { listarCitas } from "@/backend/controllers/lecturas";
import { autoresDeCitas, filtrarCitas } from "@/backend/services/filtros";
import FiltroAutorCitas from "@/frontend/components/FiltroAutorCitas";
import VistaCita from "@/frontend/components/VistaCita";
import styles from "./Seccion.module.css";

const TIPOS: { tipo?: string; texto: string }[] = [
  { texto: "Todas" },
  { tipo: "cita", texto: "Citas" },
  { tipo: "frase", texto: "Frases de autor" },
  { tipo: "proverbio", texto: "Proverbios" },
];

// Citas, frases de autor y proverbios; las más recientes primero (spec citas), con filtros por
// tipo y autor que se combinan (cambio filtros-citas-busqueda).
export default async function ListaCitas({ tipo, autor }: { tipo?: string; autor?: string }) {
  const todas = await listarCitas();
  const citas = filtrarCitas(todas, { tipo, autor });
  const conFiltros = Boolean(tipo || autor);
  const enlace = (t?: string) => {
    const p = new URLSearchParams();
    if (t) p.set("tipo", t);
    if (autor) p.set("autor", autor);
    const consulta = p.toString();
    return consulta ? `/citas?${consulta}` : "/citas";
  };

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Citas</h1>
        <Link href="/citas/nueva" className={styles.accion}>
          Nueva cita
        </Link>
      </div>

      {todas.length > 0 && (
        <>
          <nav aria-label="Filtrar por tipo" className={styles.orden}>
            {TIPOS.map((t) =>
              t.tipo === tipo ? (
                <span key={t.texto} aria-current="true" className={styles.ordenActivo}>
                  {t.texto}
                </span>
              ) : (
                <Link key={t.texto} href={enlace(t.tipo)}>
                  {t.texto}
                </Link>
              ),
            )}
          </nav>
          <FiltroAutorCitas autores={autoresDeCitas(todas)} autor={autor} tipo={tipo} />
        </>
      )}

      {todas.length === 0 ? (
        <p className={styles.vacio}>Todavía no has guardado ninguna cita, frase ni proverbio.</p>
      ) : citas.length === 0 ? (
        <p className={styles.vacio}>
          No hay citas con estos filtros. <Link href="/citas">Ver todas</Link>
        </p>
      ) : (
        <ul className={styles.lista} aria-label="Lista de citas">
          {citas.map((c) => (
            <li key={c.id} className={styles.elementoCita}>
              <VistaCita cita={c} />
            </li>
          ))}
        </ul>
      )}
      {conFiltros && citas.length > 0 && (
        <p className={styles.metadatos}>
          <Link href="/citas">Quitar filtros</Link>
        </p>
      )}
    </main>
  );
}
