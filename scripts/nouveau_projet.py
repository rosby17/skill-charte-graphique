#!/usr/bin/env python3
"""Crée le dossier de travail d'une charte graphique dans le dossier du client.

  nouveau_projet.py "<dossier du client>" --nom "ATLAS" [--nom-complet "…"] [--secteur "…"]

Crée <dossier du client>/charte-graphique/ :
  charte.json        fichier de marque (copie du modèle, à remplir)
  BRIEF.md           questionnaire client (à remplir avec lui ou d'après ses messages)
  sources/           logo validé, croquis, aperçus ChatGPT, documents du client
  logos/             SVG maîtres (principal.svg, horizontal.svg, vertical.svg, symbole.svg) + variantes/
  polices/           fichiers des polices de la marque (TTF/OTF statiques)
  IMAGES-CHATGPT/    prompt-chatgpt.txt, references/ (logos à joindre), images générées
  INDESIGN/          documents .indd générés, « Document fonts/ », scripts lancés
  LIVRABLES/         01-LOGOS … (rempli par logos.py et les déclinaisons)
  controle/          rendus PNG pour relecture
Ne touche à rien d'existant (complète seulement ce qui manque).
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

sys.dont_write_bytecode = True
SKILL = Path(__file__).resolve().parent.parent


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("client")
    ap.add_argument("--nom", required=True)
    ap.add_argument("--nom-complet", default="")
    ap.add_argument("--secteur", default="")
    a = ap.parse_args()
    racine = Path(a.client).expanduser() / "charte-graphique"
    for d in ["sources", "logos/variantes", "polices", "IMAGES-CHATGPT/references", "INDESIGN/Document fonts",
              "LIVRABLES", "controle"]:
        (racine / d).mkdir(parents=True, exist_ok=True)
    cj = racine / "charte.json"
    if not cj.exists():
        modele = json.loads((SKILL / "modele" / "charte.exemple.json").read_text(encoding="utf-8"))
        vide = {
            "_lisez_moi": modele["_lisez_moi"],
            "marque": {"nom": a.nom, "nom_complet": a.nom_complet, "slogan": "", "secteur": a.secteur, "ville": "",
                       "site": "", "annee": "", "version": "1.0", "direction_artistique": "",
                       "fichier": a.nom.replace(" ", "-")},
            "textes": {"avant_propos": "", "presentation": "", "mission": "", "vision": "", "valeurs": [],
                       "personnalite": [], "ton": {"est": [], "n_est_pas": []}, "signification": []},
            "logos": {"formes": {"principal": {"svg": "logos/principal.svg", "libelle": "Version principale", "usage": ""}},
                      "couleur_sombre_a_inverser": "", "zone_protection": {"rapport": 0.5, "definition": ""},
                      "tailles_minimales": []},
            "couleurs": [], "proportions": {},
            "typographies": modele["typographies"], "hierarchie": modele["hierarchie"],
            "contacts": [], "adresse": "", "declinaisons": modele["declinaisons"], "images": [],
            "charte": modele["charte"],
        }
        cj.write_text(json.dumps(vide, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    brief = racine / "BRIEF.md"
    if not brief.exists():
        shutil.copy(SKILL / "BRIEF-MODELE.md", brief)
    print(f"Dossier prêt : {racine}")


if __name__ == "__main__":
    main()
