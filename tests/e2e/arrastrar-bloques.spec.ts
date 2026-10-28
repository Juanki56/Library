import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Locator, type Page } from "@playwright/test";
import type { Database, Json } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { entrarComo } from "./sesion";

// Tarea 2.1 (editor-arrastrar-bloques): arrastrar bloques con el ratón (requisito «Mover bloques»).
let usuario: UsuarioPrueba;
let datos: SupabaseClient<Database>;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const WEB = "https://laminas.ejemplo.test";

test.beforeAll(async () => {
  usuario = await crearUsuario({ confirmado: true });
  datos = await clienteDe(usuario);
});

test.afterAll(async () => {
  await borrarUsuario(usuario);
});

test.beforeEach(async ({ page }) => {
  await page.route(`${WEB}/**`, (r) => r.fulfill({ contentType: "image/png", body: PNG }));
  await entrarComo(page, usuario);
});

const texto = (t: string, marks?: object[]) => (marks ? { type: "text", text: t, marks } : { type: "text", text: t });
const parrafo = (t: string, marks?: object[]) => ({ type: "paragraph", content: [texto(t, marks)] });

const editor = (page: Page) => page.getByLabel("Contenido de la nota");
const estado = (page: Page) => page.getByRole("status", { name: "Estado del guardado" });
const asa = (page: Page) => page.locator("[data-asa-bloque]");
const bloques = (page: Page) => editor(page).locator(":scope > *").filter({ hasText: /\S/ });

async function abrirNota(page: Page, titulo: string, ...contenido: object[]) {
  const { data } = await datos
    .from("notas")
    .insert({ titulo, contenido: { type: "doc", content: contenido } as unknown as Json })
    .select("id")
    .single();
  await page.goto(`/notas/${data!.id}`);
  await expect(editor(page)).toBeVisible();
}

// Señala el bloque para que aparezca su asa y la arrastra hasta el final (o el principio) del destino.
async function arrastrar(page: Page, origen: Locator, destino: Locator, posicion: "despues" | "antes") {
  await origen.hover({ position: { x: 30, y: 8 } });
  await expect(asa(page)).toBeVisible();
  // Movimientos por pasos, como una persona: el arrastre nativo necesita varios eventos para empezar.
  const caja = (await destino.boundingBox())!;
  const mango = (await asa(page).boundingBox())!;
  await page.mouse.move(mango.x + mango.width / 2, mango.y + mango.height / 2);
  await page.mouse.down();
  await page.mouse.move(mango.x + mango.width / 2 + 8, mango.y + mango.height / 2 + 8, { steps: 4 });
  const [x, y] = posicion === "despues" ? [caja.x + caja.width - 4, caja.y + caja.height - 4] : [caja.x + 4, caja.y + 4];
  await page.mouse.move(x, y, { steps: 12 });
  await page.mouse.up();
}

test("arrastra el primer párrafo debajo del tercero y se conserva (escenario «Arrastrar un párrafo»)", async ({ page }) => {
  await abrirNota(page, "Arrastrar párrafo", parrafo("Uno", [{ type: "bold" }]), parrafo("Dos"), parrafo("Tres"));
  await arrastrar(page, editor(page).getByText("Uno"), editor(page).getByText("Tres"), "despues");
  await expect(bloques(page)).toHaveText(["Dos", "Tres", "Uno"]);
  await expect(editor(page).locator("strong")).toHaveText("Uno");
  await expect(estado(page)).toHaveText("Guardado");
  await page.reload();
  await expect(bloques(page)).toHaveText(["Dos", "Tres", "Uno"]);
});

test("arrastra el último elemento de una lista encima del primero (escenario «Arrastrar un elemento de lista»)", async ({
  page,
}) => {
  await abrirNota(page, "Arrastrar lista", {
    type: "bulletList",
    content: ["Burguesía", "Pequeña burguesía", "Proletariado"].map((e) => ({ type: "listItem", content: [parrafo(e)] })),
  });
  await arrastrar(page, editor(page).getByText("Proletariado"), editor(page).getByText("Burguesía", { exact: true }), "antes");
  await expect(editor(page).locator("ul > li")).toHaveText(["Proletariado", "Burguesía", "Pequeña burguesía"]);
  await expect(editor(page).locator("ul")).toHaveCount(1);
});

test("arrastra una imagen debajo del párrafo siguiente con su alt y su pie (escenario «Arrastrar una imagen»)", async ({
  page,
}) => {
  await abrirNota(
    page,
    "Arrastrar imagen",
    { type: "imagen", attrs: { origen: "web", src: `${WEB}/retrato.png`, alt: "Retrato", pie: "Londres, 1875" } },
    parrafo("Texto después de la imagen"),
  );
  const figura = editor(page).locator("figure");
  await expect(figura.locator("img")).toBeVisible();
  await arrastrar(page, figura, editor(page).getByText("Texto después de la imagen"), "despues");
  await expect(editor(page).locator(":scope > *").first()).toHaveText("Texto después de la imagen");
  await expect(editor(page).locator("figure img")).toHaveAttribute("alt", "Retrato");
  await expect(editor(page).locator("figure figcaption")).toHaveText("Londres, 1875");
  await expect(estado(page)).toHaveText("Guardado");
});
