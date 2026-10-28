import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las pruebas E2E compilan en su propia carpeta (NEXT_DIST_DIR=.next-pruebas) para no tocar
  // la de «npm run dev» mientras se usa la app.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // Imágenes de hasta 5 MB por Server Action (editor-fase3-imagenes-videos, design D3);
    // el margen cubre el resto del formulario. La validación real está en el servicio.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
