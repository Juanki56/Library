import Link from "next/link";
import { entrarCuenta } from "@/backend/controllers/cuentas";
import FormularioCuenta from "@/frontend/components/FormularioCuenta";
import Ornamento from "@/frontend/components/Ornamento";
import styles from "./Cuenta.module.css";

export default function Entrar({ confirmacionFallida }: { confirmacionFallida: boolean }) {
  return (
    <main className={styles.pagina}>
      <div className={styles.marca}>
        <Ornamento ancho={88} clase={styles.ornamento} />
        <p className={styles.nombre}>Biblioteca</p>
        <p className={styles.lema}>Archivo de conocimiento</p>
      </div>
      <div className={styles.hoja}>
        <h1 className={styles.titulo}>Entrar</h1>
        {confirmacionFallida && (
          <p role="alert" className={styles.aviso}>
            No se pudo completar la confirmación desde el enlace. Si ya lo habías abierto antes, tu
            cuenta puede estar confirmada: prueba a entrar con tu correo y contraseña.
          </p>
        )}
        <FormularioCuenta
          accion={entrarCuenta}
          textoBoton="Entrar"
          autocompletarContrasena="current-password"
        />
      </div>
      <p className={styles.pie}>
        ¿No tienes cuenta? <Link href="/registro">Crear una cuenta</Link>
      </p>
    </main>
  );
}
