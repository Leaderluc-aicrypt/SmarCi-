import { z } from "zod";

/** Longueur maximale d'un message. Large, mais bornée : ce texte partira au
 *  modèle en Phase 4, et une saisie sans limite s'y paie en jetons. */
export const LONGUEUR_MAX = 4000;

export const messageSchema = z.object({
  contenu: z
    .string()
    .trim()
    .min(1, "Écrivez quelque chose avant d'envoyer.")
    .max(
      LONGUEUR_MAX,
      `Message trop long (${LONGUEUR_MAX} caractères maximum).`,
    ),
});
