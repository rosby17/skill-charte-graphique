---
name: charte-graphique
description: Construire l'identité visuelle complète d'un client, du logo à la charte graphique imprimable et ÉDITABLE dans InDesign, avec toutes ses déclinaisons, selon la méthode de Roosevelt Mogo : brief, logo (création par prompts ChatGPT ou logo existant), vectorisation fidèle d'un aperçu validé, palette HEX/RVB/CMJN (profil FOGRA39)/Pantone, typographies, pack de logos (SVG, PDF, EPS, PNG en couleur, négatif, blanc, noir, mono), charte A4 paysage de 30 pages et plus (.indd, IDML, un seul PDF HD, sommaire cliquable), carte de visite, papier à en-tête, enveloppe, kakemono, badge, mises en situation et livrables rangés pour le client et l'imprimeur. Reproduit aussi au pixel près un visuel validé (carte, flyer) en PDF d'impression. Utilise-le dès qu'on parle de « charte graphique », « identité visuelle », « brand book », « guide de marque », « déclinaisons du logo », « papeterie », « carte de visite », « kit de marque », « logo pour un client » ou « version imprimable » d'un visuel.
---

# Charte graphique (méthode Roosevelt Mogo)

On part d'un logo (ou d'une idée de logo) et on livre une identité complète : un fichier de marque unique
(`charte.json`), des logos propres dans tous les formats, une charte InDesign **éditable** et toutes les
déclinaisons prêtes pour l'imprimeur. Tout est généré par script : on peut tout refaire en une commande
quand le client change une couleur, un nom ou un numéro. Réponds dans la langue de l'utilisateur.

Le dossier du skill est indiqué au chargement (« Base directory ») : on l'appelle `$SKILL` ci-dessous.
Python du skill : `~/.charte-graphique-venv/bin/python` (créé par `$SKILL/outils/installer.sh` s'il manque).
Prérequis : Adobe InDesign (2020 ou plus récent), Google Chrome, poppler (`pdftoppm`, `pdftops`).

## Avant de commencer
1. Lire `JOURNAL.md` (leçons des projets précédents) et le suivi du projet s'il existe.
2. Repérer le dossier du client (par exemple `<CLIENTS>/<CLIENT>/GRAPHISME/`) et y créer l'atelier :
   `python $SKILL/scripts/nouveau_projet.py "<dossier client>" --nom "<MARQUE>" --nom-complet "…" --secteur "…"`
   → `charte-graphique/` avec `charte.json`, `BRIEF.md`, `sources/`, `logos/`, `polices/`, `IMAGES-CHATGPT/`,
   `INDESIGN/`, `LIVRABLES/`, `controle/`.
3. Ne jamais toucher aux documents InDesign que l'utilisateur a ouverts (les scripts ouvrent leurs propres
   fichiers sans fenêtre).

## Déroulé d'un projet
1. **Brief** : remplir `BRIEF.md` d'après les messages, documents et le site du client. Ce qui manque reste
   « À compléter » dans la charte : on n'invente jamais une mission, un chiffre, une adresse.
   3 questions au maximum au client, puis on avance. (`BRIEF-MODELE.md`)
2. **Logo**
   - Pas de logo : 4 pistes par prompts ChatGPT (logos + mises en situation), choix du client, puis on
     passe au point suivant. Claude ne génère jamais d'image lui-même. (`references/logo-de-zero.md`)
   - Logo validé en image (ChatGPT, JPG, capture) : **vectoriser** fidèlement :
     `python $SKILL/scripts/vectoriser.py sources/logo.png -o logos/principal.svg --recadrer --marge 0.03 --controle controle/vecto.png`
     puis REGARDER la planche de contrôle (original | vecteur | superposition). (`references/vectorisation.md`)
   - Logo existant en AI/SVG/PDF : le reprendre tel quel (SVG maître par forme).
   - Formes à préparer dans `logos/` : `principal.svg` (obligatoire), `horizontal.svg`, `vertical.svg`,
     `symbole.svg` selon le logo, déclarées dans `charte.json` → `logos.formes`.
3. **Couleurs** : noms, rôles, HEX dans `charte.json`, puis `python $SKILL/scripts/palette.py <atelier>`
   → RVB, CMJN indicatif (profil Coated FOGRA39, seulement écrit dans la charte), teintes, contrastes. Le Pantone n'est
   jamais inventé (« à confirmer »). (`references/couleurs.md`)
4. **Typographies** : 2 familles maximum (titres + texte) et une police bureautique. Fichiers statiques dans
   `polices/` (`scripts/polices.py instancier|copier`), licence notée. (`references/typographie.md`)
5. **Pack de logos** : `python $SKILL/scripts/logos.py <atelier>` → `LIVRABLES/01-LOGOS/{SVG,PDF,EPS,PNG}/`
   en couleur, négatif, blanc, noir, mono (+ variantes internes pour InDesign).
6. **Images** : écrire `IMAGES-CHATGPT/prompt-chatgpt.txt` (bloc CONTEXTE + liste numérotée dont les noms
   de fichiers = cadres `IMG:` de la charte) et le coller en entier dans la réponse, dans un bloc de code,
   avec les références à joindre et le dossier où enregistrer. (`references/images-chatgpt.md`)
