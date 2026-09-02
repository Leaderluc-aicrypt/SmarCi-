import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Toujours évalué à la requête : jamais de réponse mise en cache. */
export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "error" | "missing";

type HealthReport = {
  status: "ok" | "degraded";
  timestamp: string;
  checks: {
    /** Présence des variables d'environnement, sans jamais exposer de valeur. */
    environment: {
      status: CheckStatus;
      missing: string[];
    };
    /** Connexion réelle à Supabase et lisibilité du schéma. */
    database: {
      status: CheckStatus;
      message?: string;
    };
  };
};

/**
 * Sonde de santé du socle technique.
 *
 * Sert de critère de validation de la Phase 1 : si cette route répond `ok`,
 * l'application est déployée, configurée, et parle bien à la base.
 *
 * Ne renvoie que des booléens et des noms de variables — jamais une valeur de
 * secret.
 */
export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  const report: HealthReport = {
    status: "ok",
    timestamp: new Date().toISOString(),
    checks: {
      environment: {
        status: missing.length === 0 ? "ok" : "missing",
        missing,
      },
      database: { status: "missing" },
    },
  };

  if (missing.length === 0) {
    try {
      const supabase = await createClient();

      // Requête volontairement vide : elle prouve que la table existe et que
      // PostgREST répond, sans lire la moindre donnée utilisateur.
      const { error } = await supabase
        .from("profiles")
        .select("id", { head: true, count: "exact" });

      if (error) {
        report.checks.database = { status: "error", message: error.message };
      } else {
        report.checks.database = { status: "ok" };
      }
    } catch (error) {
      report.checks.database = {
        status: "error",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  const healthy =
    report.checks.environment.status === "ok" &&
    report.checks.database.status === "ok";

  report.status = healthy ? "ok" : "degraded";

  return NextResponse.json(report, { status: healthy ? 200 : 503 });
}
