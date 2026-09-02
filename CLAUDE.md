@AGENTS.md

# SmarCi

Copilote IA d'importation pour la zone FCFA. Le périmètre est fixé par
`SmarCi_Plan_Complet_MVP_1.md` — ne rien ajouter hors de ce document sans
validation explicite.

## Règles du projet

- **Les calculs ne passent jamais par le LLM.** Le modèle détecte le besoin,
  appelle un outil déterministe, puis explique le résultat.
- **RLS sur toutes les tables.** Toute nouvelle table arrive avec ses policies
  dans la même migration, et une assertion dans `supabase/tests/rls.sql`.
- **Les secrets ne sont jamais préfixés `NEXT_PUBLIC_`.** `SUPABASE_SERVICE_ROLE_KEY`
  contourne la RLS : usage serveur uniquement.
- **`supabase/migrations/` est l'unique source de vérité du schéma.** Pas de
  copie consolidée versionnée ; utiliser `npm run db:print`.
- Next.js 16 : le middleware s'appelle `proxy.ts`, et `cookies()` est asynchrone.

## Avant de pousser

```bash
npm run format:check && npm run lint && npm run typecheck && npm run build
```
