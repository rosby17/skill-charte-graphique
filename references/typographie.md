# Typographie

## Choix
- Deux familles au maximum : **titres** (caractère, proche de l'esprit du logo) + **texte** (lisible, beaucoup de
  graisses). Plus une **police bureautique** installée partout (Arial, Georgia, Calibri) pour Word, PowerPoint, e-mails.
- Exemples réalisés : Marque A = Prelo + Elza (bureautique Arial) ; Marque B = Neue Montreal + Avenir Next ;
  Marque C = Glancyr + Neue Montreal ; ATLAS (essai) = Playfair Display + Montserrat (bureautique Georgia).
- Préférer les polices libres (Google Fonts, licence SIL OFL : usage commercial autorisé) ; une police
  commerciale doit être achetée par le client (le noter dans la charte : « Licence : … »).
- La hiérarchie (Titre 1, Titre 2, Intertitre, Texte courant, Légende : police, graisse, corps, interlignage,
  capitales, approche) est décrite dans `charte.json` → `hierarchie` et devient des styles InDesign.

## Fichiers
- Les fichiers vont dans `polices/` et sont listés dans `charte.json` → `typographies.<rôle>.fichiers`.
  `indesign.py` les copie dans « Document fonts » à côté de chaque .indd (InDesign les active sans installation ;
  l'imprimeur les reçoit avec le dossier).
- Police variable (fichier `[wght]`) : en tirer des fichiers statiques, sinon Type 3 dans les PDF :
  `python $SKILL/scripts/polices.py instancier Police[wght].ttf --famille "Playfair Display" --styles Regular:400,SemiBold:600,Bold:700 -o polices`
- Police déjà installée sur le Mac : `polices.py chercher "Montserrat"` puis
  `polices.py copier "Montserrat" --styles Light,Regular,Medium,SemiBold -o polices`.
- Contrôle après export : `pdffonts fichier.pdf` → toutes les polices « emb yes », type TrueType/CID/Type 1C,
  aucune « Type 3 ».

## Si une police manque
Le compte rendu d'InDesign l'indique (« Police absente : … → repli »). Ne pas livrer avec un repli :
fournir le fichier, ou changer la police dans `charte.json` et régénérer.
