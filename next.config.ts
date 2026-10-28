import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Imágenes de hasta 5 MB por Server Action (editor-fase3-imagenes-videos, design D3);
    // el margen cubre el resto del formulario. La validación real está en el servicio.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
