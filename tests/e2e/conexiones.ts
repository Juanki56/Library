import { expect, type Page } from "@playwright/test";

// Ayudantes para la sección «Conexiones» (cambio conexiones), compartidos por las pruebas.

export const conexiones = (page: Page) => page.getByRole("complementary", { name: "Conexiones" });

// Grupo de vínculos por tipo: «Notas», «Proyectos», «Libros», «Fuentes y recursos».
export const grupo = (page: Page, nombre: string) => conexiones(page).getByRole("region", { name: nombre });

const exacto = (texto: string) => new RegExp(`^${texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);

export const cuadroVincular = (page: Page) => page.getByRole("dialog", { name: "Vincular" });

// Abre «Vincular…», busca el elemento por su nombre y lo elige.
export async function vincular(page: Page, nombre: string) {
  await conexiones(page).getByRole("button", { name: "Vincular…" }).click();
  const cuadro = cuadroVincular(page);
  await cuadro.getByRole("combobox", { name: "Buscar" }).fill(nombre);
  await cuadro.getByRole("option", { name: exacto(nombre) }).first().click();
  await expect(cuadro).toBeHidden();
}

// Opciones que ofrece «Vincular…» al buscar un texto (deja el cuadro abierto).
export async function ofrecidos(page: Page, texto: string) {
  await conexiones(page).getByRole("button", { name: "Vincular…" }).click();
  await cuadroVincular(page).getByRole("combobox", { name: "Buscar" }).fill(texto);
  return cuadroVincular(page).getByRole("option");
}
