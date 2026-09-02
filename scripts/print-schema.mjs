/**
 * Concatène toutes les migrations dans l'ordre et les écrit sur la sortie
 * standard, prêtes à coller dans le SQL Editor de Supabase.
 *
 *   npm run db:print                 # affiche
 *   npm run db:print > schema.sql    # enregistre
 *
 * Il n'existe volontairement pas de copie versionnée du schéma consolidé :
 * les fichiers de `supabase/migrations/` sont l'unique source de vérité.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATIONS = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "migrations",
);

const files = readdirSync(MIGRATIONS)
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("Aucune migration trouvée dans supabase/migrations/");
  process.exit(1);
}

const parts = files.map(
  (name) =>
    `-- >>> ${name} ${"-".repeat(Math.max(0, 68 - name.length))}\n\n` +
    readFileSync(join(MIGRATIONS, name), "utf8").trimEnd(),
);

process.stdout.write(parts.join("\n\n") + "\n");
