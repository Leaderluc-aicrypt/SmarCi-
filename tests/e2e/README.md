# Vérifications navigateur

Ces scripts pilotent un vrai navigateur sur l'application, pour ce que ni le
typage ni les tests unitaires ne peuvent attraper : une action serveur mal
câblée, un champ vidé au mauvais moment, une redirection qui ne part pas.

Ils ont trouvé deux défauts réels pendant la Phase 3 — voir
`docs/verification-interface.md`.

**Ils ne tournent pas en CI** : ils demandent Playwright et un navigateur, que
l'environnement de build ne fournit pas. Ce sont des outils de développement, à
lancer à la main.

## `faux-supabase.mjs`

Un faux Supabase : juste assez de GoTrue et de PostgREST pour que l'application
tourne sans projet distant. Il tient les données en mémoire et disparaît avec le
processus.

> **Ce n'est pas un substitut à Supabase.** Il ne connaît ni la RLS, ni les
> jetons réels, ni le comportement exact de PostgREST. Il sert à exercer
> l'interface, pas à valider la sécurité — celle-ci se vérifie avec
> `supabase/tests/rls.sql`.

## Lancer

La procédure complète est dans
[`../../docs/verification-interface.md`](../../docs/verification-interface.md).
