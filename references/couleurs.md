# Couleurs

## Construire la palette
- 1 couleur principale, 1 secondaire, 1 accent au maximum + 1-2 neutres (fond clair, gris texte).
- Reprendre les couleurs du logo vectorisé (`palette.py --depuis logos/principal.svg` les ajoute).
- Nommer chaque couleur pour le client (« Bleu Atlas », « Vert Durable », « Orange Énergie ») et lui donner un rôle.
- Proportions conseillées (ex. Marque A : blanc 55 / bleu 25 / vert 15 / orange 5 %) dans `charte.json` → `proportions`.

## Codes
`python $SKILL/scripts/palette.py <atelier>` complète pour chaque couleur :
- **RVB / HEX** : écran.
- **CMJN** (indication écrite dans la charte, jamais appliquée aux fichiers : nuances et PDF restent en RVB) : calculé avec le profil **Coated FOGRA39** (le même moteur qu'InDesign, intention colorimétrique
  relative + compensation du point noir). Exemple ATLAS : #0B2A5B → 100·88·37·28 (la formule naïve donnait
  88·54·0·64, inutilisable). Marqué « à confirmer par l'imprimeur » : un BAT reste nécessaire.
  Papier non couché : demander le profil à l'imprimeur (Uncoated FOGRA29).
- **Pantone** : jamais inventé. Le donner seulement s'il vient du client ou d'un nuancier physique ; sinon
  « à confirmer ». (Marque A : 7687 C, 361 C, 158 C fournis après vérification.)
- **Teintes** 80/60/40/20 % et **contrastes WCAG** contre blanc et noir : ≥ 4,5 pour un petit texte, ≥ 3 pour un titre.

## Pièges
- Couleur du logo vectorisé légèrement différente de la charte (#0A2A5C vs #0B2A5B) : `logos.py` aligne
  automatiquement chaque couleur du SVG sur la couleur de charte la plus proche (écart < 30).
- Codes inversés entre deux couleurs (vu sur Marque A V1) : toujours recopier depuis `charte.json`, jamais à la main.
- Or, argent, cuivre : en impression, prévoir une dorure à chaud ou un Pantone métallisé ; en CMJN l'or devient un ocre.
