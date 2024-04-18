# Badge DK ![Bêta](https://img.shields.io/badge/B%C3%AAta%20-%20%23d83912?style=flat) ![Release](https://img.shields.io/github/v/release/dk-sustainability/dk-badge?include_prereleases)

Mesure de l'impact de la navigation d'un utilisateur en temps réel, côté client uniquement sans récolte de données externe.

## Fonctionnement

### Calcul

- Le badge effectue le calcul CO2e en prenant en compte l'usage et le cycle de vie des serveurs, réseaux et devices sur la session de l'utilisateur, **données et formules &copy; DK**.
- La proportion de Wifi/4G est moyennée à 50/50 puisqu'il n'y a pas à ce jour de moyen fiable d'avoir cette donnée pour les navigateurs principaux.
- Les données serveur sont également moyennées, mais peuvent être configurées au moment de l'instantiation si cela s'avère pertinent (et que les ressources servies proviennent majoritairement d'une même source).
- La localisation de l'audience est assumée en france, cela peut être configuré au moment de l'instanciation si l'admin possède des données statistiques à ce sujet, il n'y a pas de méthode fiable et performante pour distinguer une audience européenne ou internationale à l'aide du navigateur uniquement.
- Le type de device (mobile, tablette ou desktop) est détecté et utilisé dans le calcul.
- La durée de la session est utilisée dans le calcul, de même que le poids de toutes les ressources chargées au cours de la navigation.


### Expérience utilisateur & technique

- Le calcul s'effectue une première fois 500 ms après que le chargement initial de la page a été détecté.
- Il est ensuite redéclenché toutes les 5 secondes (depuis le dernier appel calcul) et lorsque le performanceObserver détecte de nouvelles ressources chargées (ex : images lazyloadées, ressources ajoutées etc..).
- Le calcul est mis en pause lorsque l'onglet est caché pour éviter de drainer les performances. Cela semble également plus juste pour le calcul.
- La durée de session et le poids des ressources chargées est enregistré en sessionStorage toutes les secondes. L'utilisation de l'évènement "visibilitychange" et "pagehide" en callback sera envisagé pour améliorer les performances par la suite.
- Certaines ressources peuvent ne pas être détectées pour des raisons techniques (CORS, absence du header "Timing-Allow-Origin"), il y a donc une marge d'erreur plus ou moins grande selon les config serveurs et l'origine des ressources.
- Aucune donnée n'est envoyée, le calcul s'effectue uniquement sur le navigateur de l'utilisateur.

### Design
- Le badge se décline en 3 styles : "full", "compact" et "footer".
- Le badge est prévu pour fonctionner avec une police par défaut afin d'éviter le chargement d'un fichier de police entier pour une si petite portion de contenu. Il est possible d'adapter à la charte de chaque site via l'usage de variables CSS.
- Les couleurs sont celles de DK, il est également possible d'adapter à la charte de chaque site via l'usage de variables CSS.

## Installation

### Local manuel

#### Téléchargement depuis github

```bash
git clone https://github.com/dk-sustainability/dk-badge.git
```
OU

[Téléchargez le zip du répertoire](https://github.com/dk-sustainability/dk-badge/archive/refs/heads/main.zip).

#### Installation

Récupérez le fichier script `/dist/js/dk-badge.min.js` ou `/dist/js/dk-badge.js`.

Récupérez le fichier qui correspond au style que vous souhaitez (full, compact ou footer) `/dist/css/dk-badge-[STYLE].css` (ou `/dist/css/dk-badge-all.css` qui les contient tous - non recommandé)

Dans votre html, ajoutez :

```html
<!-- Ajoutez les fichiers séparément comme ci-dessous ou intégrez-les dans vos bundles -->
<script src="[LIEN-VERS-LE-JS]" defer></script>
<link rel="stylesheet" href="[LIEN-VERS-LE-CSS]">

<!-- Instanciation du composant (après DOMContentLoaded) -->
<script defer>
  document.addEventListener('DOMContentLoaded', () => {
    const dkBadge = new DKBadge();
    dkBadge.init();
  });
</script>

<!-- Pour le style "footer" : placez-le le juste avant le body ou à la fin de votre balise footer -->
<!-- Pour les autres styles : le badge n'est pas fixe sur petit écrans, placez-le où vous souhaitez le voir dans le flux du contenu mobile -->
<div data-dk-badge></div>
```

Diverses options sont à votre disposition pour configurer le module, [voir les options](#options)

### NPM

Ce répertoire n'est pas encore conçu pour être importable directement dans un bundle js, vous pouvez cependant adapter les étapes présentées dans [Local manuel](#local-manuel) ci-dessus pour télécharger les fichiers via npm.

```bash
npm i @d-k/dk-badge
```

Les fichiers css et js à intégrer seront disponibles dans le répertoire `node_modules/@d-k/dk-badge/dist/`. Les étapes d'installation sont les mêmes que [Local manuel](#local-manuel).

### CDN

Tous les fichiers sont accessibles à l'aide du CDN [unpkg](https://unpkg.com/), vous pouvez simplement ajouter les éléments ci-dessous dans votre html :

```html
<script src="https://unpkg.com/@d-k/dk-badge@latest/dist/js/dk-badge.min.js" defer></script>
<!-- Récupérez le fichier qui correspond au style que vous souhaitez (full, compact ou footer) `https://unpkg.com/@d-k/dk-badge@latest/dist/css/dk-badge-[STYLE].css` (ou `https://unpkg.com/@d-k/dk-badge@latest/dist/css/dk-badge-all.css` qui les contient tous - non recommandé) -->
<link rel="stylesheet" href="https://unpkg.com/@d-k/dk-badge@latest/dist/css/dk-badge-all.css">

<!-- Instanciation du composant (après DOMContentLoaded) -->
<script defer>
  document.addEventListener('DOMContentLoaded', () => {
    const dkBadge = new DKBadge();
    dkBadge.init();
  });
</script>

<!-- Pour le style "footer" : placez-le le juste avant le body ou à la fin de votre balise footer -->
<!-- Pour les autres styles : le badge n'est pas fixe sur petit écrans, placez-le où vous souhaitez le voir dans le flux du contenu mobile -->
<div data-dk-badge></div>
```

Diverses options sont à votre disposition pour configurer le module, [voir les options](#options)



## Options

### js

Les options sont ajoutées au moment de l'instanciation, voici un exemple avec toutes les options renseignées :

```js
const dkBadge = new DKBadge({
  // Les labels sont par défaut en anglais
  labels: {
    "intro": "Votre navigation sur ce site a émis environ ",
    "details": "Détails",
    "weight": "Poids",
    "time": "Tps. passé",
    "device": "Format",
    "unknown": "inconnu",
    "CO2unit": "g CO2e",
    "weightUnit": "Ko",
    "timeUnit": "sec.",
    "privacy": "aucune donnée n'est collectée",
    "emitted": "émis",
    "close": "Ne plus afficher le badge"
  },
  // LE PUE moyen de vos serveurs si vous le connaissez 
  // et que les ressources proviennent en grande majorité du même endroit.
  pue: 1.69,
  // Si vous avez des statistiques de localisation d'audience
  // Toutes les valeurs sont obligatoires
  audienceLocationProportion: {
    "france": 0.5,
    "europe": 0.5,
    "international": 0
  },
  // Si vous connaissez la localisation de vos serveurs
  // Toutes les valeurs sont obligatoires
  serverLocationProportion: {
    "france": 0.5,
    "international": 0.5
  },
  // Style du badge ("compact", "full" ou "footer")
  style: "full"
  // Si vous souhaitez utiliser le résultat du calcul uniquement
  // Attention, une attribution avec lien vers cette page reste obligatoire.
  renderUI: true,
  // Permet d'afficher un bouton de fermeture
  // Le badge sera supprimé de la page et le process de calcul arrêté
  // Le choix de l'utilisateur est sauvegardé en localStorage
  // Si vous souhaitez permettre à l'utilisateur de relancer le badge,
  // vous pouvez supprimer l'entrée "dk-badge" du local storage
  // et recharger la page (voir l'exemple sur la page demo/index.html)
  removable: true
});

```

### css

Exemple pour une interface ayant un thème sombre :

``` html
<div data-dk-badge style="
  --dkb-font-family: inherit;
  --dkb-root-font-size: 1rem;
  --dkb-color-primary: #00BC62;
  --dkb-color-text: #CDCCD9;
  --dkb-color-text-light: #7973a8;
  --dkb-color-text-strong: #fff;
  --dkb-color-contrast: #060035;
  --dkb-color-secondary: #0064fa;
"></div>
```

Définissez `--dkb-root-font-size` à 1.6rem si votre html/root font-size correspond à 10px.

## Méthodes

Deux méthodes sont utilisables :

- `.init()` &ndash; lancement du module, à lancer après le chargement du DOM et du js
- `.calculate(3000, 20, "Mobile")` &ndash; pour effectuer un test de calcul indépendant. Paramètres :
  - `{number} size - The weight of the page`
  - `{number} time - The time spent on the page`
  - `{('Desktop'|'Tablet'|'Mobile')} deviceType`

## Events

Trois évènements sont émis par le module sur le document :

- `dkBadge:calculated` lorsque qu'un nouveau calcul est terminé
- `dkBadge:updated` lorsque l'UI est mise à jour
- `dkBadge:removed` lorsque le badge est retiré de l'interface par l'utilisateur

### Exemple d'utilisation

```js
document.addEventListener('dkBadge:calculated', (data) => {
  // Log toutes les infos du module
  console.log('dkBadge:calculated', data.detail);

  // Log uniquement le total équivalent CO2e
  console.log('dkBadge:calculated', data.detail.ges);
});
```


## TODO améliorations
- [ ] utiliser une combinaison de l'event pagehide & visibilityhidden pour enregistrer les valeurs dans le sessionstorage afin d'optimiser les performances.
- [ ] Petit loader à la place du texte "inconnu"
- [x] créer un package npm
- [ ] évaluer la pertinence d'utiliser un web component (au vu de la variété et de la complexité de certaines options)
- [ ] créer une landing page
- [ ] Créer une app cloudflare ?
- [ ] Créer un plugin wordpress ?
- [ ] Créer une extension navigateur ?
- [ ] mesure de l'impact performance de l'ajout du module et le documenter
- [ ] permettre le déplacement du badge si cela n'alourdit pas trop le code

## Licences

Données & formules : Tous droits réservés &copy; DK

Code : [Mozilla Public License (MPL) 2.0](https://choosealicense.com/licenses/mpl-2.0/#)