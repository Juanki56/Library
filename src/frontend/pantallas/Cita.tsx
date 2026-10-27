import Link from "next/link";
import { notFound } from "next/navigation";
import { eliminarCita } from "@/backend/controllers/citas";
import { obtenerCita, opcionesEnlaceCita } from "@/backend/controllers/lecturas";
import ConfirmarEliminacion from "@/frontend/components/ConfirmarEliminacion";
import FormularioCita from "@/frontend/components/FormularioCita";
import VistaCita from "@/frontend/components/VistaCita";
import styles from "./Seccion.module.css";

export default async function Cita({ id }: { id: string }) {
  const [cita, opciones] = await Promise.all([obtenerCita(id), opcionesEnlaceCita()]);
  if (!cita) notFound();
  const resumen = cita.texto.length > 60 ? `${cita.texto.slice(0, 60)}…` : cita.texto;

  return (
    <main className={styles.pagina}>
      <div className={styles.encabezado}>
        <h1>Cita</h1>
        <Link href="/citas" className={styles.accion}>
          Volver a citas
        </Link>
      </div>

      <VistaCita cita={cita} enlazar={false} />
      <div className={styles.separacion} />
      <FormularioCita cita={cita} opciones={opciones} />

      <div className={styles.acciones}>
        <span />
        <ConfirmarEliminacion
          id={cita.id}
          nombre={resumen}
          aviso={
            cita.enlace
              ? `La cita se eliminará; «${cita.enlace.titulo}» no se borrará.`
              : "La cita se eliminará."
          }
          accion={eliminarCita}
        />
      </div>
    </main>
  );
}
