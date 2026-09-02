import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Conversation" };

/**
 * Écran de conversation — coquille seulement.
 *
 * L'interface de chat est la suite immédiate de cette phase ; elle est isolée
 * ici pour que l'arbitrage de palette porte sur l'accueil sans être refait
 * deux fois.
 */
export default async function ConversationPage() {
  await requireUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-xl font-bold text-[var(--nav-active)]">
        Conversation
      </h1>
      <p className="max-w-xs text-sm text-[var(--foreground)] opacity-70">
        L&apos;interface de discussion avec le copilote arrive juste après
        l&apos;arbitrage de la palette.
      </p>
    </main>
  );
}
