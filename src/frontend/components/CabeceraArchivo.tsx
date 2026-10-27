import Icono from "./Icono";
import styles from "./CabeceraArchivo.module.css";

// Cabecera del área principal con el acceso a la búsqueda global (§4). La búsqueda aún
// no está implementada: el cuadro se muestra desactivado hasta que exista.
export default function CabeceraArchivo() {
  return (
    <header className={styles.cabecera}>
      <form role="search" className={styles.buscador} aria-label="Búsqueda global">
        <Icono nombre="buscar" clase={styles.lupa} />
        <label htmlFor="busqueda-global" className={styles.oculto}>
          Buscar en todo el archivo
        </label>
        <input
          id="busqueda-global"
          type="search"
          placeholder="Buscar en tu archivo…"
          disabled
          aria-describedby="busqueda-estado"
          className={styles.campo}
        />
        <span id="busqueda-estado" className={styles.estado}>
          próximamente
        </span>
      </form>
    </header>
  );
}
