import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { grupo } from "./conexiones";
import { entrarComo } from "./sesion";

// Tarea 3.1 (apartados-proyectos): el ejemplo «Estudiar filosofía» en la interfaz (spec proyectos).
let usuario: UsuarioPrueba;
let datos: SupabaseClient<Database>;

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  datos = await clienteDe(usuario);
});

test.afterAll(async () => {
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await entrarComo(page, usuario);
});

const bloque = (page: Page) => page.getByRole("region", { name: "Apartados" });
const apartado = (page: Page, nombre: string) => bloque(page).getByRole("region", { name: nombre });
const titulosApartados = (page: Page) =>
  bloque(page).getByRole("list", { name: "Apartados del proyecto" }).getByRole("heading", { level: 3 });

async function crearApartado(page: Page, titulo: string, descripcion = "") {
  const nuevo = bloque(page).locator("form").filter({ has: page.getByRole("heading", { name: "Nuevo apartado" }) });
  await nuevo.getByLabel("Título del apartado").fill(titulo);
  await nuevo.getByLabel("Descripción del apartado (opcional)").fill(descripcion);
  await nuevo.getByRole("button", { name: "Crear apartado" }).click();
  await expect(bloque(page).getByRole("heading", { level: 3, name: new RegExp(`\\d+\\. ${titulo}$`) })).toBeVisible();
}

test("ejemplo «Estudiar filosofía»: apartados numerados, orden, varios apartados y «Sin apartado»", async ({ page }) => {
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Estudiar filosofía" }).select("id").single();
  const { data: platon } = await datos.from("notas").insert({ titulo: "Platón: la teoría de las ideas" }).select("id").single();
  await datos.from("notas").insert({ titulo: "Kant y el deber" });
  await datos.from("libros").insert({ titulo: "Ética a Nicómaco" });
  await datos.from("nota_proyecto").insert({ nota_id: platon!.id, proyecto_id: proyecto!.id });

  await page.goto(`/proyectos/${proyecto!.id}`);

  // Sin apartados, el contenido del proyecto está en «Sin apartado».
  await expect(bloque(page).getByText("Este proyecto aún no tiene apartados.")).toBeVisible();
  await expect(bloque(page).getByRole("region", { name: "Sin apartado" })).toContainText("Platón: la teoría de las ideas");

  // Crear tres apartados numerados.
  await crearApartado(page, "Filosofía antigua", "Platón y Aristóteles");
  await crearApartado(page, "Filosofía moderna");
  await crearApartado(page, "Ética");
  await expect(titulosApartados(page)).toHaveText(["1. Filosofía antigua", "2. Filosofía moderna", "3. Ética"]);
  await expect(apartado(page, "1. Filosofía antigua")).toContainText("Platón y Aristóteles");

  // Subir «Ética».
  await bloque(page).getByRole("button", { name: "Subir «Ética»" }).click();
  await expect(titulosApartados(page)).toHaveText(["1. Filosofía antigua", "2. Ética", "3. Filosofía moderna"]);

  // Platón a «Filosofía antigua»: sale de «Sin apartado».
  const antigua = apartado(page, "1. Filosofía antigua");
  await antigua.getByLabel("Añadir a «Filosofía antigua»").selectOption({ label: "Platón: la teoría de las ideas" });
  await antigua.getByRole("button", { name: "Añadir" }).click();
  await expect(antigua.getByRole("link", { name: "Platón: la teoría de las ideas" })).toBeVisible();
  await expect(bloque(page).getByRole("region", { name: "Sin apartado" })).not.toContainText("Platón");

  // Kant (no estaba en el proyecto) en dos apartados: se vincula y no se duplica.
  for (const [region, titulo] of [["2. Ética", "Ética"], ["3. Filosofía moderna", "Filosofía moderna"]]) {
    const ap = apartado(page, region);
    await ap.getByLabel(`Añadir a «${titulo}»`).selectOption({ label: "Kant y el deber" });
    await ap.getByRole("button", { name: "Añadir" }).click();
    await expect(ap.getByRole("link", { name: "Kant y el deber" })).toBeVisible();
  }
  await expect(
    grupo(page, "Notas").getByRole("link", {
      name: "Kant y el deber",
    }),
  ).toHaveCount(1);

  // Un libro que no estaba en el proyecto, a «Ética».
  const etica = apartado(page, "2. Ética");
  await etica.getByLabel("Añadir a «Ética»").selectOption({ label: "Ética a Nicómaco" });
  await etica.getByRole("button", { name: "Añadir" }).click();
  await expect(etica.getByRole("link", { name: "Ética a Nicómaco" })).toBeVisible();

  // Quitar a Platón de su único apartado: vuelve a «Sin apartado».
  await antigua.getByRole("button", { name: "Quitar «Platón: la teoría de las ideas» del apartado" }).click();
  await expect(bloque(page).getByRole("region", { name: "Sin apartado" })).toContainText("Platón: la teoría de las ideas");

  // Eliminar «Ética» con aviso: Kant sigue en «Filosofía moderna» y el libro pasa a «Sin apartado».
  await bloque(page).getByRole("button", { name: "Eliminar el apartado «Ética»" }).click();
  const dialogo = page.getByRole("dialog", { name: "¿Eliminar «Ética»?" });
  await expect(dialogo).toContainText("Los 2 elementos de este apartado seguirán en el proyecto.");
  await dialogo.getByRole("button", { name: "Eliminar definitivamente" }).click();

  await expect(titulosApartados(page)).toHaveText(["1. Filosofía antigua", "2. Filosofía moderna"]);
  await expect(apartado(page, "2. Filosofía moderna").getByRole("link", { name: "Kant y el deber" })).toBeVisible();
  await expect(bloque(page).getByRole("region", { name: "Sin apartado" })).toContainText("Ética a Nicómaco");
});

test("editar el título y la descripción de un apartado", async ({ page }) => {
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Proyecto editable" }).select("id").single();
  await page.goto(`/proyectos/${proyecto!.id}`);
  await crearApartado(page, "Provisional");

  const ap = apartado(page, "1. Provisional");
  await ap.getByText("Editar").click();
  await ap.getByLabel("Título del apartado").fill("Definitivo");
  await ap.getByLabel("Descripción del apartado (opcional)").fill("Con descripción");
  await ap.getByRole("button", { name: "Guardar apartado" }).click();
  await expect(bloque(page).getByRole("heading", { level: 3, name: "1. Definitivo" })).toBeVisible();
  await expect(apartado(page, "1. Definitivo")).toContainText("Con descripción");
});
