# Idées post-MVP

Pistes évoquées mais **hors du périmètre du MVP**. Rien de tout cela n'est
implémenté ni planifié : ce fichier existe pour que les idées ne se perdent
pas, pas pour engager le développement.

Le périmètre du MVP reste fixé par `SmarCi_Plan_Complet_MVP_1.md`.

---

## Palette personnalisable selon le palier d'abonnement

Chaque niveau d'abonnement donnerait accès à un degré de personnalisation :
les paliers modestes basculeraient sur une palette prédéfinie, les paliers
supérieurs permettraient de la choisir.

Implications si cela devait se faire :

- le socle est déjà compatible — l'interface ne connaît que des jetons
  sémantiques (`--primary`, `--card`, `--app-gradient`…), jamais de couleur
  codée en dur. Changer de palette revient à changer un jeu de jetons ;
- il faudrait stocker le choix sur le profil et le rendre côté serveur, sinon
  la page clignoterait au chargement ;
- toute palette proposée devra passer les seuils de contraste WCAG AA, sous
  peine de rendre l'application illisible pour certains utilisateurs.

**Dépend de** : le système d'abonnement, lui-même hors scope MVP (§2, §5.3).
