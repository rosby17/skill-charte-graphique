#!/usr/bin/env python3
"""Complète la palette de charte.json : CMJN (profil Coated FOGRA39), teintes 80/60/40/20 %, contrastes (WCAG).

Usage :
  palette.py <dossier-charte>                      complète RVB, CMJN, teintes, contrastes
  palette.py <dossier-charte> --depuis logos/principal.svg   ajoute les couleurs du logo absentes
  palette.py <dossier-charte> --rapport            affiche le tableau (HEX, RVB, CMJN, contrastes)

Le CMJN est calculé avec le profil Coated FOGRA39 (comme InDesign) ; il reste « à confirmer » par
l'imprimeur (BAT). Le Pantone n'est jamais inventé : champ vide = « à confirmer ».
"""
import argparse
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from commun import profil_cmjn, contraste, ecrire_charte, hex_vers_rvb, lire_charte, rvb_vers_cmjn, rvb_vers_hex


def teinte(rvb, part):
    return [round(255 - (255 - v) * part) for v in rvb]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dossier")
    ap.add_argument("--depuis", help="SVG dont on reprend les couleurs de remplissage")
    ap.add_argument("--rapport", action="store_true")
    a = ap.parse_args()
    charte, base = lire_charte(a.dossier)
    couleurs = charte.setdefault("couleurs", [])

    if a.depuis:
        svg = (base / a.depuis).read_text(encoding="utf-8")
        connues = {c["hex"].upper() for c in couleurs}
        for h in dict.fromkeys(m.upper() for m in re.findall(r'fill="(#[0-9A-Fa-f]{6})"', svg)):
            if h not in connues:
                couleurs.append({"nom": f"Couleur {len(couleurs) + 1}", "role": "à définir", "hex": h, "cmjn": None, "pantone": ""})
                print("ajoutée :", h)

    for c in couleurs:
        rvb = hex_vers_rvb(c["hex"])
        c["hex"] = rvb_vers_hex(*rvb)
        c["rvb"] = rvb
        if not c.get("cmjn") or c.get("cmjn_indicatif"):
            c["cmjn"] = rvb_vers_cmjn(*rvb)
            c["cmjn_indicatif"] = True
            c["cmjn_profil"] = Path(profil_cmjn() or "sans profil").stem
        c["teintes"] = {str(p): rvb_vers_hex(*teinte(rvb, p / 100)) for p in (80, 60, 40, 20)}
        c["contraste_blanc"] = round(contraste(rvb, [255, 255, 255]), 2)
        c["contraste_noir"] = round(contraste(rvb, [0, 0, 0]), 2)
        c.setdefault("pantone", "")
    ecrire_charte(charte, base)

    if a.rapport or True:
        print(f"{'Nom':<16}{'HEX':<9}{'RVB':<14}{'CMJN':<18}{'/blanc':>7}{'/noir':>7}  Pantone")
        for c in couleurs:
            cm = "·".join(map(str, c["cmjn"])) + ("*" if c.get("cmjn_indicatif") else "")
            print(f"{c['nom']:<16}{c['hex']:<9}{'·'.join(map(str, c['rvb'])):<14}{cm:<18}{c['contraste_blanc']:>7}{c['contraste_noir']:>7}  {c['pantone'] or 'à confirmer'}")
        print(f"* CMJN calculé avec le profil {Path(profil_cmjn() or '(aucun : formule simple)').stem} : à confirmer par l'imprimeur (BAT).")
        print("Texte lisible : contraste ≥ 4,5 (petit texte), ≥ 3 (gros titres).")


if __name__ == "__main__":
    main()
