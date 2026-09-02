import { z } from "zod";

/**
 * Validation des formulaires d'authentification.
 *
 * Exécutée côté serveur dans les Server Actions : un contrôle purement client
 * serait contournable. Les messages sont destinés à l'utilisateur final.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "L'adresse e-mail est obligatoire.")
  .pipe(z.email("Cette adresse e-mail n'est pas valide."));

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Indiquez au moins 2 caractères.")
    .max(80, "80 caractères maximum."),
  email,
  password: z
    .string()
    // 72 octets est la limite de bcrypt, utilisé par Supabase Auth.
    .max(72, "72 caractères maximum.")
    .min(8, "Le mot de passe doit faire au moins 8 caractères.")
    .regex(/[a-zA-Z]/, "Le mot de passe doit contenir au moins une lettre.")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre."),
});

export const signInSchema = z.object({
  email,
  // Aucune contrainte de forme à la connexion : les règles ont pu changer
  // depuis la création du compte, et c'est Supabase qui tranche.
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
