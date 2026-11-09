# Structure d'une charte graphique

Synthèse des chartes livrées : Marque A (72 p.), Marque B (40 p.),
Marque C (28 p.), plus le gabarit généré par `indesign/charte.jsx`. Format : **A4 paysage** (297 × 210 mm),
pages simples, fond perdu 3 mm. Variante écran : 1920 × 1080 (Marque C) si le client la veut surtout en présentation.

## Gabarit commun à toutes les pages courantes
- En-tête : « MARQUE / Rubrique » à gauche, « Guide de l'identité visuelle » à droite (navigation, petites capitales espacées).
- Pied : « MARQUE — Charte graphique · Version X · Page N » (numéro automatique).
- Surtitre coloré (rubrique) + titre de page + contenu dans une grille à marges de 18 mm.
- Intercalaire de chapitre : fond couleur principale, grand numéro « 01 » en couleur d'accent, titre,
  filet, phrase d'accroche, symbole en filigrane (8-12 %).

## Chapitres et pages (ordre conseillé)
| Chapitre | Pages | Contenu |
|---|---|---|
| Ouverture | Couverture | logo négatif, « Charte graphique », version, année, ville, « Direction artistique : … » |
| | Sommaire | cliquable (hyperliens) + signets PDF par chapitre, 2-3 colonnes, points de conduite |
| | Avant-propos | pourquoi cette charte, à qui, comment l'utiliser, marque vivante |
| 01 La marque | Qui sommes-nous | présentation, mission, vision |
| | Valeurs | 3-5 cartes numérotées (mot + phrase) |
| | Personnalité et ton (page signature, voir plus bas) | curseurs (Traditionnelle ↔ Moderne…), « est / n'est pas », règles d'écriture (Marque A : tableau « plutôt / plutôt que ») |
| | (option) Pôles, domaines, positionnement | Marque B : 9 métiers ; Marque A : 4 pôles, 6 domaines avec pictos |
| 02 Le logo | Logotype et signification | logo en grand + sens de chaque élément (« Le signe », « Le nom ») |
| | Construction | grille d'unités x, rapports, structure symbole + nom |
| | Versions (formes) | principale, horizontale, verticale, symbole : usage de chacune |
| | Versions couleur | couleur, négatif, blanc sur couleur, noir, mono, blanc sur noir |
| | Zone de protection | cadre pointillé de x autour du logo (x défini : « hauteur du E », « diamètre du point du i »…) |
| | Tailles minimales | mm (print) et px (écran) par forme, logo dessiné à taille réelle avec cote |
| | Logo sur les fonds | sur chaque couleur de la palette + sur photo (zone calme, version blanche) |
| | Interdits | déformer, pivoter, changer les couleurs, ombre, contour, fond chargé (croix rouges) |
| | (option) Symbole seul | favicon 16/32/64, icône d'app, avatar, filigrane |
| 03 Les couleurs | Palette | aplats + HEX, RVB, CMJN, Pantone, rôle (principale, secondaire, accent, neutres) |
| | Nuances et proportions | teintes 100/80/60/40/20 %, barre de proportions (ex. 55/25/15/5 %), contrastes WCAG |
| 04 La typographie | Polices | « Aa » géant, nom, graisses, alphabet, licence ; police bureautique |
| | Hiérarchie | Titre 1 → Légende : police, graisse, corps/interlignage, exemple réel |
| 05 L'univers visuel | Style photo | à privilégier / à éviter, 2-4 images (ChatGPT) |
| | (option) Pictogrammes, motif (pattern) | grille de construction, épaisseur de trait, déclinaisons couleur |
| 06 Les applications | Une page par support | carte de visite, en-tête, enveloppe, signature e-mail, PowerPoint, rapport, réseaux sociaux (posts, profils), site, badge, kakemono, dépliant, affiche, signalétique, véhicule, tenues, goodies |
| | Mises en situation | mockups ChatGPT (2 par page) |
| Fermeture | Dos | logo, « Merci de faire vivre la marque avec soin. », site, contact |

