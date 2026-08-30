import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SOS-24 · Sistema de Emergencias GAMC",
    short_name: "SOS-24",
    description: "Sistema Integral de Gestión y Monitoreo de Emergencias Ciudadanas GAMC Cochabamba",
    start_url: "/citizen",
    display: "standalone",
    orientation: "portrait",
    background_color: "#09090b",
    theme_color: "#dc2626",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
