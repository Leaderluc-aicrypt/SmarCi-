import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FormMessage } from "@/components/auth/form-feedback";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/auth/redirects";
import { getUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/connexion">) {
  if (await getUser()) {
    redirect("/profil");
  }

  const params = await searchParams;
  const next = safeNextPath(
    typeof params.next === "string" ? params.next : undefined,
  );
  const linkExpired = params.erreur === "lien-invalide";

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold text-paper-100">Se connecter</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez vos conversations et vos calculs.
        </p>
      </div>

      {linkExpired ? (
        <FormMessage
          tone="error"
          message="Ce lien de confirmation n'est plus valide. Connectez-vous pour en recevoir un nouveau."
        />
      ) : null}

      <SignInForm next={next} />

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="text-gold-400 underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
