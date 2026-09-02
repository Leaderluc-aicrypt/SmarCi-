"use client";

import { useActionState } from "react";

import { FieldError, FormMessage } from "@/components/auth/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/form-state";

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    signIn,
    initialAuthFormState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {/* Destination après connexion, assainie côté serveur. */}
      <input type="hidden" name="next" value={next} />

      <FormMessage message={state.message} tone="error" />

      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby="email-error"
        />
        <span id="email-error">
          <FieldError errors={state.fieldErrors?.email} />
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-error"
        />
        <span id="password-error">
          <FieldError errors={state.fieldErrors?.password} />
        </span>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
