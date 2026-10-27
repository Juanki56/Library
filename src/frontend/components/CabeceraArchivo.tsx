import Icono from "./Icono";
import styles from "./CabeceraArchivo.module.css";

// Cabecera del área principal con la búsqueda global (spec navegacion: «Búsqueda en la cabecera»).
export default function CabeceraArchivo() {
  return (
    <header className={styles.cabecera}>
      <form role="search" action="/buscar" method="get" className={styles.buscador} aria-label="Búsqueda global">
        <Icono nombre="buscar" clase={styles.lupa} />
        <label htmlFor="busqueda-global" className={styles.oculto}>
          Buscar en todo el archivo
        </label>
        <input
          id="busqueda-global"
          type="search"
          name="q"
          placeholder="Buscar en tu archivo…"
          required
          maxLength={200}
          className={styles.campo}
        />
        <button type="submit" className={styles.oculto}>
          Buscar
        </button>
      </form>
    </header>
  );
}
