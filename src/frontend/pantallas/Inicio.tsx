import styles from "./Inicio.module.css";

// Pantalla provisional: el contenido de Inicio está pendiente (spec navegacion).
export default function Inicio() {
  return (
    <main className={styles.pagina}>
      <h1>Biblioteca</h1>
      <p className={styles.subtitulo}>Archivo personal de conocimiento</p>
    </main>
  );
}
