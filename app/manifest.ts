import type { MetadataRoute } from "next";

// Manifest PWA — dzięki niemu aplikację można „zainstalować" na ekranie
// głównym (Chrome/Edge/Android) jak zwykłą apkę.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitCoach AI — Panel podopiecznego",
    short_name: "FitCoach AI",
    description:
      "Trening, dieta, pomiary i coaching AI — cały plan trenera w jednym miejscu.",
    start_url: "/client",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#020617",
    theme_color: "#10b981",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}