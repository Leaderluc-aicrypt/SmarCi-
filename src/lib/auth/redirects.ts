/**
 * Nettoie une destination de redirection fournie par l'URL.
 *
 * Sans ce filtre, `?next=https://exemple.test` transformerait la page de
 * connexion en tremplin vers un site tiers (open redirect) : un lien de
 * hameçonnage pourrait porter notre propre domaine.
 *
 * Seuls les chemins internes sont acceptés — pas de `//`, qui serait interprété
 * comme un domaine, ni de `/\`, que certains navigateurs normalisent en `//`.
 */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/profil",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  return value;
}
