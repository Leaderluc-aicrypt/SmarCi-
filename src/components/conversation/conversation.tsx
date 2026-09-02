"use client";

import { useEffect, useOptimistic, useRef, useState } from "react";

import { MessageBubble } from "@/components/conversation/message-bubble";
import { SendButton } from "@/components/conversation/send-button";
import { envoyerMessage } from "@/lib/conversation/actions";
import { initialEnvoiState } from "@/lib/conversation/form-state";
import type { Message } from "@/lib/conversation/queries";
import { LONGUEUR_MAX } from "@/lib/conversation/schemas";

type MessageAffiche = Message & { optimiste?: boolean };

/** Amorces reprises des scénarios de test du plan MVP §8. */
const AMORCES = [
  "Je veux commencer l'importation. Par quoi commencer ?",
  "J'ai un prix, une quantité et un transport. Est-ce rentable ?",
];

export function Conversation({
  messagesInitiaux,
}: {
  messagesInitiaux: Message[];
}) {
  const [erreur, setErreur] = useState<string | undefined>();

  // Le message s'affiche immédiatement, avant la confirmation du serveur.
  const [messages, ajouterOptimiste] = useOptimistic<MessageAffiche[], string>(
    messagesInitiaux,
    (courant, contenu) => [
      ...courant,
      {
        id: `optimiste-${courant.length}`,
        role: "user",
        content: contenu,
        created_at: new Date().toISOString(),
        optimiste: true,
      },
    ],
  );

  // Champ contrôlé, volontairement : React 19 réinitialise un formulaire non
  // contrôlé à la fin de son action. Ce qui aurait été tapé pendant
  // l'enregistrement du message précédent serait effacé sans prévenir.
  const [texte, setTexte] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const champRef = useRef<HTMLTextAreaElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // Le champ grandit avec le texte, jusqu'à la hauteur maximale fixée en CSS.
  useEffect(() => {
    const el = champRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [texte]);

  // Action du formulaire. `useActionState` n'est volontairement pas utilisé
  // ici : sa fonction d'action ne doit pas être appelée depuis une autre
  // action, et l'imbriquer faisait perdre les mises à jour d'état locales.
  async function soumettre(formData: FormData) {
    const contenu = String(formData.get("contenu") ?? "").trim();
    if (!contenu) return;

    ajouterOptimiste(contenu);

    const resultat = await envoyerMessage(initialEnvoiState, formData);

    if (resultat.status === "error") {
      setErreur(resultat.message);
      // Le message n'est pas parti : on le rend à l'utilisateur plutôt que de
      // le perdre. La bulle optimiste, elle, disparaît d'elle-même.
      setTexte(contenu);
      return;
    }

    setErreur(undefined);
  }

  function amorcer(amorce: string) {
    setTexte(amorce);
    champRef.current?.focus();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {/* Tant que la Phase 4 n'est pas faite, le copilote ne répond pas.
              Le dire vaut mieux que laisser croire à une panne. */}
          <p
            role="status"
            className="rounded-lg border border-border bg-card/80 px-3 py-2 text-xs text-muted-foreground"
          >
            Le copilote n&apos;est pas encore branché — vos messages sont
            enregistrés et vous les retrouverez à votre prochaine visite.
          </p>

          {messages.length === 0 ? (
            <div className="mt-6 space-y-4 text-center">
              <p className="text-sm text-[var(--foreground)] opacity-80">
                Posez votre première question.
              </p>
              <div className="flex flex-col gap-2">
                {AMORCES.map((texte) => (
                  <button
                    key={texte}
                    type="button"
                    onClick={() => amorcer(texte)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:bg-secondary"
                  >
                    {texte}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                enCours={message.optimiste}
              />
            ))
          )}

          <div ref={finRef} />
        </div>
      </div>

      <form
        ref={formRef}
        action={soumettre}
        // Vidage synchrone : dans l'action, il passerait par une transition et
        // le texte envoyé resterait visible un instant dans le champ.
        onSubmit={() => setTexte("")}
        className="border-t border-border bg-[var(--nav-surface)] px-4 py-3"
      >
        <div className="mx-auto w-full max-w-2xl space-y-2">
          {erreur ? (
            <p role="alert" className="text-sm text-destructive">
              {erreur}
            </p>
          ) : null}

          <div className="flex items-end gap-2">
            <label htmlFor="contenu" className="sr-only">
              Votre message
            </label>
            <textarea
              ref={champRef}
              id="contenu"
              name="contenu"
              rows={1}
              maxLength={LONGUEUR_MAX}
              placeholder="Écrivez votre message…"
              value={texte}
              onChange={(event) => setTexte(event.target.value)}
              className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-input bg-card px-3 py-2.5 text-base text-card-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 md:text-sm"
              onKeyDown={(event) => {
                // Entrée envoie, Maj+Entrée passe à la ligne.
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <SendButton vide={texte.trim().length === 0} />
          </div>
        </div>
      </form>
    </div>
  );
}
