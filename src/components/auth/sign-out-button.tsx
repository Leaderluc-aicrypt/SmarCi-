"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  // `signOut` redirige toujours : l'état n'est jamais lu, seul `pending` sert.
  const [, formAction, pending] = useActionState(async () => {
    await signOut();
  }, undefined);

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Déconnexion…" : "Se déconnecter"}
      </Button>
    </form>
  );
}
