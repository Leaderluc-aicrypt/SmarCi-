import Image from "next/image";
import Link from "next/link";

/**
 * Cadre commun aux écrans de connexion et d'inscription.
 *
 * Ces écrans vivent dans la coquille de l'application : la navigation basse
 * reste visible, et l'entrée « Profil » y apparaît active. Se connecter est
 * une étape du parcours Profil, pas une sortie de l'application.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/"
          className="flex flex-col items-center gap-3 text-center"
          aria-label="Retour à l'accueil"
        >
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={56}
            height={56}
            className="rounded-xl"
          />
          <span className="font-display text-2xl font-bold tracking-tight text-[var(--nav-active)]">
            SmarCi
          </span>
        </Link>

        {/* Surface opaque : sur un fond en dégradé, le texte posé directement
            dessus tombe sous le seuil de contraste. */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          {children}
        </div>
      </div>
    </main>
  );
}
