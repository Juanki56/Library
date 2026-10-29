import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 4.1 (filtros-citas-busqueda): filtros de Citas y de la búsqueda global.
let usuario: UsuarioPrueba;
let datos: SupabaseClient<Database>;
let comunismo: string;

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  datos = await clienteDe(usuario);
  await datos.from("citas").insert([
    { texto: "Los filósofos no han hecho más que interpretar el mundo.", tipo: "cita", autor: "Karl Marx" },
    { texto: "La religión es el opio del pueblo.", tipo: "frase", autor: "karl marx" },
    { texto: "Sapere aude.", tipo: "frase", autor: "Horacio" },
    { texto: "A quien madruga, Dios le ayuda.", tipo: "proverbio", autor: null },
  ]);
  const { data: libro } = await datos.from("libros").insert({ titulo: "El capital", autores: "Karl Marx" }).select("id").single();
  const { data: nota } = await datos.from("notas").insert({ titulo: "Notas del capital", contenido_texto: "Sobre el capital." }).select("id").single();
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Comunismo" }).select("id").single();
  comunismo = proyecto!.id;
  await datos.from("nota_proyecto").insert({ nota_id: nota!.id, proyecto_id: comunismo });
  await datos.from("libro_proyecto").insert({ libro_id: libro!.id, proyecto_id: comunismo });
});

test.afterAll(async () => {
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await entrarComo(page, usuario);
});

const lista = (page: Page) => page.getByRole("list", { name: "Lista de citas" });

test.describe("Citas (requisito «Filtros de la sección Citas»)", () => {
  test("filtra por tipo y por autor, y los combina", async ({ page }) => {
    await page.goto("/citas");
    await expect(lista(page).getByRole("listitem")).toHaveCount(4);

    await page.getByRole("navigation", { name: "Filtrar por tipo" }).getByRole("link", { name: "Proverbios" }).click();
    await expect(page).toHaveURL(/tipo=proverbio/);
    await expect(lista(page).getByRole("listitem")).toHaveText([/A quien madruga/]);

    await page.goto("/citas");
    await page.getByLabel("Autor").selectOption({ label: "Karl Marx" });
    await expect(page).toHaveURL(/autor=Karl/);
    await expect(lista(page).getByRole("listitem")).toHaveCount(2);

    await page.getByRole("navigation", { name: "Filtrar por tipo" }).getByRole("link", { name: "Frases de autor" }).click();
    await expect(page).toHaveURL(/tipo=frase/);
    await expect(page).toHaveURL(/autor=Karl/);
    await expect(lista(page).getByRole("listitem")).toHaveText([/opio del pueblo/]);
  });

  test("«Sin autor» y sin resultados", async ({ page }) => {
    await page.goto("/citas");
    await page.getByLabel("Autor").selectOption({ label: "Sin autor" });
    await expect(lista(page).getByRole("listitem")).toHaveText([/A quien madruga/]);

    await page.goto("/citas?tipo=cita&autor=Horacio");
    await expect(page.getByText("No hay citas con estos filtros.")).toBeVisible();
    await page.getByRole("link", { name: "Ver todas" }).click();
    await expect(lista(page).getByRole("listitem")).toHaveCount(4);
  });
});

test.describe("búsqueda (requisito «Filtro por tipo de contenido»)", () => {
  const resultados = (page: Page) => page.getByRole("list", { name: "Resultados" }).getByRole("link");

  test("filtra por autor y quita los filtros (escenarios «Filtrar por autor» y «Quitar filtros»)", async ({ page }) => {
    await page.goto("/buscar?q=capital");
    await expect(resultados(page)).toHaveCount(2);

    await page.getByText("Filtros", { exact: true }).click();
    const panel = page.getByRole("form", { name: "Filtros de búsqueda" });
    await panel.getByLabel("Autor").fill("marx");
    await panel.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect(page).toHaveURL(/autor=marx/);
    await expect(resultados(page)).toHaveText(["El capital"]);

    await page.getByRole("link", { name: "Quitar filtros" }).click();
    await expect(page).not.toHaveURL(/autor=/);
    await expect(resultados(page)).toHaveCount(2);
  });

  test("filtra por proyecto sin escribir texto (escenario «Filtrar por etiqueta y proyecto sin texto»)", async ({ page }) => {
    await page.goto("/buscar");
    await page.getByText("Filtros", { exact: true }).click();
    const panel = page.getByRole("form", { name: "Filtros de búsqueda" });
    await panel.getByLabel("Proyecto").selectOption({ label: "Comunismo" });
    await panel.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect(page.getByText("Resultados de los filtros")).toBeVisible();
    await expect(resultados(page)).toHaveCount(2);
    await expect(resultados(page).filter({ hasText: /^El capital$/ })).toHaveCount(1);
    await expect(resultados(page).filter({ hasText: /^Notas del capital$/ })).toHaveCount(1);

    // El filtro de tipo conserva el de proyecto.
    await page.getByRole("navigation", { name: "Filtrar por tipo" }).getByRole("link", { name: "Notas" }).click();
    await expect(page).toHaveURL(new RegExp(`proyecto=${comunismo}`));
    await expect(resultados(page)).toHaveText(["Notas del capital"]);
  });
});
