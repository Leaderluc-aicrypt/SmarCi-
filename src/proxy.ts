import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Routes réservées aux utilisateurs connectés.
 *
 * Un chemin protège aussi tout ce qui se trouve en dessous : `/profil` couvre
 * `/profil/parametres`.
 */
const ROUTES_PROTEGEES = ["/profil", "/conversation"];

function estProtegee(pathname: string): boolean {
  return ROUTES_PROTEGEES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Proxy Next.js (ex-`middleware.ts`, renommé en Next.js 16).
 *
 * Deux rôles : maintenir la session Supabase à jour, et rediriger tôt les
 * visiteurs non connectés.
 *
 * Cette redirection est **optimiste** — elle évite d'afficher une page vide,
 * rien de plus. La vérification qui fait autorité reste `requireUser()` dans
 * la page elle-même : la documentation Next.js déconseille explicitement de
 * confier l'autorisation au seul proxy.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!user && estProtegee(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "";
    url.searchParams.set("next", pathname);

    const redirection = NextResponse.redirect(url);

    // Report des cookies rafraîchis : sans cela, un jeton renouvelé pendant
    // cette requête serait perdu au moment de la redirection.
    for (const cookie of response.cookies.getAll()) {
      redirection.cookies.set(cookie);
    }

    return redirection;
  }

  return response;
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
