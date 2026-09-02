import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { getUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Inscription" };

export default async function InscriptionPage() {
  if (await getUser()) {
    redirect("/profil");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold text-card-foreground">
          Créer un compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Quelques secondes suffisent pour commencer.
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="text-link underline underline-offset-4"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
