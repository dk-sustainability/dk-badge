# Badge DK

Mesure de l'impact de la navigation d'un utilisateur en temps réel, côté client uniquement sans récolte de données externe.

## Fonctionnement

### Calcul

- Le badge effectue le calcul CO2e en prenant en compte l'usage et le cycle de vie des serveurs, réseaux et devices sur la session de l'utilisateur, **données et formules &copy; Diploïde**.
- La proportion de Wifi/4G est moyennée à 50/50 puisqu'il n'y a pas à ce jour de moyen fiable d'avoir cette donnée pour les navigateurs principaux.
- Les données serveur sont également moyennées, peut-être qu'une configuration sera rendue possible par l'admin du site qui l'installe si cela s'avère pertinent (et que les ressources servies proviennent majoritairement d'une même source).
- La localisation de l'audience est actuellement assumée en france en attendant de trouver une méthode fiable et performante pour distinguer une audience européenne ou internationale.
- Le type de device (mobile, tablette ou desktop) est détecté et utilisé dans le calcul.
- La durée de la session est utilisée dans le calcul, de même que le poids de toutes les ressources chargées au cours de la navigation.


### Expérience utilisateur & technique

- Le calcul s'effectue une première fois 500 ms après que le chargement initial de la page a été détecté.
- Il est ensuite redéclenché toutes les 5 secondes et lorsque le performanceObserver détecte de nouvelles ressources chargées (ex : images lazyloadées, ressources ajoutées etc..).
- Le calcul est mis en pause lorsque l'onglet est caché pour éviter de drainer les performances. Cela semble également plus juste pour le calcul.
- La durée de session et le poids des ressources chargées est enregistré en sessionStorage toutes les secondes. L'utilisation de l'évènement "visibilitychange" (qui se déclenche par exemple quand on change d'onglet) serait plus performant mais nécessite des tests approfondis pour s'assurer du comportement attendu sur une majorité de navigateurs.
- Certaines ressources peuvent ne pas être détectées pour des raisons techniques (CORS, absence du header "Timing-Allow-Origin"), il y a donc une marge d'erreur plus ou moins grande selon les config serveurs et l'origine des ressources.

### Design

- Le badge est prévu pour fonctionner avec une police par défaut afin d'éviter le chargement d'un fichier de police entier pour une si petite portion de contenu. Il est possible d'adapter à la charte de chaque site si besoin.
- Les couleurs sont celles du site DK, il est également possible d'adapter à la charte de chaque site si besoin.

## TODO avant bêta

- [x] mesure enregistrée en session storage
- [ ] observation des navigation events (à tester)
- [x] calcul des lazyload etc..
- [x] incorporer le temps de visite
- [x] utiliser les chiffres DK
- [-] détecter réseau utilisé et utiliser dans le résultat - Pas possible sur assez de navigateurs actuellement, abandonné
- [x] détecter type de device et utiliser dans le résultat
- [x] détecter la localisation de l'audience et utiliser dans le résultat - pas possible avec fiabilité sans appel externe, mais rendu éditable dans la config
- [ ] Documentation installation
- [ ] Documentation méthodo
- [ ] Définir la licence
- [ ] Définir une release workflow
- [x] Rendre éditable les étiquettes pour traduction.
- [ ] Informer que certaines ressources peuvent ne pas être prises en compte dans le calcul pour des raisons techniques (CORS, absence du header "Timing-Allow-Origin").
- [x] rendre éditable le PUE et les valeurs serveur pour les clients ayant des ressources hébergées majoritairement au même endroit ?
- [x] afficher les secondes en temps réel
- [x] update CO2e toutes les 5 secondes (valeur arbitraire)
- [-] ajouter un bouton pour reset le badge ? - abandonné
- [x] Refactoring : transformer le js en une class qui sera instanciée avec des options (langue, couleur, taille du badge...)
- [x] Inclure le template dans le js (le html doit être juste une balise)
- [ ] Refactoring : nettoyage et optimisation
- [x] Design : récupérer les styles nécessaires
- [x] Design : rendre configurable les couleurs pour les clients - voir demo dans dark.html
- [x] info RGPD : aucune donnée collectée
- [ ] mesure de l'impact performance de l'ajout du module et le documenter
- [ ] décliner différentes versions d'affichage, idéalement changement uniquement en important un css différent ?
- [ ] comparer la mesure avec l'app DK
- [x] réécrire le vecteur du bouton à la main & le passer dans le template. cacher juste le 2e trait à l'ouverture.

## Installation

### Script 

### Style 

## Licences

Tous droits réservés &copy; Diploïde