7. **InDesign** : `python $SKILL/scripts/indesign.py <atelier> declinaisons` (chaque déclinaison listée dans
   `charte.json`, puis la charte qui les intègre) ou un module seul (`charte`, `carte-visite`, `entete`,
   `enveloppe`, `kakemono`, `badge`). Sortie : `.indd` + IDML + PDF HD + PDF d'impression (RVB sans conversion, traits de
   coupe) + aperçus PNG. Les polices partent dans « Document fonts ». (`references/indesign.md`,
   `references/structure-charte.md`, `references/declinaisons.md`)
8. **Relire soi-même** : `python $SKILL/scripts/planche.py <atelier> [module]` puis REGARDER la planche :
   logos présents, textes coupés, pages vides, « À compléter » restants. Le compte rendu d'InDesign signale
   débordements, polices absentes, images attendues. On corrige et on relance (les scripts sont rejouables).
9. **Images arrivées** : les déposer dans `IMAGES-CHATGPT/` sous le nom prévu et relancer `indesign.py` :
   elles se placent seules dans leurs cadres.
10. **Visuel validé à reproduire** (carte dessinée par ChatGPT, flyer…) : le refaire au pixel près en PDF
    d'impression vectoriel, contrôlé par superposition. (`references/fidelite-apercu.md`)
11. **Livraison** : `LIVRABLES/` rangé, nommé `<Marque>_<objet>-<variante>.<ext>`, kit ZIP, UN SEUL PDF HD (plus de version légère, consigne du 24/10),
    message au client et consignes pour l'imprimeur (BAT). (`references/livraison.md`)
12. **Apprendre** : noter dans `JOURNAL.md` ce qui a coincé et la correction (et corriger le skill).

## Règles qui ne bougent pas
- **Un seul fichier de vérité** : `charte.json`. On modifie le JSON puis on régénère, jamais l'inverse.
- **Éditable avant tout** : chaque texte est un vrai texte InDesign avec un style de paragraphe nommé ; nuances
  nommées « <MARQUE> <couleur> » en RVB ; calques « 01 — Fonds », « 02 — Logos et images », « 03 — Textes éditables ».
- **Fidélité** : quand le client a validé une image, on la reproduit à l'identique (mesures au pixel,
  décalque, polices calées en largeur), on ne la « réinterprète » pas. On le prouve par une superposition.
- **Logos officiels** : on place toujours les fichiers du pack (jamais un logo redessiné par ChatGPT).
- **Impression** : fond perdu 3 mm, marges de sécurité 3-4 mm, polices intégrées en TrueType/OpenType
  (jamais de Type 3 : polices variables → instances statiques).
- **Couleurs exactes, jamais de CMJN** (règle du 04/11) : nuances, fusion et PDF restent en RVB,
  sans conversion (pas de PDF/X-1a ni X-4, pas de Ghostscript en CMYK) : le CMJN ternissait le bleu validé de
  Marque C (#005EFB affiché #435DB4). Avant de livrer, rendre chaque PDF (pdftoppm) et comparer ses couleurs
  dominantes avec la maquette validée : écart de quelques points au plus. Les valeurs CMJN de la charte restent
  une indication pour l'imprimeur.
- **Formats** : carte de visite 85 × 55 mm (Côte d'Ivoire, Europe) sauf demande ; charte A4 paysage.
- **Pages signature** (règle du 07/11) : personnalité et ton, zone de protection, tailles minimales, logo sur les fonds,
  interdits, nuances et proportions, ainsi que le roll-up, ne se livrent JAMAIS avec le dessin du module commun (le même dans toutes nos chartes,
  jugé « vulgaire ») : on les redessine pour chaque client dans `INDESIGN/modules/charte.jsx`, idée tirée de son métier.
  (`references/structure-charte.md`, exemple Marque D)
- **Rien n'est envoyé au client ni à l'imprimeur sans l’accord de l’utilisateur.**
- **Pas de contour parasite** : dans un script InDesign, épaisseur du trait à 0 AVANT `strokeColor = Aucune` (sinon filet noir 1 pt sur tous les cadres). Relire les aperçus à 80 dpi.
- Textes visibles en français soigné (accents, espaces insécables avant « : ; ? ! »), jamais de jargon.

## Les outils (`scripts/`)
| Script | Rôle |
|---|---|
| `nouveau_projet.py` | crée l'atelier `charte-graphique/` dans le dossier du client |
| `vectoriser.py` | PNG/JPG → SVG propre par couleur (palette auto ou imposée, contrôle visuel) |
| `palette.py` | complète la palette : RVB, CMJN FOGRA39, teintes, contrastes WCAG |
| `polices.py` | instances statiques d'une police variable, copie des polices installées |
| `logos.py` | pack de logos 5 versions × 4 formats + variantes internes |
| `indesign.py` | génère charte et déclinaisons dans InDesign (+ IDML, PDF, aperçus) |
| `planche.py` | planche de relecture des pages générées |
| `indesign/lib.jsx` | bibliothèque InDesign (document, nuancier, styles, rect, texte, logo, image, cotes, sommaire…) |
| `indesign/<module>.jsx` | un document par fichier : `charte`, `carte-visite`, `entete`, `enveloppe`, `kakemono`, `badge` |

Pour ajouter un support (flyer, dépliant, diplôme, signalétique…) : copier un module proche, adapter la page,
l'ajouter à `MODULES` dans `indesign.py` et à `charte.json` → `declinaisons`. (`references/declinaisons.md`)
