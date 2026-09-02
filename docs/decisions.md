# Décisions

Journal des arbitrages qui s'écartent du plan MVP ou le précisent. Chaque
entrée dit ce qui a été décidé, et pourquoi.

---

## 2026-09 — Next.js 16 plutôt que 14

**Plan MVP §3.2** : Next.js 14.

Next.js 14 n'est plus maintenu. Le projet est bâti sur la dernière ligne
stable. L'architecture décrite au §3.2 est inchangée : App Router, API routes,
Tailwind, shadcn/ui.

---

## 2026-09 — Palette claire (« sky ») plutôt que fond sombre

**Plan MVP §6.1** : « Fond sombre (palette : night, paper, gold, teal) ».

La maquette fournie (`docs/maquettes/SmarCi_Maquette_MVP.jsx`) propose une
palette claire — dégradé ciel, navy, or chaud — sans teal. Les deux versions
ont été construites et comparées sur capture ; l'arbitrage a retenu la
maquette.

Le §6.1 du document de référence est donc caduc sur ce point. La palette
sombre a été retirée du code.

Deux ajustements par rapport à la maquette :

- les libellés de navigation inactifs passent de `#6E93B8` à `#4E7093`, soit de
  3,22:1 à 5,17:1 sur blanc — le seuil WCAG AA pour du petit texte est 4,5:1 ;
- le badge « Essai · 7j restants » est retiré : l'abonnement est explicitement
  hors scope (§2 et §5.3).

---

## 2026-09 — « Se connecter » rattaché à Profil

Les écrans de connexion et d'inscription vivent dans la coquille de
l'application : la navigation basse reste visible et l'entrée « Profil » y
apparaît active. S'authentifier est une étape du parcours Profil, pas une
sortie de l'application.

Le bouton central « Discuter avec SmarCi » ouvre par une courte animation, puis
conduit :

- vers `/inscription` sans session — la création de compte précède l'usage ;
- vers `/conversation` avec une session.

L'animation est neutralisée si le système signale `prefers-reduced-motion`.
