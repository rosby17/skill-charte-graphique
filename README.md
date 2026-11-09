# Skill « charte-graphique » pour Claude Code

Ce skill apprend à Claude à construire l'identité visuelle complète d'une marque : du logo jusqu'à une charte graphique éditable dans InDesign, avec ses déclinaisons (carte de visite, papier à en-tête, enveloppe, kakemono, badge) et des livrables rangés pour le client et l'imprimeur. Méthode de Roosevelt Mogo, mise au point sur une dizaine de chartes livrées.

Le mode d'emploi pour Claude est dans `SKILL.md`, les détails par sujet dans `references/`.

## Installation

Il faut un Mac avec Adobe InDesign, Google Chrome et poppler (`brew install poppler`).

```bash
git clone https://github.com/rosby17/skill-charte-graphique.git ~/skills/charte-graphique
ln -s ~/skills/charte-graphique ~/.claude/skills/charte-graphique
~/skills/charte-graphique/outils/installer.sh
```

Ensuite, dans Claude Code, il suffit de parler de « charte graphique », d'« identité visuelle » ou de « carte de visite » pour que le skill se déclenche.

## Essai rapide

```bash
P=~/.charte-graphique-venv/bin/python
$P scripts/nouveau_projet.py "/chemin/CLIENT" --nom "MARQUE"
$P scripts/vectoriser.py logo.png -o /chemin/CLIENT/charte-graphique/logos/principal.svg --recadrer --controle controle.png
$P scripts/palette.py /chemin/CLIENT/charte-graphique
$P scripts/logos.py /chemin/CLIENT/charte-graphique
$P scripts/indesign.py /chemin/CLIENT/charte-graphique declinaisons
$P scripts/planche.py /chemin/CLIENT/charte-graphique
```

Les noms de marques cités dans les fiches (Marque A, Atlas…) remplacent ceux de vrais clients.
