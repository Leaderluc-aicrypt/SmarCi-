# SmarCi

Copilote IA spécialisé dans l'importation pour la zone FCFA.

> **État : Phase 3 terminée — interface.**
> Inscription, connexion, accueil, navigation et fil de conversation sont en
> place. Le copilote ne répond pas encore : l'IA arrive en Phase 4, le moteur de
> calcul en Phase 5.

Le périmètre et les décisions produit sont fixés par le plan MVP
(`SmarCi_Plan_Complet_MVP_1.md`, document de référence).

---

## Stack

| Composant   | Choix                                    |
| ----------- | ---------------------------------------- |
| Frontend    | Next.js 16 (App Router) · React 19       |
| UI          | Tailwind CSS v4 · shadcn/ui              |
| Backend     | Route Handlers Next.js                   |
| DB + Auth   | Supabase (PostgreSQL + pgvector)         |
| IA          | API OpenAI *(à partir de la Phase 4)*    |
| Hébergement | Vercel                                   |

**Écarts assumés au document de référence** : Next.js 16 au lieu de 14
(version non maintenue), et palette claire au lieu du fond sombre du §6.1.
Ces arbitrages et leurs raisons sont consignés dans
[`docs/decisions.md`](docs/decisions.md).

---

## Démarrer en local

```bash
git clone https://github.com/Leaderluc-aicrypt/SmarCi-.git
cd SmarCi-
npm install

cp .env.example .env.local   # puis renseigner les valeurs
npm run dev
```

L'application écoute sur http://localhost:3000.

### Variables d'environnement

Toutes sont documentées dans `.env.example`.

| Variable                        | Requise en Phase 1 | Exposée au navigateur |
| ------------------------------- | ------------------ | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | oui                | oui                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui                | oui                   |
| `NEXT_PUBLIC_SITE_URL`          | non (recommandée)  | oui                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | non                | **jamais**            |
| `OPENAI_API_KEY`                | non (Phase 4)      | **jamais**            |

`SUPABASE_SERVICE_ROLE_KEY` **contourne toute la RLS**. Elle ne doit jamais être
commitée, ni collée dans une conversation, un ticket ou une capture d'écran. Si
cela arrive, régénérez-la immédiatement depuis le dashboard Supabase.

La validation des variables est *paresseuse* (`src/lib/env.ts`) : le build
réussit sans elles, mais la première requête échoue avec un message explicite.
Sur Vercel, elles doivent être présentes **au moment du build** — les valeurs
`NEXT_PUBLIC_*` sont inlinées dans le bundle client.

---

## Base de données

Le schéma est décrit dans `supabase/migrations/`. Six tables, RLS active
partout, chaque utilisateur cloisonné sur ses propres données.

### Appliquer les migrations

Supabase Dashboard → **SQL Editor** → coller le contenu de
`supabase/migrations/0001_init.sql` → **Run**.

Le script est idempotent : le rejouer ne casse rien.

Quand il y aura plusieurs migrations, `npm run db:print` les concatène dans
l'ordre en un seul bloc à coller.

### Vérifier

Les migrations et l'isolation RLS sont testées à chaque push par la CI, sur un
PostgreSQL jetable. Pour reproduire en local :
voir [`docs/verification-locale.md`](docs/verification-locale.md).

L'interface, elle, se vérifie dans un vrai navigateur — voir
[`docs/verification-interface.md`](docs/verification-interface.md). Ces
contrôles ne tournent pas en CI : ils demandent Playwright et un navigateur.

---

## Authentification

Le code est prêt, mais le projet Supabase doit être réglé : Site URL, Redirect
URLs et politique de confirmation par e-mail. La procédure complète est dans
[`docs/configuration-supabase.md`](docs/configuration-supabase.md).

| Route | Accès |
| ------------------ | ------------------------------------------------- |
| `/` | Public |
| `/inscription` | Public — redirige vers `/profil` si déjà connecté |
| `/connexion` | Public — redirige vers `/profil` si déjà connecté |
| `/auth/confirm` | Public — cible des liens de confirmation |
| `/conversation` | **Connecté** |
| `/profil` | **Connecté** |

