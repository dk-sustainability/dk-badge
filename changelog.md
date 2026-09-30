# Changelog

Les changements notables de ce projet sont documentés dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet suit la [gestion sémantique de version](https://semver.org/lang/fr/).

## [Unreleased]

Version prévue : `0.2.0`.

### Ajouté

- Localisation intégrée en français et en anglais avec l'option de construction `locale`.
- Détection automatique de la langue du navigateur lorsque l'option `locale` est absente.
- Traduction des libellés, unités et types d'appareils affichés par le badge.
- Repli automatique sur l'anglais lorsqu'une locale n'est pas prise en charge.
- Tests automatisés avec le runner natif de Node.js.
- Tests de parité avec le moteur `website` de `dkalculate-core` pour les appareils mobiles, ordinateurs et tablettes.

### Modifié

- Mise à jour des facteurs carbone depuis le méta-référentiel de `dkalculate-core` au commit `e2323a5`.
- Alignement des unités et des formules de consommation Wi-Fi et 4G avec `dkalculate-core`.
- Mise à jour des impacts de cycle de vie, durées d'utilisation et puissances des appareils.
- Répartition par défaut des serveurs portée à 47,5 % en France et 52,5 % dans le reste du monde.
- Mise à jour des dépendances de développement.
- Limitation du contenu publié sur npm aux fichiers distribués et à leur documentation.
- Mise à jour de la documentation et des exemples d'intégration.

### Corrigé

- L'initialisation en mode `renderUI: false` fonctionne désormais sans conteneur dans le DOM.
- L'initialisation sans conteneur devient sans effet lorsque le rendu de l'interface est demandé.
- La suppression du badge annule son initialisation différée et empêche le calcul de redémarrer après un changement de visibilité de la page.
- Plusieurs appels successifs à `init()` ne créent plus plusieurs temporisations ou écouteurs d'événements.
- Correction du balisage de la page de démonstration.

## [0.1.5-beta] - 2024-04-18

### Ajouté

- Option `removable` permettant à l'utilisateur de masquer durablement le badge.

## [0.1.4-beta] - 2024-03-08

### Ajouté

- Taille de police racine configurable avec la variable CSS `--dkb-root-font-size`.

### Modifié

- Mise à jour des fichiers distribués.

## [0.1.3-beta] - 2024-03-08

### Modifié

- Renforcement de l'isolation des styles pour faciliter l'intégration du badge dans des sites existants.
- Mise à jour de la documentation et du lien d'attribution DK.

## [0.1.2-beta] - 2024-03-05

### Modifié

- Mise à jour de la documentation.

## [0.1.1-beta] - 2024-03-01

### Ajouté

- Documentation d'installation via npm et CDN.
- Styles de focus visibles pour améliorer l'accessibilité.

### Corrigé

- Correction de la détection des tablettes.

## [0.1.0-beta] - 2024-02-16

- Première version bêta du badge.

[Unreleased]: https://github.com/dk-sustainability/dk-badge/compare/V.0.1.5-beta...HEAD
[0.1.5-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.5-beta
[0.1.4-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.4-beta
[0.1.3-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.3-beta
[0.1.2-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.2-beta
[0.1.1-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.1-beta
[0.1.0-beta]: https://github.com/dk-sustainability/dk-badge/releases/tag/V.0.1.0-beta
