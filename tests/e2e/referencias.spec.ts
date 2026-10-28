import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 5.1 (editor-fase2-referencias): referencias a notas y «Notas que la mencionan».
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

async function crearNota(titulo: string, contenido?: Json) {
  const { data } = await datos
    .from("notas")
    .insert(contenido ? { titulo, contenido } : { titulo })
    .select("id")
    .single();
  return data!.id;
}

const conReferencia = (id: string) => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Según " }, { type: "referencia", attrs: { tipo: "nota", id } }],
    },
  ],
});

const editor = (page: Page) => page.getByLabel("Contenido de la nota");
const estado = (page: Page) => page.getByRole("status", { name: "Estado del guardado" });
const menciones = (page: Page) => page.getByRole("region", { name: "Notas que la mencionan" });
const cuadro = (page: Page) => page.getByRole("dialog", { name: "Referencia a una nota" });

async function abrir(page: Page, id: string) {
  await page.goto(`/notas/${id}`);
  await expect(editor(page)).toBeVisible();
}

test("inserta una referencia desde el menú «/» y se conserva (escenario «Insertar una referencia»)", async ({ page }) => {
  const manifiesto = await crearNota("El Manifiesto comunista");
  const lucha = await crearNota("Lucha de clases");
  await abrir(page, lucha);
  await editor(page).click();
  await page.keyboard.type("/refer");
  await page.getByRole("listbox", { name: "Insertar bloque" }).getByRole("option", { name: /Referencia a una nota/ }).click();

  await cuadro(page).getByRole("combobox", { name: "Buscar nota" }).fill("manifiesto");
  await expect(cuadro(page).getByRole("option")).toHaveText(["El Manifiesto comunista"]);
  await page.keyboard.press("Enter");

  await expect(editor(page).getByRole("link", { name: "El Manifiesto comunista" })).toBeVisible();
  await expect(estado(page)).toHaveText("Guardado");
  await page.reload();
  await expect(editor(page).getByRole("link", { name: "El Manifiesto comunista" })).toHaveAttribute(
    "href",
    `/notas/${manifiesto}`,
  );
});

test("inserta desde la barra, busca sin tildes y no ofrece la propia nota (escenario «Búsqueda sin tildes»)", async ({
  page,
}) => {
  await crearNota("Historia económica");
  const actual = await crearNota("Apuntes de historia");
  await abrir(page, actual);
  await editor(page).click();
  await page
    .getByRole("toolbar", { name: "Formato", exact: true })
    .getByRole("button", { name: "Referencia a una nota" })
    .click();
  await cuadro(page).getByRole("combobox", { name: "Buscar nota" }).fill("HISTORIA economica");
  await expect(cuadro(page).getByRole("option")).toHaveText(["Historia económica"]);
  await cuadro(page).getByRole("combobox", { name: "Buscar nota" }).fill("apuntes");
  await expect(cuadro(page).getByText("Ninguna nota tiene ese título.")).toBeVisible();
  await cuadro(page).getByRole("button", { name: "Cancelar" }).click();
  await expect(cuadro(page)).toBeHidden();
});

test("muestra el título actual y abre la nota referida (escenarios «Título actualizado» y «Abrir la nota referida»)", async ({
  page,
}) => {
  const referida = await crearNota("Título antiguo");
  const origen = await crearNota("Nota que cita", conReferencia(referida));
  await datos.from("notas").update({ titulo: "Título renovado" }).eq("id", referida);

  await abrir(page, origen);
  await expect(editor(page)).toContainText("Según");
  await expect(editor(page)).not.toContainText("Título antiguo");
  await editor(page).getByRole("link", { name: "Título renovado" }).click();
  await expect(page).toHaveURL(new RegExp(`/notas/${referida}$`));
  await expect(page.getByRole("textbox", { name: "Título", exact: true })).toHaveValue("Título renovado");
});

test("«Notas que la mencionan» lista cada nota una vez y se vacía al quitar la referencia", async ({ page }) => {
  const destino = await crearNota("Destino de menciones");
  await abrir(page, destino);
  await expect(menciones(page)).toContainText("Ninguna nota menciona esta todavía.");

  const doble = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "referencia", attrs: { tipo: "nota", id: destino } },
          { type: "text", text: " y " },
          { type: "referencia", attrs: { tipo: "nota", id: destino } },
        ],
      },
    ],
  };
  const origen = await crearNota("Origen doble", doble);
  await page.reload();
  await expect(menciones(page).getByRole("link")).toHaveText(["Origen doble"]);

  // Quitar las referencias desde el editor y guardar.
  await menciones(page).getByRole("link", { name: "Origen doble" }).click();
  await expect(page).toHaveURL(new RegExp(`/notas/${origen}$`));
  await editor(page).click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Delete");
  await expect(estado(page)).toHaveText("Guardado");

  await abrir(page, destino);
  await expect(menciones(page)).toContainText("Ninguna nota menciona esta todavía.");
});

test("una referencia a una nota eliminada se muestra como «Nota eliminada» (escenario «Nota referida eliminada»)", async ({
  page,
}) => {
  const borrada = await crearNota("Se va a eliminar");
  const origen = await crearNota("Superviviente", conReferencia(borrada));
  await datos.from("notas").delete().eq("id", borrada);

  await abrir(page, origen);
  await expect(editor(page)).toContainText("Según");
  await expect(editor(page).getByText("Nota eliminada")).toBeVisible();
  await expect(editor(page).getByRole("link")).toHaveCount(0);
});
