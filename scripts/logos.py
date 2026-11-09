#!/usr/bin/env python3
"""Fabrique le pack de logos de la marque à partir des SVG maîtres déclarés dans charte.json.

Pour chaque forme (principal, horizontal, vertical, symbole…) et chaque version :
  couleur   les couleurs d'origine
  negatif   pour fond sombre : la couleur sombre déclarée (logos.couleur_sombre_a_inverser) passe en blanc
  blanc     tout en blanc
  noir      tout en noir
  mono      tout dans logos.couleur_mono (sinon la couleur principale de la charte)
Formats : SVG, PDF (vectoriel), EPS (vectoriel, via pdftops), PNG transparent (2000 px de large par défaut).

Sortie : LIVRABLES/01-LOGOS/<FORMAT>/<Marque>_logo-<forme>-<version>.<ext>
         + logos/variantes/<forme>-<version>.svg|pdf (utilisés par les scripts InDesign)
Usage :
  logos.py <dossier-charte> [--png 2000] [--versions couleur,negatif,blanc,noir,mono]
"""
import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from commun import chrome_pdf, chrome_png, hex_vers_rvb, lire_charte

VERSIONS = ["couleur", "negatif", "blanc", "noir", "mono"]


def accrocher(svg, palette):
    """Aligne chaque couleur du SVG sur la couleur de la charte la plus proche (écart < 30) :
    une vectorisation donne #0A2A5C là où la charte dit #0B2A5B."""
    pal = [(h.upper(), hex_vers_rvb(h)) for h in palette]
    def rempl(m):
        rvb = hex_vers_rvb(m.group(2))
        h, d = min(((h, sum((a - b) ** 2 for a, b in zip(rvb, v)) ** .5) for h, v in pal), key=lambda x: x[1])
        return f'{m.group(1)}"{h if d < 30 else m.group(2).upper()}"'
    return re.sub(r'(fill=|stop-color=|data-couleur=)"(#[0-9A-Fa-f]{6})"', rempl, svg)


def recolorer(svg, version, sombre, principale):
    def rempl(m):
        c = m.group(2).upper()
        if version == "blanc":
            n = "#FFFFFF"
        elif version == "noir":
            n = "#000000"
        elif version == "mono":
            n = principale
        elif version == "negatif":
            n = "#FFFFFF" if sombre and c == sombre.upper() else c
        else:
            n = c
        return f'{m.group(1)}"{n}"'
    return re.sub(r'(fill=|stop-color=|data-couleur=)"(#[0-9A-Fa-f]{6})"', rempl, svg)


def taille(svg):
    m = re.search(r'viewBox="([\d.\-]+) ([\d.\-]+) ([\d.]+) ([\d.]+)"', svg)
    return float(m.group(3)), float(m.group(4))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dossier")
    ap.add_argument("--png", type=int, default=2000, help="largeur des PNG (px)")
    ap.add_argument("--versions", default=",".join(VERSIONS))
    a = ap.parse_args()
    charte, base = lire_charte(str(Path(a.dossier).resolve()))  # chemin absolu : as_uri() refuse « . »
    marque = charte["marque"].get("fichier") or charte["marque"]["nom"].replace(" ", "-")
    sombre = charte["logos"].get("couleur_sombre_a_inverser")
    principale = charte["logos"].get("couleur_mono") or next((c["hex"] for c in charte["couleurs"] if c.get("role") == "principale"), charte["couleurs"][0]["hex"])
    sortie = base / "LIVRABLES" / "01-LOGOS"
    var = base / "logos" / "variantes"
    var.mkdir(parents=True, exist_ok=True)
    for f in ("SVG", "PDF", "EPS", "PNG"):
        (sortie / f).mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp())
    n = 0
    for forme, info in charte["logos"]["formes"].items():
        maitre = accrocher((base / info["svg"]).read_text(encoding="utf-8"), [c["hex"] for c in charte["couleurs"]])
        (base / info["svg"]).write_text(maitre, encoding="utf-8")
        w, h = taille(maitre)
        for version in a.versions.split(","):
            if version == "negatif" and not sombre:
                continue
            svg = recolorer(maitre, version, sombre, principale)
            nom = f"{marque}_logo-{forme}-{version}"
            (sortie / "SVG" / f"{nom}.svg").write_text(svg, encoding="utf-8")
            (var / f"{forme}-{version}.svg").write_text(svg, encoding="utf-8")
            # PDF vectoriel à la taille du dessin (1 px = 1/96 in), page = boîte du logo
            html = tmp / f"{nom}.html"
            wmm, hmm = w * 25.4 / 96, h * 25.4 / 96
            html.write_text(f'''<html><head><style>@page{{size:{wmm:.3f}mm {hmm:.3f}mm;margin:0}}html,body{{margin:0}}
img{{display:block;width:{wmm:.3f}mm;height:{hmm:.3f}mm}}</style></head><body><img src="{(sortie / 'SVG' / f'{nom}.svg').as_uri()}"></body></html>''', encoding="utf-8")
            pdf = sortie / "PDF" / f"{nom}.pdf"
            chrome_pdf(html, pdf, attente_ms=1500)
            shutil.copy(pdf, var / f"{forme}-{version}.pdf")
            subprocess.run(["pdftops", "-eps", str(pdf), str(sortie / "EPS" / f"{nom}.eps")], check=True)
            # PNG transparent
            lp = a.png
            hp = round(lp * h / w)
            hp_html = tmp / f"{nom}-png.html"
            hp_html.write_text(f'<html><body style="margin:0;background:transparent"><img src="{(sortie / "SVG" / f"{nom}.svg").as_uri()}" width="{lp}" height="{hp}" style="display:block"></body></html>', encoding="utf-8")
            chrome_png(hp_html, sortie / "PNG" / f"{nom}.png", lp, hp, transparent=True)
            n += 1
            print("✓", nom)
        # version « faux » (couleurs permutées) : seulement pour la page des interdits, jamais livrée
        hexs = list(dict.fromkeys(re.findall(r'fill="(#[0-9A-Fa-f]{6})"', maitre)))
        autres = [c["hex"] for c in charte["couleurs"]][::-1]
        faux = maitre
        for i, h in enumerate(hexs):
            faux = faux.replace(f'fill="{h}"', f'fill="@{i}@"')
        for i, h in enumerate(hexs):
            faux = faux.replace(f'fill="@{i}@"', f'fill="{autres[i % len(autres)] if len(hexs) > 1 else "#E4572E"}"')
        (var / f"{forme}-faux.svg").write_text(faux, encoding="utf-8")
        html = tmp / f"{forme}-faux.html"
        html.write_text(f'<html><head><style>@page{{size:{wmm:.3f}mm {hmm:.3f}mm;margin:0}}html,body{{margin:0}}img{{display:block;width:{wmm:.3f}mm;height:{hmm:.3f}mm}}</style></head><body><img src="{(var / f"{forme}-faux.svg").as_uri()}"></body></html>', encoding="utf-8")
        chrome_pdf(html, var / f"{forme}-faux.pdf", attente_ms=1500)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"{n} versions × 4 formats dans {sortie}")


if __name__ == "__main__":
    main()
