import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "@/backend/repositories/tipos-db";
import { borrarUsuario, clienteDe, crearUsuario, type UsuarioPrueba } from "../utilidades/usuarios";
import { grupo, vincular } from "./conexiones";
import { entrarComo } from "./sesion";

// Tareas 7.1 y 7.2: fuentes y recursos (specs fuentes-recursos, relaciones).
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

const campoTitulo = (page: Page) => page.getByRole("textbox", { name: "Título", exact: true });

test("guarda un recurso sin dirección web (escenario «Recurso sin dirección web»)", async ({ page }) => {
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Fuentes y recursos" }).click();
  await page.getByRole("link", { name: "Nuevo recurso" }).click();
  await campoTitulo(page).fill("Apuntes de clase");
  await page.getByLabel("Descripción").fill("Fotocopias del seminario");
  await page.getByRole("button", { name: "Crear recurso" }).click();

  await expect(page).toHaveURL(/\/recursos\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: "Apuntes de clase" })).toBeVisible();
  await expect(page.getByLabel("Dirección web (opcional)")).toHaveValue("");
});

test("guarda una página web y rechaza direcciones que no son http/https", async ({ page }) => {
  await page.goto("/recursos/nuevo");
  await campoTitulo(page).fill("Archivo marxista");
  await page.getByLabel("Dirección web (opcional)").fill("ftp://ejemplo.com/archivo");
  await page.getByRole("button", { name: "Crear recurso" }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "La dirección web debe empezar por http:// o https://",
  );

  await page.getByLabel("Dirección web (opcional)").fill("https://www.marxists.org/espanol/");
  await page.getByRole("button", { name: "Crear recurso" }).click();
  await expect(page).toHaveURL(/\/recursos\/[0-9a-f-]{36}$/);

  const enlace = page.getByRole("link", { name: /Abrir www\.marxists\.org/ });
  await expect(enlace).toHaveAttribute("href", "https://www.marxists.org/espanol/");
  await expect(enlace).toHaveAttribute("rel", "noopener noreferrer");
});

test("un recurso en varios espacios es el mismo y sus cambios se ven en todos (spec fuentes-recursos)", async ({
  page,
}) => {
  const { data: recurso } = await datos.from("recursos").insert({ titulo: "Artículo sobre clases" }).select("id").single();
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Comunismo (recursos)" }).select("id").single();
  const { data: nota } = await datos.from("notas").insert({ titulo: "La lucha de clases (recursos)" }).select("id").single();
  const { data: libro } = await datos.from("libros").insert({ titulo: "Manifiesto (recursos)" }).select("id").single();

  // Lo vincula desde su propia página a un proyecto, una nota y un libro.
  await page.goto(`/recursos/${recurso!.id}`);
  const vinculos: [string, string][] = [
    ["Proyectos", "Comunismo (recursos)"],
    ["Notas", "La lucha de clases (recursos)"],
    ["Libros", "Manifiesto (recursos)"],
  ];
  for (const [nombreGrupo, elemento] of vinculos) {
    await vincular(page, elemento);
    await expect(grupo(page, nombreGrupo).getByRole("link", { name: elemento })).toBeVisible();
  }

  // Edita el recurso una vez.
  await campoTitulo(page).fill("Artículo sobre clases (revisado)");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado.");

  // El cambio se ve desde el proyecto, la nota y el libro, que enlazan al mismo recurso.
  for (const ruta of [`/proyectos/${proyecto!.id}`, `/notas/${nota!.id}`, `/libros/${libro!.id}`]) {
    await page.goto(ruta);
    await expect(
      grupo(page, "Fuentes y recursos").getByRole("link", { name: "Artículo sobre clases (revisado)" }),
    ).toHaveAttribute("href", `/recursos/${recurso!.id}`);
  }

  await page.goto("/recursos");
  await expect(page.getByRole("link", { name: "Artículo sobre clases (revisado)" })).toHaveCount(1);
});

test("eliminar un recurso avisa y conserva lo relacionado (spec relaciones)", async ({ page }) => {
  const { data: recurso } = await datos.from("recursos").insert({ titulo: "Recurso a eliminar" }).select("id").single();
  const { data: proyecto } = await datos.from("proyectos").insert({ nombre: "Proyecto que se queda" }).select("id").single();
  await datos.from("recurso_proyecto").insert({ recurso_id: recurso!.id, proyecto_id: proyecto!.id });

  await page.goto(`/recursos/${recurso!.id}`);
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Se quitará 1 vínculo con 1 proyecto. Ese elemento no se borrará.",
  );
  await page.getByRole("button", { name: "Eliminar definitivamente" }).click();

  await expect(page).toHaveURL(/\/recursos$/);
  const proyectos = await datos.from("proyectos").select("id").eq("id", proyecto!.id);
  expect(proyectos.data).toHaveLength(1);
});
