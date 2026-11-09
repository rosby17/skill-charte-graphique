# Créer le logo quand il n'existe pas

Claude ne génère jamais d'image : il écrit les prompts, ChatGPT dessine, l’utilisateur choisit avec le client.
Pour la réflexion de fond (types de marques, clichés, tests de petite taille), le skill `logo-design` peut servir.

## 1. Comprendre (depuis le brief)
Nom exact, sens du sigle, secteur, public, pays, 3 mots de personnalité, couleurs souhaitées ou interdites,
références admirées, style voulu (ATLAS : « universités françaises », bleu/rouge en diagonale, flambeau + livre
vus dans un aperçu Gemini du client).

## 2. Quatre pistes différentes
Quatre idées vraiment distinctes (pas quatre couleurs d'une même idée). Exemple ATLAS (16/10) :
A « Carrefour » (X bicolore qui se croise) (retenue) ; B « Sceau » (N à diagonale rouge, MMXXVI) ;
C « Page tournée » (bloc carré, coin rouge replié) ; D « Colonnade » (N en colonnes + diagonale or).

## 3. Le prompt ChatGPT
Fichier `IMAGES-CHATGPT/prompt-chatgpt.txt` (ou `<client>/logo/prompt-chatgpt.txt`), collé EN ENTIER dans la
réponse dans un bloc de code, avec : les références à joindre (chemin exact), le dossier et les noms de fichiers.
Format :
```
CONTEXTE (une fois) : marque, secteur, pays, public, valeurs, couleurs HEX, style, interdits
(pas de dégradé, pas d'effet 3D, fond blanc uni, texte EXACT avec accents : « Nouvelle Excellence Académique »).

1. [atlas-a-carrefour.png] (carré 1:1) Logo piste A : …description précise…
2. [atlas-b-sceau.png] (carré 1:1) …
3. …
5. [mockup-a-facade.png] (paysage 3:2) Mise en situation du logo de l'image 1 sur une façade… (reprend l'image 1 comme référence)
```
- Générer DANS L'ORDRE : les mises en situation reprennent les logos comme références.

## 4. Choix et vérification
- Vérifier l'orthographe de chaque image (les IA écorchent les accents : « Académique »).
- Montrer les pistes au client (planche ou mises en situation), noter la piste VALIDÉE et sa date
  (copie `LOGO-VALIDE-<marque>.png`).
- Ensuite : vectoriser (`references/vectorisation.md`), jamais livrer l'image ChatGPT telle quelle.