Connexion et inscription vivent dans la coquille de l'application : la
navigation basse reste visible et l'entrée « Profil » y apparaît active.
S'authentifier est une étape du parcours Profil, pas une sortie de
l'application.

La protection est posée à deux endroits, volontairement. Le proxy
(`src/proxy.ts`) redirige tôt pour éviter d'afficher une page vide ; c'est une
mesure de confort, que la documentation Next.js décrit comme optimiste. La
vérification qui fait autorité est `requireUser()` dans la page elle-même, qui
valide le jeton auprès de Supabase à chaque rendu.

---

## Déployer sur Vercel

1. **Add New → Project**, sélectionner le dépôt.
2. Framework **Next.js**, Root Directory `./` — le reste est détecté.
3. Déclarer les quatre variables d'environnement (Production **et** Preview).
4. **Deploy**.

---

## Vérifier que le socle tient

Une fois déployé, ouvrir `/api/health` :

```json
{
  "status": "ok",
  "checks": {
    "environment": { "status": "ok", "missing": [] },
    "database": { "status": "ok" }
  }
}
```

- `status: "ok"` (HTTP 200) — le socle est validé.
- `environment.missing` non vide — variables absentes sur Vercel.
- `database.status: "error"` — les migrations n'ont pas été appliquées, ou
  l'URL / la clé anonyme ne correspondent pas au bon projet.

La route ne renvoie que des noms de variables et des statuts, jamais une valeur
de secret.

---

## Scripts

| Commande               | Rôle                                            |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Serveur de développement                        |
| `npm run build`        | Build de production                             |
| `npm run lint`         | ESLint                                          |
| `npm run typecheck`    | TypeScript, sans émission                       |
| `npm test`             | Tests unitaires (`node --test`, sans dépendance) |
| `npm run format`       | Prettier                                        |
| `npm run db:print`     | Concatène les migrations pour le SQL Editor     |
| `npm run icons`        | Régénère les icônes PWA de substitution         |

---

## Structure

```
src/
  app/
    (auth)/                Écrans de connexion et d'inscription
    auth/confirm/route.ts  Cible des liens de confirmation par e-mail
    api/health/route.ts    Sonde de santé (env + base)
    profil/page.tsx        Page protégée
    layout.tsx             Métadonnées, PWA, thème sombre
    manifest.ts            Manifeste PWA (/manifest.webmanifest)
    page.tsx               Accueil provisoire
    globals.css            Palette night/paper/gold/teal + jetons shadcn
  components/
    auth/                  Formulaires et retours d'erreur
    conversation/          Fil de discussion et zone de saisie
    home/                  Hub de l'accueil
    layout/                Navigation basse
    ui/                    Primitives shadcn/ui (écrites à la main)
  lib/
    env.ts                 Validation des variables (zod, paresseuse)
    database.types.ts      Types du schéma
    utils.ts               Helper `cn`
    auth/
      actions.ts           Server Actions : inscription, connexion, déconnexion
      schemas.ts           Validation des formulaires
      messages.ts          Traduction des erreurs Supabase
      redirects.ts         Garde contre les redirections ouvertes
      session.ts           `getUser` / `requireUser`
    conversation/
      actions.ts           Server Action : enregistrement d'un message
      queries.ts           Lecture de la conversation et des messages
      schemas.ts           Validation de la saisie
    supabase/
      client.ts            Client navigateur
      server.ts            Client Server Components / Route Handlers
      proxy.ts             Rafraîchissement de session
  proxy.ts                 Proxy Next.js (ex-middleware)

supabase/
  migrations/              Source de vérité du schéma
  tests/                   Vérification RLS + shim Supabase

tests/                     Tests unitaires
tests/e2e/                 Vérifications navigateur (hors CI)
scripts/                   Génération des icônes, impression du schéma
docs/                      Procédures
```

---

## Points ouverts

- **Icônes PWA** — celles de `public/icons/` sont des substituts générés par
  script (`npm run icons`). À remplacer par le logo définitif, idéalement à
  fond transparent.
- **Composants shadcn/ui** — les fondations sont posées (`components.json`,
  palette, helper `cn`). Les composants seront ajoutés au fur et à mesure via
  `npx shadcn@latest add <composant>`.
