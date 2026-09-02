# Vérifier les migrations en local

Les migrations sont écrites pour Supabase, mais elles se valident sur un
PostgreSQL ordinaire — sans toucher au projet de production. C'est ce que fait
la CI (`.github/workflows/ci.yml`, job `database`), et c'est reproductible à la
main.

## Prérequis

PostgreSQL 16 avec l'extension `pgvector`. Le plus simple est Docker :

```bash
docker run --rm -d --name smarci-pg \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  pgvector/pgvector:pg16

export PGURL="postgres://postgres:postgres@localhost:5432/postgres"
```

## Procédure

```bash
# 1. Reproduire le minimum de l'environnement Supabase
#    (schémas extensions/auth, rôles anon/authenticated/service_role,
#     table auth.users, fonction auth.uid()).
psql "$PGURL" -v ON_ERROR_STOP=1 -f supabase/tests/_supabase-shim.sql

# 2. Appliquer les migrations
psql "$PGURL" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_init.sql

# 3. Vérifier qu'elles sont rejouables sans erreur
psql "$PGURL" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_init.sql

# 4. Vérifier l'isolation RLS
psql "$PGURL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
```

L'étape 4 est la plus importante. Elle crée deux utilisateurs de test et
vérifie que :

- le trigger `handle_new_user` crée bien un profil à l'inscription ;
- chaque utilisateur ne voit que ses conversations, messages et calculs ;
- un utilisateur ne peut ni écrire dans la conversation d'un autre, ni créer
  une conversation au nom d'un autre ;
- le guide est lisible sans compte, mais non modifiable.

Le script s'exécute dans une transaction annulée à la fin : il ne laisse aucune
donnée derrière lui. Toute violation lève une erreur explicite préfixée
`FUITE :`.

## Nettoyage

```bash
docker rm -f smarci-pg
```

## Ce que cette vérification ne couvre pas

Le shim n'est pas Supabase. Il ne reproduit ni GoTrue, ni PostgREST, ni la
génération réelle des JWT. Le comportement de bout en bout — inscription,
session, requêtes depuis l'application — ne sera confirmé qu'au **checkpoint 2**,
à la fin de la Phase 2, avec un vrai compte créé sur le projet Supabase.
