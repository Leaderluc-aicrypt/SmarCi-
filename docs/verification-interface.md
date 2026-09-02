# Vérifier l'interface dans un navigateur

Le typage, le lint et les tests unitaires ne voient pas tout. Trois défauts de
la Phase 3 ne sont apparus qu'en faisant tourner l'application :

- un fichier `"use server"` exportait une constante — build vert, erreur 500 à
  la première soumission ;
- le champ de saisie était vidé par React à la fin de l'action précédente, ce
  qui effaçait ce que l'utilisateur tapait pendant l'envoi ;
- vidé depuis l'action, ce même champ gardait le texte envoyé un instant de
  trop, visible à l'œil.

D'où ces scripts. Ils demandent Playwright, absent des dépendances du projet
pour ne pas alourdir l'installation et la CI.

## Préparer

```bash
npm install --no-save playwright
npx playwright install chromium   # inutile si un Chromium est déjà fourni
```

## Lancer

Trois terminaux, ou trois commandes en arrière-plan.

```bash
# 1. Le faux Supabase (données en mémoire, port 54321)
node tests/e2e/faux-supabase.mjs

# 2. L'application, pointée dessus
npm run build
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="cle-anonyme-factice" \
npm run start
```

Il faut ensuite un cookie de session. Le nom du cookie dérive de l'hôte de
l'URL Supabase : avec `127.0.0.1`, c'est `sb-127-auth-token`.

```bash
node -e '
const session = {
  access_token: "jeton-factice",
  refresh_token: "rafraichissement-factice",
  expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
  expires_in: 86400 * 30,
  token_type: "bearer",
  user: {
    id: "11111111-1111-1111-1111-111111111111",
    email: "awa@exemple.test",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { full_name: "Awa Diallo" },
    created_at: "2026-09-01T10:00:00Z",
  },
};
require("fs").writeFileSync("/tmp/smarci-cookie.txt",
  "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"));
'
```

Puis :

```bash
# 3. Les vérifications
node tests/e2e/conversation.mjs /tmp /tmp/smarci-cookie.txt
```

Les captures sont écrites dans le dossier passé en premier argument.

## Le chemin d'échec

Pour vérifier qu'un message refusé par la base est bien rendu à l'utilisateur,
relancer le faux serveur avec `ECHEC=1` — les insertions de messages
répondront alors 500 :

```bash
ECHEC=1 node tests/e2e/faux-supabase.mjs
node tests/e2e/conversation-echec.mjs /tmp /tmp/smarci-cookie.txt
```

## Ce que cela ne couvre pas

Le faux serveur n'est pas Supabase : ni RLS, ni jetons réels, ni comportement
exact de PostgREST. La sécurité se vérifie avec `supabase/tests/rls.sql`, et le
parcours complet — inscription, session, requêtes réelles — au checkpoint 2, sur
le vrai projet.
