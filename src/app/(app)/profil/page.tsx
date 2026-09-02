import type { Metadata } from "next";

import { FormMessage } from "@/components/auth/form-feedback";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/auth/session";
import type { ExperienceLevel } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profil" };

const NIVEAUX: Record<ExperienceLevel, string> = {
  aspirant: "Aspirant",
  debutant: "Débutant",
  amateur: "Amateur",
  professionnel: "Professionnel",
};

export default async function ProfilPage() {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, experience_level, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
          Profil
        </h1>
        <p className="text-sm text-muted-foreground">
          Les informations rattachées à votre compte.
        </p>
      </div>

      {profile ? (
        <dl className="divide-y divide-border rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">Nom</dt>
            <dd className="text-sm text-card-foreground">
              {profile.full_name ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">E-mail</dt>
            <dd className="text-sm text-card-foreground">
              {profile.email ?? user.email}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">Niveau</dt>
            <dd className="text-sm text-card-foreground">
              {NIVEAUX[profile.experience_level]}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">Compte créé le</dt>
            <dd className="text-sm text-card-foreground">
              {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      ) : (
        // Le compte existe côté auth mais la ligne `profiles` est absente :
        // en pratique, la migration n'a pas été appliquée sur ce projet.
        <FormMessage
          tone="error"
          message="Votre profil est introuvable en base. Vérifiez que la migration supabase/migrations/0001_init.sql a bien été exécutée sur ce projet."
        />
      )}

      <SignOutButton />
    </main>
  );
}
