import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";
import { isPublicEnvConfigured, publicEnv } from "@/lib/env";

/**
 * Rafraîchit la session Supabase et propage les cookies mis à jour.
 *
 * Appelé depuis `src/proxy.ts` (l'ancien `middleware.ts`, renommé en Next 16).
 * Sans cela, les jetons expirés ne sont jamais renouvelés côté serveur et
 * l'utilisateur est déconnecté de manière imprévisible.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Tant que Supabase n'est pas configuré, on laisse passer la requête sans
  // erreur : `/api/health` reste joignable et diagnostique le problème.
  if (!isPublicEnvConfigured()) {
    return response;
  }

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    publicEnv();

  const supabase = createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }

          // Empêche la mise en cache d'une réponse porteuse de cookies d'auth :
          // sans cela un CDN pourrait servir la session d'un utilisateur à un
          // autre.
          for (const [key, headerValue] of Object.entries(headers)) {
            response.headers.set(key, headerValue);
          }
        },
      },
    },
  );

  // `getUser()` valide le jeton auprès de Supabase et déclenche le
  // rafraîchissement. Ne pas remplacer par `getSession()`, qui fait confiance
  // au cookie sans le vérifier.
  await supabase.auth.getUser();

  return response;
}
