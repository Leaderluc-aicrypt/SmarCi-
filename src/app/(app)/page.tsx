import { Hub } from "@/components/home/hub";
import { getUser } from "@/lib/auth/session";

/**
 * Accueil — reprend la composition de la maquette MVP.
 *
 * Le bouton central est la seule action offerte : conformément au plan MVP
 * §6.1, il n'existe pas de bouton « Calculer » séparé. Le calcul est déclenché
 * par le copilote lui-même, au fil de la conversation.
 */
export default async function Home() {
  const user = await getUser();

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-8 pb-4">
      <header className="mb-2">
        <p className="font-display text-lg leading-none font-bold tracking-tight text-[var(--nav-active)]">
          SmarCi
        </p>
        <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
          Ton copilote pour importer
        </p>
      </header>

      <div className="flex flex-1 items-center justify-center">
        {/* Sans session, l'ouverture conduit à la création de compte, rattachée
            au parcours Profil. Avec une session, elle mène droit au copilote —
            l'utilisateur est reconnu d'une visite à l'autre. */}
        <Hub href={user ? "/conversation" : "/inscription"} />
      </div>
    </main>
  );
}
