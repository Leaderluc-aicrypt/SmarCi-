import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

/**
 * Accueil provisoire.
 *
 * L'accueil définitif — bouton central doré, navigation à trois entrées
 * (plan MVP §6) — sera construit en Phase 3 à partir de la maquette. Cette
 * page se contente d'orienter vers la connexion ou l'inscription.
 */
export default async function Home() {
  const user = await getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={72}
        height={72}
        priority
        className="rounded-2xl"
      />

      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-paper-100">
          SmarCi
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Copilote IA spécialisé dans l&apos;importation pour la zone FCFA.
        </p>
      </div>

      {user ? (
        <Link
          href="/profil"
          className={cn(buttonVariants({ size: "lg" }), "w-full max-w-xs")}
        >
          Accéder à mon profil
        </Link>
      ) : (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/inscription"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Créer un compte
          </Link>
          <Link
            href="/connexion"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full",
            )}
          >
            Se connecter
          </Link>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <span className="text-gold-400">Phase 2</span> — la conversation avec le
        copilote arrive à la phase suivante.
      </p>
    </main>
  );
}
