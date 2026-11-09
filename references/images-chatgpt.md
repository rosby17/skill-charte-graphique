# Images de la charte (ChatGPT)

Les photos d'ambiance et les mises en situation (mockups) viennent de ChatGPT ; Claude écrit les prompts.
Méthode Marque A, qui a tenu sur 23 images.

## Le fichier `IMAGES-CHATGPT/prompt-chatgpt.txt`
1. **Bloc CONTEXTE** à coller une seule fois, avec les logos de `IMAGES-CHATGPT/references/` en pièces jointes
   (copier les PNG du pack : principal couleur, symbole, version blanche) :
   « Tu vas créer des images pour la charte graphique de la marque « … » (secteur, pays). Le logo est EXACTEMENT
   celui des images jointes : (description courte). Ne redessine jamais le logo autrement. Style : photo
   hyper-réaliste, lumière naturelle douce, haut de gamme, contexte africain (Côte d'Ivoire), personnes noires
   africaines quand il y a des personnes. Pas de texte inventé. »
2. **Liste numérotée**, une ligne par image : `N. [NN-nom-fichier.png] (format) description précise`.
   Le nom entre crochets est EXACTEMENT celui attendu par la charte (`charte.json` → `images[].fichier`,
   cadres `IMG:` d'InDesign). Formats : paysage 3:2 pour les pages, 1:1 pour les réseaux, 2:3 pour un kakemono.
3. Ordre : photos d'ambiance, puis mockups (carte, papeterie, badge, kakemono, façade, véhicule, tenues, goodies).

Toujours coller le prompt complet dans la réponse (bloc de code), avec : images de référence à joindre
(chemins exacts), dossier où enregistrer (`IMAGES-CHATGPT/`) et noms de fichiers.

## Le logo sur les mockups
ChatGPT déforme souvent le logo. Deux voies :
- générer le mockup VIERGE (garder l'original dans `IMAGES-CHATGPT/originaux-avant-incrustees/`), puis poser le
  vrai logo par script (perspective, Python/OpenCV) ;
- ou une passe de retouche ChatGPT : `prompt-retouche-logo.txt` avec une RÈGLE COMMUNE (« Retouche UNIQUEMENT les
  zones indiquées. Reproduis le logo joint À L'IDENTIQUE, suis la perspective et la texture du support ») et le
  logo officiel joint.
Les versions refusées vont dans `anciennes/`, les photos de référence du client dans `retours-client/`.

## Placement
Déposer chaque image sous son nom dans `IMAGES-CHATGPT/` puis relancer `indesign.py <atelier> charte` : les cadres
« Image à générer » sont remplacés automatiquement. Le compte rendu liste les images encore attendues.
