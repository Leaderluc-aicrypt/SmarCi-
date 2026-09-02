/**
 * Thème visuel de l'application.
 *
 * Deux palettes sont en concurrence tant que l'arbitrage n'est pas rendu :
 *
 * - `night` — le fond sombre décrit au §6.1 du plan MVP ;
 * - `sky` — le dégradé ciel de la maquette `docs/maquettes/`.
 *
 * Les deux partagent structure, typographie et espacements : seule la couleur
 * change, ce qui isole la décision. Une fois tranchée, la palette perdante et
 * ce fichier disparaissent.
 */
export type Theme = "night" | "sky";

export const THEME: Theme = "night";

export const themeClass: Record<Theme, string> = {
  night: "theme-night dark",
  sky: "theme-sky",
};
