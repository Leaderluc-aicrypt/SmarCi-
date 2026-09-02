import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env";

/**
 * Client Supabase pour Server Components, Server Actions et Route Handlers.
 *
 * Utilise la clé anonyme et la session de l'utilisateur portée par les
 * cookies : la RLS s'applique donc normalement.
 */
export async function createClient() {
  // `cookies()` d'abord, volontairement : c'est cet appel qui signale à Next.js
  // que la page est dynamique. Valider l'environnement avant lui ferait échouer
  // le prérendu au build — avec l'erreur de configuration au lieu du bascu-
  // lement en rendu dynamique.
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    publicEnv();

  return createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Écriture impossible depuis un Server Component : c'est attendu.
            // Le rafraîchissement de session est assuré par `src/proxy.ts`.
          }
        },
      },
    },
  );
}
