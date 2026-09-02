import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy Next.js (ex-`middleware.ts`, renommé en Next.js 16).
 *
 * Rôle unique : maintenir la session Supabase à jour à chaque navigation.
 * La protection des routes sera ajoutée en Phase 2 (authentification).
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     * - `api/health` — doit rester joignable même mal configuré, pour
     *   pouvoir diagnostiquer ;
     * - les fichiers statiques et images, qui n'ont pas de session.
     */
    "/((?!api/health|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
