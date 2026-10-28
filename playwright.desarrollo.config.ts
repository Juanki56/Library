import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Las mismas pruebas E2E contra el servidor de desarrollo (Turbopack), el que se usa a diario con
// «npm run dev». Puerto y carpeta propios: no interfiere con un «npm run dev» abierto.
const PORT = 3200;

export default defineConfig({
  ...base,
  use: { ...base.use, baseURL: `http://localhost:${PORT}` },
  // La primera visita a cada página compila en el momento: más margen que en producción.
  timeout: 90_000,
  expect: { timeout: 20_000 },
  webServer: {
    command: `npx next dev --turbopack -p ${PORT}`,
    env: { NEXT_DIST_DIR: ".next-desarrollo" },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
