import { z } from "zod";

/**
 * Validation des variables d'environnement.
 *
 * La validation est *paresseuse* : elle ne s'exécute qu'au premier appel, pas à
 * l'import du module. Cela permet à `next build` de réussir sans secrets (CI),
 * tout en échouant avec un message clair au premier accès réel.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL est manquante")
    .url("NEXT_PUBLIC_SUPABASE_URL doit être une URL valide"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante"),
});

/**
 * Secrets serveur. Optionnels en Phase 1 :
 * - `SUPABASE_SERVICE_ROLE_KEY` n'est pas encore utilisée ;
 * - `OPENAI_API_KEY` ne le sera qu'à partir de la Phase 4.
 *
 * Elles deviendront obligatoires quand le code les consommera réellement.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function format(error: z.ZodError): string {
  return error.issues.map((issue) => `  - ${issue.message}`).join("\n");
}

let publicCache: PublicEnv | undefined;

/**
 * Variables lisibles côté navigateur comme côté serveur.
 *
 * Les clés sont écrites en toutes lettres : Next.js remplace
 * `process.env.NEXT_PUBLIC_*` à la compilation uniquement sur un accès
 * littéral. Un accès dynamique renverrait `undefined` dans le bundle client.
 */
export function publicEnv(): PublicEnv {
  if (publicCache) return publicCache;

  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Configuration Supabase incomplète :\n${format(parsed.error)}\n` +
        "Renseignez ces variables dans .env.local (en local) et dans les " +
        "Environment Variables du projet Vercel (en production).",
    );
  }

  publicCache = parsed.data;
  return publicCache;
}

/** Vrai si les variables publiques sont présentes et valides, sans lever. */
export function isPublicEnvConfigured(): boolean {
  try {
    publicEnv();
    return true;
  } catch {
    return false;
  }
}

let serverCache: ServerEnv | undefined;

/** Secrets serveur. Ne jamais appeler depuis un composant client. */
export function serverEnv(): ServerEnv {
  if (serverCache) return serverCache;

  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  });

  if (!parsed.success) {
    throw new Error(`Secrets serveur invalides :\n${format(parsed.error)}`);
  }

  serverCache = parsed.data;
  return serverCache;
}
