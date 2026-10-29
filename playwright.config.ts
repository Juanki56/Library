import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Carga .env.local para que las pruebas usen el mismo proyecto de Supabase.
loadEnvConfig(process.cwd());

const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Compila en .next-pruebas, separada de la carpeta .next de «npm run dev»: así las pruebas
  // nunca rompen el servidor de desarrollo que se esté usando.
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    env: { NEXT_DIST_DIR: ".next-pruebas" },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // Margen amplio: con «npm run dev» abierto a la vez, la compilación puede pasar de 4 minutos.
    timeout: 420_000,
  },
});
