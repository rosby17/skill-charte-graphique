# Reproduire fidèlement un visuel validé (leçon ATLAS, 19/10/2026)

Cas typique : ChatGPT a dessiné une carte de visite, le client l'a validée, il faut maintenant le PDF
d'impression vectoriel. **Erreur à ne plus faire** : la première version avait été « réinterprétée » (laurier
redessiné à main levée, autre police, autres proportions). Le client : « je veux la même version que celle
validée par le client ». La bonne méthode :

## 1. Mesurer, ne pas estimer
- Trouver les bords exacts de la carte dans l'image (sauts de couleur sur les lignes/colonnes).
- Relever au pixel : couleurs (médiane des aplats), bandes et diagonales (bord gauche du filet rouge à
  plusieurs hauteurs → droite exacte), blocs de texte (boîte englobante de l'encre ligne par ligne :
  x début/fin, haut des capitales, ligne de base), filets, icônes.
- Attention aux hauteurs : mesurer la hauteur des capitales sur une lettre plate (E, H, M), pas sur G/O/S
  qui débordent. Une erreur de 25 au lieu de 28 px a suffi à fausser une ligne entière.

## 2. Décalquer les dessins (feuillages, ornements, icônes)
Ne jamais redessiner un ornement « dans l'esprit » : le décalquer.
- `scripts/vectoriser.py` (ou la logique de `decalque.py` du projet ATLAS pour les cas sur fonds multiples) :
  couverture de la couleur par rapport au fond local (ivoire, rouge, marine…), suréchantillonnage × 4, contour à 50 %.
- Indice robuste pour un or sur fonds variés : vert − bleu (or 76, ivoire 7, rouge −45, marine −56).
- Feuilles ton sur ton (verso) : seuil sur la luminosité du bleu ; reconstituer les feuilles cachées sous les
  textes par « inpainting » (OpenCV) pour qu'elles passent derrière, pas autour des lettres.
- Retirer de la reconstruction ce qu'on redessine par-dessus (pastilles, textes, logos).

## 3. Caler les textes
- Chercher la police la plus proche : planche comparative (original en haut, candidates dessous à la même
  hauteur de capitales), puis tableau « largeur naturelle / largeur cible » pour chaque ligne.
- Choisir la police dont le rapport est le plus proche de 1, puis ajuster :
  `textLength` + `lengthAdjust="spacingAndGlyphs"` (écart < 8 %) pour les textes normaux,
  `lengthAdjust="spacing"` pour les titres très espacés.
- Rendus ATLAS : Playfair Display 600 pour un nom à empattements avec « y » bouclé, Charter gras pour des
  petites capitales espacées, Times pour des coordonnées « façon ChatGPT ».
- Graisse un peu trop fine : doubler le texte décalé de 0,3-0,5 px (jamais un contour : il transforme la police en Type 3).

## 4. Format
Un aperçu ChatGPT n'est presque jamais au format de la carte (1,69 au lieu de 1,545 pour 85 × 55).
- Recto : caler la largeur, écarter légèrement les positions verticales (lettres non déformées) ; la bande et
  l'ornement s'étirent avec pour rester calés.
- Verso à fond uni : caler la largeur et rogner un peu en haut et en bas.
Dire au client ce qui a été ajusté et pourquoi (format, petit défaut de l'image corrigé, logos officiels).

## 5. Prouver
- Rendre le PDF en PNG, le ramener aux dimensions de l'original et faire : côte à côte, fondu 50 %, différence.
- Tout ce qui « dédouble » dans le fondu est à corriger (sauf les petites différences de dessin des lettres).
- Joindre les planches de contrôle au dossier (`source/controle-*-original-vs-impression.png`).

## 6. Sortie
HTML/SVG → PDF par Chrome (`--print-to-pdf`, `@page` à 91 × 61 mm avec fond perdu), version avec traits de
coupe, polices statiques intégrées (vérifier `pdffonts` : CID TrueType, jamais Type 3), aperçus PNG pour le client.
