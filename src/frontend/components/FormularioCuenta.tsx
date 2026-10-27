"use client";

import { useActionState } from "react";
import type { EstadoFormulario } from "@/backend/controllers/cuentas";
import { enviarSinVaciar } from "./enviarSinVaciar";
import styles from "./FormularioCuenta.module.css";

type Props = {
  accion: (estado: EstadoFormulario, formulario: FormData) => Promise<EstadoFormulario>;
  textoBoton: string;
  autocompletarContrasena: "current-password" | "new-password";
};

export default function FormularioCuenta({ accion, textoBoton, autocompletarContrasena }: Props) {
  const [estado, enviar, enviando] = useActionState(accion, {});

  if (estado.mensaje) {
    return (
      <p role="status" className={styles.mensaje}>
        {estado.mensaje}
      </p>
    );
  }

  return (
    <form onSubmit={enviarSinVaciar(enviar)} className={styles.formulario}>
      <label className={styles.campo}>
        Correo electrónico
        <input name="correo" type="email" autoComplete="email" required />
      </label>
      <label className={styles.campo}>
        Contraseña
        <input
          name="contrasena"
          type="password"
          autoComplete={autocompletarContrasena}
          minLength={autocompletarContrasena === "new-password" ? 8 : undefined}
          required
        />
      </label>
      {estado.error && (
        <p role="alert" className={styles.error}>
          {estado.error}
        </p>
      )}
      <button type="submit" disabled={enviando} className={styles.boton}>
        {textoBoton}
      </button>
    </form>
  );
}
