/**
 * État partagé des formulaires d'authentification.
 *
 * Volontairement séparé de `actions.ts` : un module marqué `"use server"` ne
 * peut exporter que des fonctions asynchrones. Y placer une constante fait
 * échouer le rendu à l'exécution — sans que le build ni le typage ne le
 * signalent.
 */
export type AuthFormState = {
  status: "idle" | "error" | "confirmation";
  /** Message global, affiché au-dessus du formulaire. */
  message?: string;
  /** Erreurs par champ, affichées sous chaque saisie. */
  fieldErrors?: Record<string, string[]>;
  /** Valeurs à réafficher. Ne contient jamais le mot de passe. */
  values?: { fullName?: string; email?: string };
};

export const initialAuthFormState: AuthFormState = { status: "idle" };
