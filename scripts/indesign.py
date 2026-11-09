#!/usr/bin/env python3
"""Génère les documents InDesign de la marque (éditables) à partir de charte.json.

  indesign.py <dossier-charte> charte            charte graphique complète (A4 paysage) → INDESIGN/ + LIVRABLES/00-CHARTE/
  indesign.py <dossier-charte> carte-visite      carte de visite 85 × 55 mm (+ fond perdu)
  indesign.py <dossier-charte> entete            papier à en-tête A4
  indesign.py <dossier-charte> enveloppe         enveloppe DL 220 × 110 mm
  indesign.py <dossier-charte> kakemono          kakemono / roll-up 85 × 200 cm (échelle 1/10)
  indesign.py <dossier-charte> badge             badge CR80 54 × 86 mm
  indesign.py <dossier-charte> declinaisons      toutes les déclinaisons listées dans charte.json, puis la charte
Options : --sans-apercu (pas de rendu PNG dans controle/)

Fonctionnement : le script assemble charte.json + chemins + lib.jsx + <module>.jsx en un seul .jsx
(gardé dans INDESIGN/scripts/ pour relecture), le lance dans InDesign par osascript, lit le compte rendu
(débordements, polices absentes, images attendues) puis rend les pages en PNG pour vérification visuelle.
Les polices de charte.json (typographies.*.fichiers) sont copiées dans « Document fonts » à côté des .indd :
InDesign les active sans installation, et l'imprimeur les reçoit avec le dossier.
InDesign doit être installé ; les documents déjà ouverts par l'utilisateur ne sont jamais touchés.
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
from commun import lire_charte, pdf_vers_png

MODULES = {
    "carte-visite": ("03-CARTE-DE-VISITE", "Carte-de-visite", "Carte de visite", 2, "Recto et verso · 85 × 55 mm · fond perdu 3 mm"),
    "entete": ("04-PAPIER-EN-TETE", "Papier-en-tete", "Papier à en-tête", 1, "A4 · zone de texte modifiable"),
    "enveloppe": ("05-ENVELOPPE", "Enveloppe-DL", "Enveloppe", 1, "Format DL 220 × 110 mm"),
    "kakemono": ("06-KAKEMONO", "Kakemono", "Kakemono", 1, "85 × 200 cm · fichier à l’échelle 1/10 (agrandir × 10 à l’impression)"),
    "badge": ("07-BADGE", "Badge", "Badge", 2, "Format carte CR80 · 54 × 86 mm"),
}


def application_indesign():
    r = subprocess.run(["mdfind", "kMDItemCFBundleIdentifier == 'com.adobe.InDesign'"], capture_output=True, text=True)
    if not r.stdout.strip():
        sys.exit("Adobe InDesign n'est pas installé : impossible de produire les fichiers éditables (.indd).")


def lancer(jsx):
    r = subprocess.run(["osascript", "-e", "with timeout of 1800 seconds",
                        "-e", f'tell application id "com.adobe.InDesign" to do script (POSIX file "{jsx}") language javascript',
                        "-e", "end timeout"], capture_output=True, text=True)
    return (r.stdout + r.stderr).strip()


def polices(charte, base, cible):
    df = cible / "Document fonts"
    df.mkdir(parents=True, exist_ok=True)
    n = 0
    for t in charte.get("typographies", {}).values():
        for f in t.get("fichiers", []) or []:
            src = base / f
            if src.exists():
                shutil.copy(src, df / src.name); n += 1
            else:
                print("  ! police introuvable :", f)
    return n


def modules(charte):
    """Modules du skill + modules propres au projet (charte.json → modules_projet : {nom: [dossier, fichier, titre, pages, légende]})."""
    m = dict(MODULES)
    for k, v in (charte.get("modules_projet") or {}).items():
        m[k] = tuple(v)
    return m


def source_module(base, module):
    """Un projet peut remplacer ou ajouter un module : INDESIGN/modules/<module>.jsx (design sur mesure)."""
    propre = base / "INDESIGN" / "modules" / f"{module}.jsx"
    return propre if propre.exists() else ICI / "indesign" / f"{module}.jsx"


def construire(base, charte, module, apercu=True):
    MODULES = modules(charte)
    marque = charte["marque"].get("fichier") or charte["marque"]["nom"]
    ind = base / "INDESIGN"
    (ind / "scripts").mkdir(parents=True, exist_ok=True)
    chemins = {
        "variantes": str(base / "logos" / "variantes"),
        "images": str(base / "IMAGES-CHATGPT"),
        "base": str(base),
    }
    if module == "charte":
        dest = base / "LIVRABLES" / "00-CHARTE"
        dest.mkdir(parents=True, exist_ok=True)
        chemins.update(indd=str(ind / f"{marque}_Charte-graphique.indd"),
                       pdf=str(dest / f"{marque}_Charte-graphique.pdf"),
                       pdf_leger=str(dest / f"{marque}_Charte-graphique-leger.pdf"),
                       idml=str(ind / f"{marque}_Charte-graphique.idml"))
        decl = []
        for m in charte.get("declinaisons", []):
            if m in MODULES:
                dossier, nom, titre, pages, leg = MODULES[m]
                pdf = base / "LIVRABLES" / dossier / f"{marque}_{nom}.pdf"
                if pdf.exists():
                    decl.append({"titre": titre, "pdf": str(pdf), "pages": pages, "legende": leg})
        chemins["declinaisons"] = decl
        # Branches (sous-marques) : un chapitre de cette charte, avec les logos et la papeterie de leur propre atelier.
        branches = []
        for b in charte.get("branches", []):
            bb = Path(b["dossier"])
            bdecl = []
            for m in b.get("declinaisons", []):
                if m in MODULES:
                    dossier, nom, titre, pages, leg = MODULES[m]
                    pdf = bb / "LIVRABLES" / dossier / f"{b['fichier']}_{nom}.pdf"
                    if pdf.exists():
                        bdecl.append({"titre": titre, "pdf": str(pdf), "pages": pages, "legende": leg})
            branches.append({"variantes": str(bb / "logos" / "variantes"), "images": str(bb / "IMAGES-CHATGPT"), "declinaisons": bdecl})
        chemins["branches"] = branches
        dossier_indd = ind
    else:
        dossier, nom, *_ = MODULES[module]
        dest = base / "LIVRABLES" / dossier
        dest.mkdir(parents=True, exist_ok=True)
        chemins.update(indd=str(dest / f"{marque}_{nom}.indd"), pdf=str(dest / f"{marque}_{nom}.pdf"),
                       pdf_impression=str(dest / f"{marque}_{nom}-IMPRESSION.pdf"), idml=str(dest / f"{marque}_{nom}.idml"))
        dossier_indd = dest
    polices(charte, base, dossier_indd)

    entete = ("var CHARTE = " + json.dumps(charte, ensure_ascii=True) + ";\n"
              "var CHEMINS = " + json.dumps(chemins, ensure_ascii=True) + ";\n")
    corps = (ICI / "indesign" / "lib.jsx").read_text(encoding="utf-8") + "\n" + \
            source_module(base, module).read_text(encoding="utf-8")
    fin = ('\ntry { main(); "OK\\n" + RAPPORT.join("\\n"); } '
           'catch (e) { try { fermer(); } catch (_) {} "ERREUR ligne " + e.line + " : " + e + "\\n" + RAPPORT.join("\\n"); }\n')
    jsx = ind / "scripts" / f"{module}.jsx"
    jsx.write_text("﻿" + entete + corps + fin, encoding="utf-8")
    print(f"→ InDesign : {module} …")
    res = lancer(jsx)
    print("  " + res.replace("\n", "\n  "))
    if apercu and res.startswith("OK") and Path(chemins["pdf"]).exists():
        c = base / "controle"
        c.mkdir(exist_ok=True)
        for v in c.glob(f"{module}-*.png"):
            v.unlink()
        pdf_vers_png(chemins["pdf"], c / module, dpi=40 if module == "charte" else 110)
        print(f"  aperçus : {c}/{module}-*.png")
    return res.startswith("OK")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dossier")
    ap.add_argument("module")
    ap.add_argument("--sans-apercu", action="store_true")
    a = ap.parse_args()
    application_indesign()
    charte, base = lire_charte(a.dossier)
    tous = modules(charte)
    if a.module not in ["charte", "declinaisons"] + list(tous):
        sys.exit(f"Module inconnu : {a.module} (connus : charte, declinaisons, {', '.join(tous)})")
    if a.module == "declinaisons":
        ok = True
        for m in charte.get("declinaisons", []):
            if m in tous:
                ok &= construire(base, charte, m, not a.sans_apercu)
        ok &= construire(base, charte, "charte", not a.sans_apercu)
    else:
        ok = construire(base, charte, a.module, not a.sans_apercu)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
