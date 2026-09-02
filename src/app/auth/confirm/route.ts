import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d'arrivée du lien de confirmation envoyé par e-mail.
 *
 * Supabase y renvoie l'utilisateur avec un `token_hash` à usage unique ;
 * `verifyOtp` l'échange contre une session, posée en cookie par le client
 * serveur.
 *
 * Cette URL doit figurer dans les « Redirect URLs » du projet Supabase, sinon
 * le lien de l'e-mail ne pointera jamais ici.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Lien expiré, déjà utilisé, ou tronqué par le client mail.
  return NextResponse.redirect(
    new URL("/connexion?erreur=lien-invalide", request.url),
  );
}
