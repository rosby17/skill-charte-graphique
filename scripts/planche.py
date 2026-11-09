#!/usr/bin/env python3
"""Planche de relecture : assemble les aperçus PNG d'un module (controle/<module>-N.png) en une image.
  planche.py <dossier-charte> [module=charte] [--colonnes 4]   →  controle/planche-<module>.png
À regarder SOI-MÊME après chaque génération (logos présents ? textes coupés ? pages vides ?)."""
import argparse, re, sys
from pathlib import Path
sys.dont_write_bytecode = True
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument("dossier"); ap.add_argument("module", nargs="?", default="charte")
ap.add_argument("--colonnes", type=int, default=4); a = ap.parse_args()
c = Path(a.dossier) / "controle"
fs = sorted(c.glob(f"{a.module}-*.png"), key=lambda f: int(re.findall(r"(\d+)\.png$", f.name)[0]))
if not fs: sys.exit("Aucun aperçu : lancer d'abord indesign.py")
ims = [Image.open(f).convert("RGB") for f in fs]
w = max(i.width for i in ims); h = max(i.height for i in ims); n = a.colonnes; r = (len(ims) + n - 1) // n
s = Image.new("RGB", (n * (w + 8), r * (h + 8)), "#888")
for k, im in enumerate(ims):
    s.paste(im, ((k % n) * (w + 8), (k // n) * (h + 8)))
    ImageDraw.Draw(s).text(((k % n) * (w + 8) + 4, (k // n) * (h + 8) + 3), str(k + 1), fill="red")
s.save(c / f"planche-{a.module}.png"); print(c / f"planche-{a.module}.png", f"({len(ims)} pages)")
