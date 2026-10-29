import styles from "@/frontend/pantallas/Seccion.module.css";

// Se muestra al instante mientras el servidor prepara la página (cambio velocidad-respuesta): el menú
// y la cabecera se quedan y el clic tiene respuesta. Además, Next.js solo precarga hasta aquí los
// enlaces visibles, en lugar de cada página entera.
export default function Cargando() {
  return (
    <main className={styles.pagina}>
      <p role="status" className={styles.vacio}>
        Cargando…
      </p>
    </main>
  );
}
