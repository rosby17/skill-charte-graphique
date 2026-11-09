# Déclinaisons

## Générées par le skill (InDesign, éditables)
| Module | Format | Contenu de départ | Dossier livré |
|---|---|---|---|
| `carte-visite` | 85 × 55 mm, fond perdu 3 mm, un recto par contact + verso | logo, nom, fonction, téléphones, e-mails, site ; verso couleur principale | `03-CARTE-DE-VISITE/` |
| `entete` | A4 portrait | logo, coordonnées, date, objet, cadre de lettre éditable, pied | `04-PAPIER-EN-TETE/` |
| `enveloppe` | DL 220 × 110 mm | logo, adresse retour, zone destinataire (fenêtre droite) | `05-ENVELOPPE/` |
| `kakemono` | 85 × 200 cm à l'échelle 1/10 | logo, message, grand visuel `IMG:kakemono-visuel.png`, coordonnées | `06-KAKEMONO/` |
| `badge` | CR80 54 × 86 mm portrait, recto/verso | bandeau logo, photo, nom, fonction ; verso symbole + mention de perte | `07-BADGE/` |
Chaque module livre : `.indd` (+ « Document fonts »), `.idml`, PDF HD, PDF d'impression (RVB sans conversion, traits de
coupe), aperçus PNG. Ce sont des **mises en page de départ** sobres : les affiner avec l’utilisateur, ou reproduire
au pixel près un visuel validé (`references/fidelite-apercu.md`).

## Formats de référence
| Support | Format | Notes |
|---|---|---|
| Carte de visite | 85 × 55 mm (CI, Europe) ; 90 × 50 (Marque C) ; 3,5 × 2 in (US) | marges de sécurité 4 mm |
| Papier à en-tête | A4 210 × 297 | + modèle Word `.dotx` (police bureautique, styles) |
| Enveloppe | DL 220 × 110, C5 229 × 162, C4 229 × 324 | fenêtre DL : 100 × 35 mm à 20 mm du bas et du bord |
| Badge | CR80 54 × 86 (ou 85,6 × 54) | trou d'attache : 3 mm du haut |
| Kakemono / roll-up | 85 × 200 cm (aussi 100 × 200) | construire en 1/10, images ≥ 3000 px de haut |
| Flyer | A5 148 × 210, A6 | fond perdu 3 mm |
| Dépliant 3 volets | A4 ouvert | volets intérieurs 97 mm, extérieur 100 mm |
| Affiche | A3, A2, 40 × 60 cm | |
| Réseaux sociaux | post 1080 × 1080, portrait 1080 × 1350, story 1080 × 1920, couverture Facebook 1640 × 624 (zone sûre 820 × 312), bannière LinkedIn 1584 × 396, YouTube 2560 × 1440 (zone sûre 1546 × 423), avatar 400 × 400 | |
| Signature e-mail | 600 px de large max, logo PNG 300 px | police bureautique, logo hébergé (URL https) |
| Présentation | PowerPoint 16:9 | 6 diapositives types (titre, section, texte, image, chiffres, fin) |

## À faire hors InDesign (méthode Marque A)
- **Réseaux sociaux, profils, imprimés web** : HTML + CSS avec les vraies polices (`@font-face`), un élément
  `[data-nom]` par visuel, rendu PNG × 3 par Chrome/Playwright (`VISUELS-HTML/`, `rendre.mjs`), puis placés dans la charte.
- **Word (.docx / .dotx)** et **PowerPoint (.pptx)** : modèles avec la police bureautique et les styles de la marque,
  vérifiés en ouvrant dans Word / PowerPoint.
- **Signature e-mail** : HTML en tableaux, styles en ligne, logo hébergé.
- **Mini-site de la charte** (option) : liseuse des pages en WebP, téléchargements (kit ZIP), page non indexée.

## Ajouter un module InDesign
1. Copier un module proche (`badge.jsx` pour un petit format, `entete.jsx` pour un A4).
2. Garder `finirDeclinaison()` (contrôle, enregistrement, PDF HD, PDF d'impression RVB, IDML).
3. Ajouter la ligne dans `MODULES` (`indesign.py`) : dossier `0N-NOM`, nom de fichier, titre, nombre de pages, légende.
4. Ajouter le module à `charte.json` → `declinaisons` : il apparaît automatiquement dans le chapitre « Applications ».
