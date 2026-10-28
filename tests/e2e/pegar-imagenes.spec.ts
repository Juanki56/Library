import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { admin, borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 2.1 (editor-pegar-imagenes): pegar y soltar imágenes en el editor.
let usuario: UsuarioPrueba;
let datos: SupabaseClient<Database>;

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const WEB = "https://laminas-web.ejemplo.test";

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  datos = await clienteDe(usuario);
});

test.afterAll(async () => {
  const { data: carpetas } = await admin().storage.from("imagenes").list(usuario.id);
  for (const c of carpetas ?? []) {
    const { data: archivos } = await admin().storage.from("imagenes").list(`${usuario.id}/${c.name}`);
    const rutas = (archivos ?? []).map((a) => `${usuario.id}/${c.name}/${a.name}`);
    if (rutas.length) await admin().storage.from("imagenes").remove(rutas);
  }
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await page.route(`${WEB}/**`, (r) => r.fulfill({ contentType: "image/png", body: Buffer.from(PNG_BASE64, "base64") }));
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
  return data!.id;
}

type Archivo = { nombre: string; tipo: string; base64?: string; bytes?: number };

// Pega en el editor archivos o HTML como lo haría el navegador (evento «paste» con su portapapeles).
async function pegar(page: Page, contenido: { archivos?: Archivo[]; html?: string }) {
  await editor(page).evaluate((el, { archivos, html }) => {
    const dt = new DataTransfer();
    for (const a of archivos ?? []) {
      const datos = a.base64 ? Uint8Array.from(atob(a.base64), (c) => c.charCodeAt(0)) : new Uint8Array(a.bytes ?? 0);
      dt.items.add(new File([datos], a.nombre, { type: a.tipo }));
    }
    if (html) dt.setData("text/html", html);
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
  }, contenido);
}

async function cargada(page: Page) {
  const img = editor(page).locator("figure img").first();
  await expect(img).toBeVisible();
  await expect
    .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { timeout: 20_000 })
    .toBe(true);
  return img;
}

test("pegar una captura la sube y se ve al reabrir (escenario «Pegar una captura»)", async ({ page }) => {
  await abrirNota(page, "Pegar captura", parrafo("Antes de la captura"));
  await editor(page).getByText("Antes de la captura").click();
  await page.keyboard.press("End");
  await pegar(page, { archivos: [{ nombre: "captura.png", tipo: "image/png", base64: PNG_BASE64 }] });
  await cargada(page);
  await expect(editor(page)).toContainText("Antes de la captura");
  await expect(estado(page)).toHaveText("Guardado");
  await page.reload();
  await cargada(page);
});

test("soltar un archivo de imagen lo inserta donde se suelta (escenario «Arrastrar un archivo de imagen»)", async ({ page }) => {
  await abrirNota(page, "Soltar archivo", parrafo("Primero"), parrafo("Segundo"));
  const segundo = editor(page).getByText("Segundo");
  const caja = (await segundo.boundingBox())!;
  await editor(page).evaluate(
    (el, { base64, x, y }) => {
      const dt = new DataTransfer();
      dt.items.add(new File([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], "lamina.png", { type: "image/png" }));
      el.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, clientX: x, clientY: y, bubbles: true, cancelable: true }));
    },
    { base64: PNG_BASE64, x: caja.x + 2, y: caja.y + 2 },
  );
  await cargada(page);
  // La imagen queda entre los dos párrafos.
  const orden = await editor(page).evaluate((el) =>
    Array.from(el.children)
      // Tiptap envuelve la figura de la imagen en su propio contenedor.
      .map((c) => (c.querySelector("figure") ? "imagen" : c.textContent?.trim()))
      .filter(Boolean),
  );
  expect(orden).toEqual(["Primero", "imagen", "Segundo"]);
});

test("pegar contenido de una web inserta sus imágenes con dirección web (escenario «Pegar contenido de una web con imágenes»)", async ({
  page,
}) => {
  const id = await abrirNota(page, "Pegar web");
  await editor(page).click();
  await pegar(page, {
    html: `<p>Texto copiado</p><img src="${WEB}/manifiesto.png" alt="Portada del Manifiesto"><img src="data:image/png;base64,${PNG_BASE64}">`,
  });
  const img = await cargada(page);
  await expect(img).toHaveAttribute("src", `${WEB}/manifiesto.png`);
  await expect(img).toHaveAttribute("alt", "Portada del Manifiesto");
  await expect(editor(page).locator("figure")).toHaveCount(1);
  await expect(editor(page)).toContainText("Texto copiado");
  await expect(estado(page)).toHaveText("Guardado");
  const { count } = await admin().from("imagenes_nota").select("*", { count: "exact", head: true }).eq("nota_id", id);
  expect(count).toBe(0);
});

test("pegar algo que no es una imagen admitida avisa y no inserta nada (escenario «Pegar algo que no es una imagen admitida»)", async ({
  page,
}) => {
  await abrirNota(page, "Pegar rechazos");
  await editor(page).click();
  await pegar(page, { archivos: [{ nombre: "enorme.png", tipo: "image/png", bytes: 6 * 1024 * 1024 }] });
  await expect(page.getByRole("alert").filter({ hasText: "La imagen no puede superar 5 MB." })).toBeVisible();
  await pegar(page, { archivos: [{ nombre: "dibujo.svg", tipo: "image/svg+xml", base64: btoa("<svg/>") }] });
  await expect(page.getByRole("alert").filter({ hasText: "Solo se admiten imágenes PNG, JPEG, GIF o WebP." })).toBeVisible();
  // Con un .png falso, el servidor comprueba el contenido.
  await pegar(page, { archivos: [{ nombre: "falsa.png", tipo: "image/png", base64: btoa("<svg/>") }] });
  await expect(page.getByRole("alert").filter({ hasText: "Solo se admiten imágenes PNG, JPEG, GIF o WebP." })).toBeVisible();
  await expect(editor(page).locator("figure")).toHaveCount(0);
});
