"use client";

import { useActionState } from "react";

import { FieldError, FormMessage } from "@/components/auth/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/form-state";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialAuthFormState,
  );

  // Inscription enregistrée : il ne reste qu'à confirmer par e-mail.
  if (state.status === "confirmation") {
    return <FormMessage message={state.message} tone="info" />;
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage message={state.message} tone="error" />

      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          defaultValue={state.values?.fullName}
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          aria-describedby="fullName-error"
        />
        <span id="fullName-error">
          <FieldError errors={state.fieldErrors?.fullName} />
        </span>
      </div>

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
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-error password-hint"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          8 caractères minimum, dont au moins une lettre et un chiffre.
        </p>
        <span id="password-error">
          <FieldError errors={state.fieldErrors?.password} />
        </span>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Création du compte…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
