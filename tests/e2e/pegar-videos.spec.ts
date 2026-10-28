import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 2.1 (editor-pegar-videos): pegar un enlace de vídeo en una línea vacía.
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
  // Los reproductores no salen a internet durante las pruebas.
  await page.route(/youtube-nocookie\.com|player\.vimeo\.com/, (r) =>
    r.fulfill({ contentType: "text/html", body: "<p>reproductor</p>" }),
  );
  await entrarComo(page, usuario);
});

const parrafo = (t: string) => ({ type: "paragraph", content: [{ type: "text", text: t }] });
const editor = (page: Page) => page.getByLabel("Contenido de la nota");
const estado = (page: Page) => page.getByRole("status", { name: "Estado del guardado" });

async function abrirNota(page: Page, titulo: string, ...contenido: object[]) {
  const doc = { type: "doc", content: contenido.length ? contenido : [{ type: "paragraph" }] } as unknown as Json;
  const { data } = await datos.from("notas").insert({ titulo, contenido: doc }).select("id").single();
  await page.goto(`/notas/${data!.id}`);
  await expect(editor(page)).toBeVisible();
}

// Pega texto como lo haría el navegador (evento «paste» con su portapapeles).
async function pegarTexto(page: Page, texto: string) {
  await editor(page).evaluate((el, t) => {
    const dt = new DataTransfer();
    dt.setData("text/plain", t);
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  }, texto);
}

test("un enlace de YouTube pegado en una línea vacía se convierte en reproductor (escenario «Pegar el enlace en una línea vacía»)", async ({
  page,
}) => {
  await abrirNota(page, "Pegar YouTube");
  await editor(page).click();
  await pegarTexto(page, "https://youtu.be/dQw4w9WgXcQ");
  const reproductor = editor(page).locator("iframe[title='Vídeo de YouTube']");
  await expect(reproductor).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  await expect(editor(page).getByRole("link", { name: "https://youtu.be/dQw4w9WgXcQ" })).toHaveCount(0);

  // El cursor queda debajo, listo para seguir escribiendo.
  await page.keyboard.type("Comentario del vídeo");
  await expect(editor(page).locator("p").last()).toHaveText("Comentario del vídeo");
  await expect(estado(page)).toHaveText("Guardado");
  await page.reload();
  await expect(reproductor).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
});

test("también con Vimeo", async ({ page }) => {
  await abrirNota(page, "Pegar Vimeo");
  await editor(page).click();
  await pegarTexto(page, "  https://vimeo.com/76979871 ");
  await expect(editor(page).locator("iframe[title='Vídeo de Vimeo']")).toHaveAttribute(
    "src",
    "https://player.vimeo.com/video/76979871",
  );
});

test("dentro de un texto sigue siendo un enlace (escenario «Pegar el enlace dentro de un texto»)", async ({ page }) => {
  await abrirNota(page, "Enlace en frase", parrafo("Mira este vídeo: "));
  await editor(page).getByText("Mira este vídeo:").click();
  await page.keyboard.press("End");
  await pegarTexto(page, "https://youtu.be/dQw4w9WgXcQ");
  await expect(editor(page)).toContainText("Mira este vídeo: https://youtu.be/dQw4w9WgXcQ");
  await expect(editor(page).locator("iframe")).toHaveCount(0);
});

test("un enlace de otro sitio en una línea vacía se pega como texto (escenario «Pegar un enlace de otro sitio en una línea vacía»)", async ({
  page,
}) => {
  await abrirNota(page, "Otro sitio");
  await editor(page).click();
  await pegarTexto(page, "https://www.dailymotion.com/video/x7tgad0");
  await expect(editor(page)).toContainText("https://www.dailymotion.com/video/x7tgad0");
  await expect(editor(page).locator("iframe")).toHaveCount(0);
});
