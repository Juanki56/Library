import Link from "next/link";
import { registrarCuenta } from "@/backend/controllers/cuentas";
import FormularioCuenta from "@/frontend/components/FormularioCuenta";
import Ornamento from "@/frontend/components/Ornamento";
import styles from "./Cuenta.module.css";

export default function Registro() {
  return (
    <main className={styles.pagina}>
      <div className={styles.marca}>
        <Ornamento ancho={88} clase={styles.ornamento} />
        <p className={styles.nombre}>Biblioteca</p>
        <p className={styles.lema}>Archivo de conocimiento</p>
      </div>
      <div className={styles.hoja}>
        <h1 className={styles.titulo}>Crear una cuenta</h1>
        <FormularioCuenta
          accion={registrarCuenta}
          textoBoton="Crear cuenta"
          autocompletarContrasena="new-password"
        />
      </div>
      <p className={styles.pie}>
        ¿Ya tienes cuenta? <Link href="/entrar">Entrar</Link>
      </p>
    </main>
  );
}
