/**
 * État du formulaire d'envoi.
 *
 * Séparé des Server Actions : un module `"use server"` ne peut exporter que
 * des fonctions asynchrones.
 */
export type EnvoiState = {
  status: "idle" | "error";
  message?: string;
};

export const initialEnvoiState: EnvoiState = { status: "idle" };
