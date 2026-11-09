#!/usr/bin/env python3
"""Prépare les polices de la marque pour InDesign et l'imprimeur.

  polices.py instancier <police-variable.ttf> --famille "Playfair Display" --styles Regular:400,SemiBold:600,Bold:700 -o <dossier>/polices
      Tire des fichiers STATIQUES d'une police variable (Google Fonts) : InDesign et Chrome intègrent sinon
      les polices variables en « Type 3 », que beaucoup d'imprimeurs refusent.
  polices.py chercher "Montserrat"
      Liste les fichiers de cette famille installés sur le Mac (~/Library/Fonts, /Library/Fonts…).
  polices.py copier "Montserrat" --styles Regular,Medium,SemiBold -o <dossier>/polices
      Copie les fichiers installés dans le dossier de la charte (pour l'emballer avec les .indd).
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

sys.dont_write_bytecode = True
DOSSIERS = [Path.home() / "Library/Fonts", Path("/Library/Fonts"), Path("/System/Library/Fonts/Supplemental"),
            Path("/Applications/Adobe InDesign 2025/Fonts")]


def instancier(a):
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    sortie = Path(a.sortie); sortie.mkdir(parents=True, exist_ok=True)
    for paire in a.styles.split(","):
        style, poids = paire.split(":")
        f = TTFont(a.fichier)
        # Tous les axes figés (opsz d'Inter, wdth…) : un axe restant donne des styles « 20.000opsz » dans InDesign.
        axes = {ax.axisTag: ax.defaultValue for ax in f["fvar"].axes}
        axes["wght"] = float(poids)
        statique = instancer.instantiateVariableFont(f, axes, updateFontNames=False)
        nom = statique["name"]
        ps = (a.famille + "-" + style).replace(" ", "")
        regulier = style in ("Regular", "Bold", "Italic", "Bold Italic")
        for rec_id, val in ((1, a.famille if regulier else f"{a.famille} {style}"), (2, style if regulier else "Regular"),
                            (4, f"{a.famille} {style}"), (6, ps), (16, a.famille), (17, style)):
            nom.setName(val, rec_id, 3, 1, 0x409)
            nom.setName(val, rec_id, 1, 0, 0)
        if "STAT" in statique:
            del statique["STAT"]
        statique["OS/2"].usWeightClass = int(float(poids))
        dest = sortie / f"{ps}.ttf"
        statique.save(dest)
        print("✓", dest)


def chercher(famille):
    """Fichiers dont le nom commence par la famille suivie d'un tiret, d'une espace ou d'un point
    (« Montserrat » ne ramène pas « MontserratAlternates »)."""
    cle = re.sub(r"\s+", "", famille).lower()
    r = []
    for d in DOSSIERS:
        if d.exists():
            for p in d.iterdir():
                n = p.name.replace(" ", "").lower()
                if p.suffix.lower() in (".ttf", ".otf", ".ttc") and n.startswith(cle) and n[len(cle):len(cle) + 1] in ("-", ".", "_", "["):
                    r.append(p)
    return r


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    i = sp.add_parser("instancier"); i.add_argument("fichier"); i.add_argument("--famille", required=True)
    i.add_argument("--styles", required=True); i.add_argument("-o", "--sortie", required=True)
    c = sp.add_parser("chercher"); c.add_argument("famille")
    k = sp.add_parser("copier"); k.add_argument("famille"); k.add_argument("--styles", default=""); k.add_argument("-o", "--sortie", required=True)
    a = ap.parse_args()
    if a.cmd == "instancier":
        instancier(a)
    elif a.cmd == "chercher":
        for p in chercher(a.famille):
            print(p)
    else:
        voulus = [s.strip().lower() for s in a.styles.split(",") if s.strip()]
        Path(a.sortie).mkdir(parents=True, exist_ok=True)
        for p in chercher(a.famille):
            st = p.stem.split("-")[-1].lower()
            if not voulus or st in voulus:
                shutil.copy(p, Path(a.sortie) / p.name); print("✓", p.name)


if __name__ == "__main__":
    main()
