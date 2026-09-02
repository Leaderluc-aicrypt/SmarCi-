"use client";

import { SendHorizontal } from "lucide-react";
import { useFormStatus } from "react-dom";

/**
 * Bouton d'envoi.
 *
 * Composant séparé : `useFormStatus` ne lit l'état que du formulaire parent,
 * il doit donc être appelé sous le `<form>`, pas au même niveau.
 */
export function SendButton({ vide }: { vide: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || vide}
      aria-label="Envoyer le message"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <SendHorizontal size={18} aria-hidden />
    </button>
  );
}
