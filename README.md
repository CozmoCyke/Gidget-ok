# Gidget OK — Robot Build

Version robots de Gidget, stabilisée et adaptée localement à partir de la base originale.

## Objectif

Cette branche `ok` transforme l’univers original de Gidget en une version orientée **robots**, **rocks** et objets de niveau, tout en conservant le cœur pédagogique de l’application :
- exécution du programme dans l’interface,
- aide contextuelle,
- suggestions IdeaGarden,
- référence locale RefGuide.

L’objectif est de disposer d’une base locale **fonctionnelle**, **stable** et **versionnable**, avant d’aller plus loin dans les adaptations pédagogiques et visuelles.

---

## État actuel

La version `ok` est actuellement **fonctionnelle** et a déjà reçu plusieurs correctifs et restaurations ciblées.

### Fonctionnel
- `AllSteps` fonctionne correctement
- l’interface principale est stable
- les scripts IdeaGarden sont chargés
- les scripts RefGuide sont chargés
- des fallbacks locaux permettent d’utiliser l’aide sans backend PHP
- les textes d’aide ont été adaptés à la version robots
- les bulles locales ont reçu un léger polish visuel

### En mode local / dégradé volontaire
- pas de backend `reference.php`
- pas de dictionnaire riche côté serveur
- pas de dépendance obligatoire à `qtip`, `chosen` ou `draggable`
- les fallbacks locaux remplacent les versions riches absentes

---

## Historique des correctifs

### Correctif AllSteps
Le comportement de `AllSteps` paraissait bloqué ou trop proche du pas-à-pas.

Cause identifiée :
- la cadence locale était réglée trop lentement dans `ok/ui.js`

Correctif retenu :
- restauration de la cadence fonctionnelle :
  - `stepSpeedInMilliseconds: 10`

Résultat :
- l’exécution continue retrouve le comportement attendu

---

## Patches appliqués

### Patch 1 — Compatibilité de chargement
Ajout des modules manquants dans `index.html` :
- `lib/ideagarden/ideagarden-suggestion.js`
- `lib/ideagarden/ideagarden.js`
- `lib/refguide/refguide.js`

Ajout de petits shims et gardes défensifs pour éviter les crashes quand certaines dépendances UI ne sont pas présentes.

### Patch 2 — Assets locaux et fallbacks
Restauration locale de plusieurs éléments statiques :
- fragments HTML IdeaGarden
- base locale minimale RefGuide via `object-help.js`
- styles CSS minimaux pour les bulles locales

Objectif :
- permettre l’usage local de l’aide sans backend PHP ni plugins riches

### Patch 3 — Adaptation robots du contenu d’aide
Réécriture des textes RefGuide et IdeaGarden pour qu’ils correspondent mieux à l’univers robots :
- robot
- rock
- goop
- bucket
- button
- crack
- rat
- actions comme `scan`, `goto`, `grab`, `drop`, `analyze`, `ask`

### Patch 4 — Polish UI léger
Amélioration discrète des bulles locales :
- meilleure lisibilité
- espacement plus propre
- style sobre
- meilleure gestion des longues lignes

### Patch 5 — Enrichissement pédagogique
Amélioration du ton pédagogique des aides :
- formulations plus concrètes
- aides plus utiles pour un débutant
- contenu plus orienté action et compréhension

---

## Structure utile

### Aide et suggestions
- `lib/ideagarden/`
  - logique locale IdeaGarden
  - fragments HTML de suggestion
- `lib/refguide/`
  - référence locale
  - `object-help.js`
  - `refguide.js`

### Interface
- `index.html`
- `style.css`
- `ui.js`

---

## Dépendances absentes volontairement
Cette version ne réintroduit pas automatiquement :
- `reference.php`
- `qtip`
- `chosen`
- `jQuery UI draggable`

Pourquoi :
- garder `ok` léger
- éviter les dépendances inutiles
- privilégier un fonctionnement local stable

---

## Lancer l’application

Ouvrir l’application depuis le dossier `ok` via un serveur local simple ou selon le mode de lancement déjà utilisé dans le projet.

Exemples possibles selon ton environnement :
- ouverture locale dans le navigateur
- serveur HTTP local
- intégration dans ton flux de dev habituel

> Conseil : éviter les changements structurels tant qu’une nouvelle étape n’a pas été commitée proprement.

---

## Philosophie de cette branche

Cette version privilégie :
- les **micro-patches**
- la **stabilité**
- la **réversibilité**
- les **fallbacks locaux**
- l’**adaptation pédagogique progressive**

Elle ne cherche pas à refaire toute l’architecture originale, mais à construire une base robots propre, cohérente et exploitable.

---

## Ce qui reste possible ensuite

Pistes d’évolution futures :
- enrichir encore les aides robots
- adapter davantage les contenus au gameplay réel de cette branche
- améliorer certains textes RefGuide
- affiner le style des bulles locales
- documenter plus finement les objets, actions et niveaux
- ajouter une documentation enseignant / élève

---

## Statut

**Branche stable de travail** pour la version robots `ok`.

Recommandation :
- taguer les versions stables
- travailler les nouvelles évolutions sur des branches dédiées
- merger seulement après validation manuelle

---

## Notes de version suggérées

Exemples de jalons déjà cohérents :
- `v0.1-stable-ok`
- `v0.2-robot-help`
- `v0.3-ui-polish`
- `v0.4-pedagogical-help`

---

## Auteur

Travail de restauration, adaptation et stabilisation autour de la branche robots `ok`.