# Piloter InDesign par script

## Principe
`scripts/indesign.py` assemble en UN fichier : `var CHARTE = …` (charte.json enrichi) + `var CHEMINS = …` +
`indesign/lib.jsx` + `indesign/<module>.jsx` + un appel `main()` qui renvoie « OK » ou « ERREUR ligne N » suivi
du compte rendu. Le fichier assemblé est gardé dans `INDESIGN/scripts/<module>.jsx` pour relecture.
Lancement : `osascript -e 'tell application id "com.adobe.InDesign" to do script (POSIX file "<jsx>") language javascript'`.
Testé avec InDesign 2025 (20.3) ; ExtendScript = JavaScript ES3 (pas de let/const, flèches, map, JSON.parse).

## Pièges rencontrés (et réglés dans lib.jsx)
| Piège | Effet | Règle |
|---|---|---|
| `D.layers[0]` gardé dans une variable | réévalué à chaque nouveau calque : les fonds passent AU-DESSUS des logos | toujours `D.layers.itemByName("…")` |
| `rectangles.add(calque, LocationOptions.UNKNOWN, {props})` | le 3e argument est une référence, pas des propriétés | `add(calque)` puis régler `geometricBounds` |
| `app.scriptPreferences.measurementUnit = MM` | les corps de texte passent aussi en mm (Marque A) | unités de règle du document en mm, corps en points |
| PDF placé sans boîte de rognage (PDF Chrome) | « Cannot crop to trim box » | `app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA` |
| Polices du client non installées | substitution silencieuse | dossier « Document fonts » à côté du .indd, et document créé → enregistré → fermé → ROUVERT avant d'écrire |
| Police variable | intégrée en Type 3 (refusée par certains imprimeurs) | `polices.py instancier` → fichiers statiques |
| Texte avec contour | Type 3 dans le PDF | épaissir par doublon décalé, pas par contour |
| Boîtes de dialogue | script bloqué | `userInteractionLevel = NEVER_INTERACT`, documents ouverts sans fenêtre (`app.open(f, false)`) |
| Documents de l'utilisateur ouverts | risque d'écraser son travail | ne fermer que le document visé (même chemin), jamais `app.documents.everyItem()` |
| Texte trop long | débordement invisible | `controle()` liste les cadres en débordement ; `auto: true` = hauteur automatique |

## API de lib.jsx (mm, origine en haut à gauche de la page)
- Document : `nouveauDocument(fichier, l, h, pages, fondPerdu)`, `exporterPDF(pdf, preset, traits)`,
  `exporterIDML(idml)`, `fermer()`, `controle()`, `note(texte)` (compte rendu).
- Couleurs : `NU.principale/secondaire/accent/texte/papier/noir/gris/filet/rouge`, `NU["<nom charte>"]`,
  `nuance(nom, rvb)`, `teinte(nomCharte, pourcent)`.
- Styles : `ST["01 — Titre de page"]`, `"01 — Grand titre"`, `"02 — Surtitre"`, `"03 — Intertitre"`,
  `"04 — Texte courant"`, `"05 — Légende"`, `"06 — Navigation"`, `"07 — Chiffre"`, `"08 — Code couleur"`,
  `"Hiérarchie — <niveau>"` (depuis charte.json), `police(famille, style)` avec repli signalé.
- Dessin : `rect(p, x, y, l, h, couleur, {rayon, contour, epaisseur, pointilles, opacite, calque, libelle})`,
  `ovale`, `ligne(p, x1, y1, x2, y2, couleur, pt, {pointilles, fleches})`, `croix(p, x, y, taille)`, `cote(p, x1, y1, x2, y2, "x")`.
- Texte : `texte(p, x, y, l, h, contenu, {style, couleur, corps, interligne, police:[famille, style], align:"g|c|d", vertical:"h|c|b", auto, capitales, approche, libelle})`.
- Images : `logo(p, forme, version, x, y, l, h, {ancre:"c|g|d|h|b"})` (PDF vectoriel du pack),
  `placer(p, fichier, x, y, l, h, {mode:"remplir"})`, `image(p, fichierChatGPT, x, y, l, h, légende)` (cadre `IMG:` ou attente).
- Charte : `pageSuivante(fond)`, `pageCourante(rubrique, titre, surtitre, {fond, sombre})`, `separateur(num, titre, accroche)`,
  `colonnesTexte(p, x, y, l, [[titre, texte]…], colonnes)`, `construireSommaire(page)`.

## Lire l'état d'InDesign
Pour diagnostiquer un document : petit script qui ouvre le .indd sans fenêtre, liste `allPageItems` (type,
calque, bornes) et renvoie le texte (exemple : ATLAS, logos cachés sous des fonds). Toujours fermer sans enregistrer.

## Exports
- PDF HD : preset `[High Quality Print]` (lecture, envoi au client) ; léger : `[Smallest File Size]`.
- Impression : `[High Quality Print]` + traits de coupe + fond perdu, couleurs « sans conversion » (`exporterPDF` s'en charge).
  Jamais de PDF/X-1a ni X-4 : ils convertissent en CMJN ou simulent la presse, et le bleu validé devient terne (04/11).
- IDML : pour ouvrir dans une version plus ancienne d'InDesign ou relire le contenu (zip XML).
- Aperçus : `pdftoppm` → `controle/<module>-N.png`, puis `planche.py`.
