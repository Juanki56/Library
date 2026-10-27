import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Pruebas contra el proyecto real de Supabase de .env.local (RLS, vínculos, cascadas).
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: { "server-only": new URL("./tests/unit/vacio.ts", import.meta.url).pathname },
  },
  test: {
    environment: "node",
    include: ["tests/integracion/**/*.test.ts"],
    env: loadEnv("development", process.cwd(), ""),
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