## Pages « signature » : jamais le même schéma d'une charte à l'autre (règle du 07/11)
On garde le tronc commun (couverture, sommaire, marque, valeurs, logo et signification, construction, versions,
palette, applications). Mais six pages reprenaient le même dessin dans toutes nos chartes (Marque A, Marque B, Marque C,
ATLAS, Marque D) et elles finissaient par paraître banales : **Personnalité et ton** (curseurs « équilibre »), **Zone de protection**
(cadre pointillé + cotes), **Tailles minimales** (cotes en mm), **Logo sur les fonds** (rangée de cases), **Interdits**
(grille 3 × 2 et croix rouges), **Nuances et proportions** (grille de teintes + barre).

Le module du skill garde ces pages comme brouillon, mais on ne livre JAMAIS ce brouillon. Pour chaque charte :
1. Chercher l'idée dans le MÉTIER du client ou dans un signe propre à son logo, puis dessiner ces six pages dans un
   module de projet `INDESIGN/modules/charte.jsx` (copie du `charte.jsx` du skill, fonctions `page<Nom><Marque>()` en bas).
2. Vérifier avant de montrer : aucune des six pages ne ressemble à celle d'une charte précédente (regarder les PDF
   des clients précédents dans le dossier `LIVRABLES/00-CHARTE/` de chaque client).
3. Montrer les six pages à l’utilisateur (aperçus) avant de remplacer les livrables : générer sur une COPIE de l'atelier.

Exemple Marque D (services linguistiques), module `un module charte-<client>.jsx propre au client` :
- Ton : un « dictionnaire » de la marque (mot, nature, définition, contraire barré) et une « mémoire de traduction »
  (segments numérotés : version d'origine qu'on évite → version de la marque, « segment validé »). Données :
  `textes.ton_dictionnaire` et `textes.ton_exemples`.
- Zone de protection : logo sur fond sombre, la marge matérialisée par de vrais N de la police du logo
  (« x = N », corps calculé pour que la hauteur des capitales vaille x).
- Tailles minimales : règle graduée en mm, logos posés dessus à taille réelle, loupes × 4 (le PDF du logo placé
  dans un ovale, agrandi et centré sur un détail).
- Logo sur les fonds : une bande continue à fond perdu, du plus clair au plus sombre, avec un « point de bascule »
  où le logo passe en blanc.
- Interdits : présentés comme une relecture en suivi des modifications (faute barrée en gris, bonne pratique
  soulignée dans la couleur de la marque, barre de modification dans la marge), sans croix rouges.
- Couleurs : le dégradé officiel et ses points d'arrêt, le dosage en mosaïque (surfaces proportionnelles),
  les nuances en éventail de nuancier.
Le **roll-up** est dans le même cas (règle du 07/11) : le gabarit `kakemono.jsx` (logo, slogan, photo, bandeau de
contacts) est un brouillon. On le redessine dans `INDESIGN/modules/kakemono.jsx` avec le métier en haut, lisible de loin.
Marque D (`un kakemono-<client>.jsx`) : lexique bilingue des trois métiers (FR en blanc, EN dans le dégradé) ; pour
l'académie, l'échelle des niveaux A1 → C2. Photo calée sur le bas du cadre (sinon les visages sont coupés), et aucune
promesse non confirmée sur un support imprimé (« gratuit », délais, chiffres).
Autres pistes, selon le métier : énergie → compteur ou schéma de câblage ; santé → ordonnance ou carnet ;
finance → relevé ou ticket ; école → cahier, copie corrigée ; transport → plan de ligne. Ne pas réutiliser
les pistes Marque D telles quelles pour un autre client.

## Règles de contenu
- Une page = une idée. Un titre court, 2 à 6 lignes de texte maximum par bloc.
- Chaque règle est montrée (exemple visuel) avant d'être expliquée.
- Les codes couleur sont recopiés depuis `charte.json` (jamais tapés à la main) ; Pantone « à confirmer » tant que
  le nuancier physique n'est pas vu.
- Le sommaire se régénère à chaque génération (numéros justes, liens actifs).
- Crédit en couverture : « Direction artistique : <votre nom> » (sauf autre consigne). Jamais « fondateur ».

## Pour enrichir le gabarit
`indesign/charte.jsx` construit la structure ci-dessus. Pour une page en plus : écrire une fonction dans le même
style (`pageCourante(rubrique, titre, surtitre)` puis les primitives de `lib.jsx`) à la bonne place dans `main()`.
Les chartes très riches (Marque A 72 p.) se sont faites en ajoutant un script par chapitre : rester dans `charte.jsx`
tant qu'il est lisible, sinon découper en `charte-<chapitre>.jsx` concaténés par `indesign.py`.
