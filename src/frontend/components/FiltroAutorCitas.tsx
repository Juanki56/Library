"use client";

import { useRouter } from "next/navigation";
import { SIN_AUTOR } from "@/backend/services/filtros";
import styles from "./FiltroAutorCitas.module.css";

type Props = { autores: string[]; autor?: string; tipo?: string };

// Filtro por autor de la sección Citas (cambio filtros-citas-busqueda, design D3): se aplica al
// elegir, conservando el tipo; queda en la dirección de la página.
export default function FiltroAutorCitas({ autores, autor, tipo }: Props) {
  const router = useRouter();

  function cambiar(valor: string) {
    const p = new URLSearchParams();
    if (tipo) p.set("tipo", tipo);
    if (valor) p.set("autor", valor);
    const consulta = p.toString();
    router.push(consulta ? `/citas?${consulta}` : "/citas");
  }

  return (
    <label className={styles.campo}>
      Autor
      <select value={autor ?? ""} onChange={(e) => cambiar(e.target.value)}>
        <option value="">Todos los autores</option>
        <option value={SIN_AUTOR}>Sin autor</option>
        {autores.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </label>
  );
}
