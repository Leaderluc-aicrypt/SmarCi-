import Image from "next/image";

/**
 * Page d'accueil provisoire.
 *
 * Sert uniquement à valider le socle technique (Phase 1) : elle prouve que le
 * déploiement, la palette et les polices fonctionnent. L'accueil définitif
 * — bouton central doré, navigation à trois entrées (plan MVP §6) — sera
 * construit en Phase 3, à partir de la maquette.
 */
export default function Home() {
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

      <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-gold-400">Phase 1</span> — socle
          technique en place.
        </p>
        <p className="mt-1">
          Authentification, conversation et moteur de calcul arrivent aux phases
          suivantes.
        </p>
      </div>

      <a
        href="/api/health"
        className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-teal-400"
      >
        Vérifier l&apos;état du système
      </a>
    </main>
  );
}
