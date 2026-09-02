import type { MetadataRoute } from "next";

/**
 * Manifeste PWA — sert `/manifest.webmanifest`.
 *
 * Permet l'installation de SmarCi sur l'écran d'accueil (plan MVP §3.1).
 * Pas de service worker à ce stade : l'application requiert le réseau.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmarCi — Copilote import FCFA",
    short_name: "SmarCi",
    description:
      "Copilote IA spécialisé dans l'importation pour la zone FCFA : conseils pédagogiques et calculs de rentabilité fiables.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05070b",
    theme_color: "#05070b",
    lang: "fr",
    dir: "ltr",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
