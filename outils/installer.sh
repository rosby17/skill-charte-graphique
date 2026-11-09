#!/bin/zsh
# Installe l'environnement Python du skill (une seule fois) : ~/.charte-graphique-venv
set -e
V="$HOME/.charte-graphique-venv"
[ -x "$V/bin/python" ] || python3 -m venv "$V"
"$V/bin/pip" -q install --upgrade numpy pillow opencv-python-headless fonttools
"$V/bin/python" -c "import numpy, PIL, cv2, fontTools; print('Environnement prêt :', '$V')"
