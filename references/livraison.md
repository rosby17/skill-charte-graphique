# Livraison

## Rangement (`charte-graphique/LIVRABLES/`)
```
00-CHARTE/           <Marque>_Charte-graphique.pdf (HD) + -leger.pdf (envoi WhatsApp / e-mail)
01-LOGOS/            SVG/ PDF/ EPS/ PNG/   <Marque>_logo-<forme>-<version>.<ext>
                     formes : principal, horizontal, vertical, symbole ; versions : couleur, negatif, blanc, noir, mono
03-CARTE-DE-VISITE/  .indd + Document fonts/ + .idml + .pdf + -IMPRESSION.pdf
04-PAPIER-EN-TETE/   idem (+ .docx / .dotx si demandé)
05-ENVELOPPE/  06-KAKEMONO/  07-BADGE/  …
08-PHOTOS/           images de l'univers (JPG renommés <Marque>_photo-<sujet>.jpg)
```
Le fichier source de la charte reste dans `INDESIGN/` (avec ses polices et l'IDML) : à zipper pour l'imprimeur
ou une agence (`<Marque>_Sources-InDesign.zip`). Kit complet pour le client : `<Marque>_Kit-de-marque.zip`
(charte légère + logos + modèles), sans les fichiers de travail.

## Avant d'envoyer (checklist)
- [ ] Planches relues (`planche.py`) : aucun « À compléter » oublié (sauf accord), aucune image attendue manquante.
- [ ] Orthographe : nom de la marque, accents, numéros de téléphone et e-mails recopiés depuis `charte.json`.
- [ ] `pdffonts` : polices intégrées, aucune Type 3.
- [ ] PDF d'impression : fond perdu 3 mm, traits de coupe, RVB sans conversion (couleurs mesurées contre la maquette validée) ; images ≥ 300 dpi à taille réelle.
- [ ] Logos : ouvrir 2-3 fichiers de chaque format (SVG dans le navigateur, EPS dans Aperçu/Illustrator, PNG transparent).
- [ ] Rien n'est envoyé au client ni à l'imprimeur sans l’accord de l’utilisateur.

## Message au client (exemple)
« Voici la charte graphique de <Marque> (PDF léger pour la lecture) et le kit de logos. Les fichiers
d'impression de la carte de visite et de l'en-tête sont prêts : on attend votre validation des textes
(noms, numéros) avant de les envoyer à l'imprimeur. »

## Consignes à l'imprimeur
PDF RVB aux couleurs exactes de la maquette (l'imprimeur fait sa conversion), fond perdu 3 mm, traits de coupe ;
les valeurs CMJN de la charte servent de repère. Demander un BAT couleur (surtout
pour les couleurs vives et l'or). Papier conseillé pour une carte : 350-400 g mat ; option dorure à chaud.
