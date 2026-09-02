import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Utilisateur authentifié, ou `null`.
 *
 * `getUser()` valide le jeton auprès de Supabase — contrairement à
 * `getSession()`, qui se contente de lire le cookie. C'est la seule
 * vérification qui fasse autorité : le proxy ne fait qu'une redirection
 * optimiste.
 *
 * `cache()` mémorise le résultat pour la durée d'une requête : plusieurs
 * appels dans le même rendu ne déclenchent qu'un aller-retour.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/** Comme `getUser`, mais redirige vers la connexion si personne n'est connecté. */
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/connexion");
  }

  return user;
}
