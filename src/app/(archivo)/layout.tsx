import CabeceraArchivo from "@/frontend/components/CabeceraArchivo";
import MenuLateral from "@/frontend/components/MenuLateral";
import styles from "@/frontend/components/MarcoArchivo.module.css";

// Zona con sesión: el middleware ya redirige a /entrar cuando no hay usuario.
export const dynamic = "force-dynamic";

export default function LayoutArchivo({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.marco}>
      <MenuLateral />
      <div className={styles.principal}>
        <CabeceraArchivo />
        {children}
      </div>
    </div>
  );
}
