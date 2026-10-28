import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 3.3 (editor-fase1-escritura): guardado automático (spec editor-notas).
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

async function crearNota(titulo: string) {
  const { data } = await datos.from("notas").insert({ titulo }).select("id").single();
  return data!.id;
}

const estado = (page: Page) => page.getByRole("status", { name: "Estado del guardado" });
const editor = (page: Page) => page.getByLabel("Contenido de la nota");

async function escribir(page: Page, texto: string) {
  await editor(page).click();
  await page.keyboard.press("End");
  await page.keyboard.type(texto);
}

async function contenidoGuardado(id: string) {
  const { data } = await datos.from("notas").select("contenido_texto").eq("id", id).single();
  return data!.contenido_texto;
}

test("escribir guarda solo y el indicador pasa por «Guardando…» y «Guardado» (escenario «Guardado tras dejar de escribir»)", async ({
  page,
}) => {
  const id = await crearNota("Autoguardado");
  await page.goto(`/notas/${id}`);
  await expect(page.getByRole("button", { name: "Guardar", exact: true })).toHaveCount(0);

  await escribir(page, "Primera idea");
  await expect(estado(page)).toHaveText(/Cambios sin guardar|Guardando…/);
  await expect(estado(page)).toHaveText("Guardado");

  await page.reload();
  await expect(editor(page)).toContainText("Primera idea");
  expect(await contenidoGuardado(id)).toBe("Primera idea");
});

test("navegar justo después de escribir conserva los cambios (escenario «Navegar con cambios pendientes»)", async ({ page }) => {
  const id = await crearNota("Navegar");
  await page.goto(`/notas/${id}`);
  await escribir(page, "Escrito antes de salir");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Notas" }).click();
  await expect(page).toHaveURL(/\/notas$/);
  await expect.poll(() => contenidoGuardado(id)).toBe("Escrito antes de salir");
});

test("sin conexión lo indica y guarda al volver la conexión (escenario «Sin conexión»)", async ({ page, context }) => {
  const id = await crearNota("Sin red");
  await page.goto(`/notas/${id}`);
  await context.setOffline(true);
  await escribir(page, "Escrito sin red");
  await expect(estado(page)).toContainText("Sin conexión: se guardará al volver.");
  await expect(estado(page)).not.toHaveText("Guardado");

  await context.setOffline(false);
  await expect(estado(page)).toHaveText("Guardado", { timeout: 20_000 });
  expect(await contenidoGuardado(id)).toBe("Escrito sin red");
});

test("un fallo del servidor muestra el error con «Reintentar» y no «Guardado» (escenario «Error al guardar»)", async ({ page }) => {
  const id = await crearNota("Fallo del servidor");
  await page.goto(`/notas/${id}`);
  await page.route(`**/notas/${id}`, (ruta) =>
    ruta.request().method() === "POST" ? ruta.fulfill({ status: 500, body: "error" }) : ruta.continue(),
  );
  await escribir(page, "Esto debe reintentarse");
  await expect(estado(page)).toContainText("No se pudo guardar. Se volverá a intentar.");
  await expect(estado(page)).not.toContainText("Guardado");

  await page.unroute(`**/notas/${id}`);
  await estado(page).getByRole("button", { name: "Reintentar" }).click();
  await expect(estado(page)).toHaveText("Guardado");
  expect(await contenidoGuardado(id)).toBe("Esto debe reintentarse");
});

test("un título vacío no se guarda y el contenido no se pierde (escenario «Título vacío»)", async ({ page }) => {
  const id = await crearNota("Título original");
  await page.goto(`/notas/${id}`);
  await page.getByRole("textbox", { name: "Título", exact: true }).fill("");
  await expect(estado(page)).toContainText("La nota necesita un título.");
  const { data } = await datos.from("notas").select("titulo").eq("id", id).single();
  expect(data!.titulo).toBe("Título original");
});

test.describe("dos pestañas (escenario «Nota editada en otra pestaña»)", () => {
  async function dosPestanas(page: Page, titulo: string) {
    const id = await crearNota(titulo);
    await page.goto(`/notas/${id}`);
    await expect(editor(page)).toBeVisible();
    const otra = await page.context().newPage();
    await otra.goto(`/notas/${id}`);
    await escribir(otra, "Versión de la segunda pestaña");
    await expect(estado(otra)).toHaveText("Guardado");
    await escribir(page, "Versión de la primera pestaña");
    const aviso = page.getByRole("alert").filter({ hasText: "Esta nota se modificó en otro lugar." });
    // Guardado automático (1,5 s) y viaje a Supabase: con la máquina cargada puede pasar de 5 s.
    await expect(aviso).toBeVisible({ timeout: 15_000 });
    expect(await contenidoGuardado(id)).toBe("Versión de la segunda pestaña");
    return { id, aviso, otra };
  }

  test("no sobrescribe y permite guardar mis cambios encima", async ({ page }) => {
    const { id, aviso, otra } = await dosPestanas(page, "Conflicto encima");
    await aviso.getByRole("button", { name: "Guardar mis cambios encima" }).click();
    await expect(estado(page)).toHaveText("Guardado");
    expect(await contenidoGuardado(id)).toBe("Versión de la primera pestaña");
    await otra.close();
  });

  test("permite cargar la versión más reciente", async ({ page }) => {
    const { aviso, otra } = await dosPestanas(page, "Conflicto recargar");
    await aviso.getByRole("button", { name: "Cargar la versión más reciente" }).click();
    await expect(editor(page)).toContainText("Versión de la segunda pestaña");
    await expect(editor(page)).not.toContainText("Versión de la primera pestaña");
    await expect(page.getByText("Hay cambios de esta nota que no llegaron a guardarse")).toHaveCount(0);
    await otra.close();
  });
});

test("recupera la copia local tras cerrar sin conexión (escenario «Recuperar una copia local»)", async ({ page, context }) => {
  const id = await crearNota("Copia local");
  await page.goto(`/notas/${id}`);
  await context.setOffline(true);
  await escribir(page, "Escrito antes de cerrar");
  await expect(estado(page)).toContainText("Sin conexión");
  await page.close({ runBeforeUnload: false });

  await context.setOffline(false);
  const nueva = await context.newPage();
  await nueva.goto(`/notas/${id}`);
  const aviso = nueva.getByRole("alert").filter({ hasText: "no llegaron a guardarse" });
  await aviso.getByRole("button", { name: "Recuperar cambios no guardados" }).click();
  await expect(editor(nueva)).toContainText("Escrito antes de cerrar");
  await expect(estado(nueva)).toHaveText("Guardado");
  expect(await contenidoGuardado(id)).toBe("Escrito antes de cerrar");
});

test("avisa antes de cerrar la pestaña con cambios sin guardar (escenario «Cerrar con cambios sin guardar»)", async ({
  page,
  context,
}) => {
  const id = await crearNota("Cerrar con cambios");
  await page.goto(`/notas/${id}`);
  await context.setOffline(true);
  await escribir(page, "Sin guardar todavía");
  await expect(estado(page)).toContainText("Sin conexión");

  const aviso = new Promise<string>((resolver) =>
    page.once("dialog", async (dialogo) => {
      resolver(dialogo.type());
      await dialogo.accept();
    }),
  );
  await page.close({ runBeforeUnload: true });
  expect(await aviso).toBe("beforeunload");
  await context.setOffline(false);
});
