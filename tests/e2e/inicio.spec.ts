import { expect, test } from "@playwright/test";

test("la aplicación responde", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.status()).toBeLessThan(500);
});
