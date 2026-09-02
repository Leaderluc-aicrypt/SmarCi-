import { AuthError } from "@supabase/supabase-js";

/**
 * Traduit les erreurs Supabase Auth en messages utilisateur.
 *
 * Deux principes :
 * - ne jamais révéler si une adresse e-mail est déjà inscrite (énumération de
 *   comptes) — d'où un message volontairement identique pour « identifiants
 *   invalides » quelle que soit la cause réelle ;
 * - ne jamais afficher le message brut de l'API, qui est en anglais et parfois
 *   trop bavard.
 */
const MESSAGES: Record<string, string> = {
  invalid_credentials: "Adresse e-mail ou mot de passe incorrect.",
  email_not_confirmed:
    "Votre adresse e-mail n'est pas encore confirmée. Consultez le message que nous vous avons envoyé.",
  email_address_invalid: "Cette adresse e-mail n'est pas valide.",
  weak_password:
    "Ce mot de passe est trop faible. Choisissez-en un plus long ou moins courant.",
  over_request_rate_limit:
    "Trop de tentatives. Patientez une minute avant de réessayer.",
  over_email_send_rate_limit:
    "Trop d'e-mails envoyés à cette adresse. Patientez quelques minutes.",
  signup_disabled:
    "Les inscriptions sont temporairement fermées. Réessayez plus tard.",
  otp_expired:
    "Ce lien de confirmation a expiré. Demandez-en un nouveau en vous reconnectant.",
  validation_failed: "Les informations envoyées sont incomplètes ou invalides.",
};

const FALLBACK =
  "Une erreur est survenue. Réessayez dans un instant — si le problème persiste, signalez-le.";

export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthError && error.code && MESSAGES[error.code]) {
    return MESSAGES[error.code];
  }

  return FALLBACK;
}
