// Lógica del guardado automático de una nota (cambio editor-fase1-escritura, design D5–D7).
// Sin React ni red: recibe la función que guarda, para poder probarla con temporizadores simulados.

export type EstadoGuardado = "guardado" | "pendiente" | "guardando" | "error" | "sin-conexion" | "conflicto";

export type Borrador = { titulo: string; contenido: string };

export type ResultadoGuardado =
  | { tipo: "ok"; version: string }
  | { tipo: "conflicto"; version: string }
  | { tipo: "error"; error: string; validacion: boolean };

export type Situacion = { estado: EstadoGuardado; mensaje?: string };

export type CopiaLocal = {
  escribir: (borrador: Borrador, versionBase: string) => void;
  borrar: () => void;
};

type Opciones = {
  versionInicial: string;
  guardar: (borrador: Borrador, versionBase: string) => Promise<ResultadoGuardado>;
  alCambiar: (situacion: Situacion) => void;
  copiaLocal?: CopiaLocal;
  enLinea?: () => boolean;
  espera?: number;
};

export const ESPERA = 1500;
export const REINTENTOS = [2000, 4000, 8000, 16000, 30000];
export const MENSAJE_SIN_CONEXION = "Sin conexión: se guardará al volver.";
export const MENSAJE_ERROR_RED = "No se pudo guardar. Se volverá a intentar.";
export const MENSAJE_CONFLICTO = "Esta nota se modificó en otro lugar.";

export class GuardadoAutomatico {
  private version: string;
  private ultimo: Borrador | null = null;
  private revision = 0;
  private revisionGuardada = 0;
  private enCurso = false;
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private intentos = 0;
  private versionConflicto: string | null = null;
  private situacion: Situacion = { estado: "guardado" };
  private destruido = false;

  constructor(private readonly opciones: Opciones) {
    this.version = opciones.versionInicial;
  }

  get estado(): EstadoGuardado {
    return this.situacion.estado;
  }

  get versionActual(): string {
    return this.version;
  }

  // true mientras haya cambios que el servidor aún no ha confirmado.
  hayCambiosSinGuardar(): boolean {
    return this.revision > this.revisionGuardada;
  }

  // Cada cambio del usuario: queda pendiente, se copia en local y se guarda tras la espera.
  cambio(borrador: Borrador): void {
    this.ultimo = borrador;
    this.revision += 1;
    this.opciones.copiaLocal?.escribir(borrador, this.version);
    if (this.situacion.estado === "conflicto") return; // espera la decisión del usuario
    this.cambiar({ estado: "pendiente" });
    this.programar(this.opciones.espera ?? ESPERA);
  }

  // Guardar ya (al perder el foco, ocultar la pestaña o salir de la página).
  guardarAhora(): void {
    if (this.situacion.estado === "conflicto") return;
    this.limpiarTemporizador();
    void this.enviar();
  }

  // Botón «Reintentar» o vuelta de la conexión.
  reintentar(): void {
    this.intentos = 0;
    this.guardarAhora();
  }

  // Ante un conflicto: «Guardar mis cambios encima».
  guardarEncima(): void {
    if (this.situacion.estado !== "conflicto" || !this.versionConflicto) return;
    this.version = this.versionConflicto;
    this.versionConflicto = null;
    this.cambiar({ estado: "pendiente" });
    this.guardarAhora();
  }

  destruir(): void {
    this.destruido = true;
    this.limpiarTemporizador();
  }

  private programar(ms: number): void {
    this.limpiarTemporizador();
    this.temporizador = setTimeout(() => {
      this.temporizador = null;
      void this.enviar();
    }, ms);
  }

  private limpiarTemporizador(): void {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = null;
  }

  private cambiar(situacion: Situacion): void {
    this.situacion = situacion;
    if (!this.destruido) this.opciones.alCambiar(situacion);
  }

  // Una sola petición a la vez; lo que llegue durante un guardado se envía al terminar.
  private async enviar(): Promise<void> {
    if (this.enCurso || !this.ultimo || !this.hayCambiosSinGuardar()) return;
    this.enCurso = true;
    const borrador = this.ultimo;
    const revision = this.revision;
    this.cambiar({ estado: "guardando" });

    let resultado: ResultadoGuardado | null = null;
    try {
      resultado = await this.opciones.guardar(borrador, this.version);
    } catch {
      resultado = null; // fallo de red o del servidor
    } finally {
      this.enCurso = false;
    }

    if (resultado === null || (resultado.tipo === "error" && !resultado.validacion)) {
      const sinConexion = this.opciones.enLinea ? !this.opciones.enLinea() : false;
      this.cambiar({
        estado: sinConexion ? "sin-conexion" : "error",
        mensaje: sinConexion ? MENSAJE_SIN_CONEXION : resultado?.tipo === "error" ? resultado.error : MENSAJE_ERROR_RED,
      });
      const espera = REINTENTOS[Math.min(this.intentos, REINTENTOS.length - 1)];
      this.intentos += 1;
      this.programar(espera);
      return;
    }

    if (resultado.tipo === "error") {
      // Error de validación (por ejemplo, título vacío): no se reintenta hasta el próximo cambio.
      this.cambiar({ estado: "error", mensaje: resultado.error });
      return;
    }

    if (resultado.tipo === "conflicto") {
      this.versionConflicto = resultado.version;
      this.cambiar({ estado: "conflicto", mensaje: MENSAJE_CONFLICTO });
      return;
    }

    this.version = resultado.version;
    this.intentos = 0;
    this.revisionGuardada = revision;
    if (this.hayCambiosSinGuardar()) {
      void this.enviar();
      return;
    }
    this.opciones.copiaLocal?.borrar();
    this.cambiar({ estado: "guardado" });
  }
}
