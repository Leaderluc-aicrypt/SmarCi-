# Configurer l'authentification Supabase

Le code de la Phase 2 est en place, mais l'inscription ne fonctionnera pas tant
que le projet Supabase n'est pas réglé. Ces trois points se font dans le
dashboard, **Authentication → URL Configuration**.

## 1. Site URL

L'URL publique de l'application, par exemple :

```
https://smarci.vercel.app
```

C'est la base des liens envoyés par e-mail. En local, `http://localhost:3000`.

## 2. Redirect URLs

Ajouter les destinations autorisées après un clic sur un lien de confirmation.
Supabase refuse toute URL absente de cette liste — c'est ce qui empêche un
en-tête `Host` falsifié de détourner l'e-mail vers un autre domaine :

```
https://smarci.vercel.app/auth/confirm
http://localhost:3000/auth/confirm
```

Si vous utilisez les déploiements de prévisualisation Vercel, ajoutez aussi le
motif correspondant, ou définissez `NEXT_PUBLIC_SITE_URL` pour forcer une URL
unique.

## 3. Confirmation par e-mail

**Authentication → Sign In / Providers → Email → Confirm email.**

| Réglage | Effet | Quand l'utiliser |
| --- | --- | --- |
| **Activé** (défaut) | L'utilisateur reçoit un lien à cliquer ; la session ne s'ouvre qu'après. | Production. |
| **Désactivé** | La session s'ouvre immédiatement après l'inscription. | Tests, tant que l'envoi d'e-mails n'est pas configuré. |

L'application gère les deux cas sans modification :

- session ouverte directement → redirection vers `/profil` ;
- confirmation requise → message invitant à consulter la boîte mail, puis
  `/auth/confirm` échange le jeton contre une session.

> **À savoir sur le serveur SMTP par défaut.** Supabase limite fortement les
> e-mails envoyés depuis son serveur de démonstration (quelques-uns par heure,
> et uniquement vers les adresses de l'équipe du projet). Pour un vrai test avec
> une adresse quelconque, il faut soit désactiver la confirmation, soit
> configurer un SMTP dans **Project Settings → Authentication → SMTP Settings**.

## 4. Politique de mot de passe

L'application impose déjà 8 caractères minimum, avec au moins une lettre et un
chiffre (`src/lib/auth/schemas.ts`). Le minimum réglé côté Supabase doit être
inférieur ou égal à 8, sinon des mots de passe acceptés par le formulaire
seraient refusés par l'API.

## Vérifier

Une fois ces réglages faits, créez un compte, puis dans le dashboard :

1. **Authentication → Users** : le compte apparaît.
2. **Table Editor → profiles** : une ligne existe avec le même identifiant —
   c'est le trigger `handle_new_user` qui l'a créée.
3. Sur `/profil`, le nom et l'e-mail s'affichent.

Si `/profil` affiche « Votre profil est introuvable en base », la migration
`supabase/migrations/0001_init.sql` n'a pas été appliquée sur ce projet.
