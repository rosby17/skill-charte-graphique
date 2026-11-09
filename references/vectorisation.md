# Vectoriser un logo validé

Le logo validé arrive souvent en image (ChatGPT 1024-1536 px, JPG WhatsApp, capture). Il faut un SVG propre
pour tout le reste (pack de logos, InDesign, impression grand format).

## Commande
```
python $SKILL/scripts/vectoriser.py sources/logo.png -o logos/principal.svg --recadrer --marge 0.03 --controle controle/vecto-principal.png
```
- Palette automatique : k-moyennes puis rejet des teintes qui ne sont qu'un mélange fond ↔ couleur
  (antialiasing des petites lettres). Si elle se trompe : `--couleurs "#0B2A5B,#C8102E"`.
- Couches empilées de la plus grande à la plus petite, chaque couche englobant celles du dessus :
  aucun liseré blanc entre deux couleurs qui se touchent.
- Courbes de Bézier lissées, angles vifs conservés (empattements, pointes).
- `--tol` (0,35 px) : plus petit = plus fidèle mais plus lourd ; `--lisser` (0,6) : flou avant tracé ;
  `--aire-min` (6 px²) : retire les poussières.

## Toujours vérifier
Ouvrir la planche `--controle` : original | vecteur | superposition. Les deux doivent se confondre. Regarder
de près les petits textes (slogan), les jonctions de couleurs, les pointes. Si l'image source est petite
(< 800 px de large) : demander une version plus grande au client ou la régénérer en grand avant de vectoriser.

## Formes du logo
Préparer un SVG maître par forme, déclarées dans `charte.json` → `logos.formes` :
- `principal` (obligatoire) : la version validée.
- `horizontal` / `vertical` : signature symbole + nom côte à côte ou empilée.
- `symbole` : le signe seul (favicon, avatar). Pour un logotype pur, prendre la lettre ou le monogramme
  caractéristique (ATLAS : le X bicolore). Découper l'image source sur une colonne vide entre deux lettres
  (repérer les colonnes sans encre), puis vectoriser avec `--couleurs` imposées.
Ensuite : `palette.py` puis `logos.py` (qui aligne les couleurs du SVG sur celles de la charte).

## Logo source vectoriel (AI, PDF, EPS)
Ne pas vectoriser : exporter chaque forme en SVG depuis Illustrator (un plan de travail par forme ; script
de diagnostic possible : lister plans de travail, calques, groupes → fichier texte, comme `inspect_illustrator.jsx`
de la Marque B). Vérifier qu'aucun texte n'est resté en police vivante (vectoriser les textes).
