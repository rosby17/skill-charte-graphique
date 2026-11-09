"""Outils partagés par les scripts du skill charte-graphique (sans dépendance hors numpy/pillow/opencv)."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.parse
from pathlib import Path

sys.dont_write_bytecode = True

CHROME_CANDIDATS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
]


def chrome():
    for c in CHROME_CANDIDATS:
        if os.path.exists(c):
            return c
    sys.exit("Google Chrome introuvable : il sert à rendre les SVG en PNG/PDF.")


def url_fichier(p):
    return "file://" + urllib.parse.quote(str(Path(p).resolve()))


def _profil():
    base = Path.home() / ".charte-graphique-cache"
    base.mkdir(exist_ok=True)
    return tempfile.mkdtemp(prefix="chrome-", dir=base)


def _lancer(args, sortie):
    """Lance Chrome ; Chrome plante parfois à la fermeture (« Teardown watchdog », code 2, nov. 2026) alors que
    le fichier est écrit : on n'échoue que si le fichier manque."""
    sortie = Path(sortie)
    avant = sortie.stat().st_mtime if sortie.exists() else None
    r = subprocess.run(args, capture_output=True)
    ok = sortie.exists() and sortie.stat().st_size > 0 and sortie.stat().st_mtime != avant
    if r.returncode and not ok:
        raise subprocess.CalledProcessError(r.returncode, args, r.stdout, r.stderr)


def chrome_pdf(html, pdf, attente_ms=4000):
    """HTML → PDF vectoriel (taille donnée par @page dans le HTML)."""
    prof = _profil()
    try:
        _lancer([chrome(), "--headless=new", f"--user-data-dir={prof}", "--disable-gpu",
                 "--allow-file-access-from-files", "--no-pdf-header-footer",
                        f"--virtual-time-budget={attente_ms}", f"--print-to-pdf={pdf}", url_fichier(html)], pdf)
    finally:
        shutil.rmtree(prof, ignore_errors=True)


def chrome_png(html, png, largeur, hauteur, transparent=True, echelle=1, attente_ms=3000):
    """HTML → PNG (fond transparent possible)."""
    prof = _profil()
    args = [chrome(), "--headless=new", f"--user-data-dir={prof}", "--disable-gpu", "--hide-scrollbars",
            "--allow-file-access-from-files", f"--window-size={largeur},{hauteur}",
            f"--force-device-scale-factor={echelle}", f"--virtual-time-budget={attente_ms}",
            f"--screenshot={png}"]
    if transparent:
        args.append("--default-background-color=00000000")
    try:
        _lancer(args + [url_fichier(html)], png)
    finally:
        shutil.rmtree(prof, ignore_errors=True)


def pdf_vers_png(pdf, prefixe, dpi=72, premiere=None, derniere=None):
    args = ["pdftoppm", "-r", str(dpi), "-png"]
    if premiere:
        args += ["-f", str(premiere)]
    if derniere:
        args += ["-l", str(derniere)]
    subprocess.run(args + [str(pdf), str(prefixe)], check=True)


def lire_charte(chemin):
    chemin = Path(chemin)
    if chemin.is_dir():
        chemin = chemin / "charte.json"
    with open(chemin, encoding="utf-8") as f:
        return json.load(f), chemin.parent


def ecrire_charte(donnees, chemin):
    chemin = Path(chemin)
    if chemin.is_dir():
        chemin = chemin / "charte.json"
    with open(chemin, "w", encoding="utf-8") as f:
        json.dump(donnees, f, ensure_ascii=False, indent=2)
        f.write("\n")


def hex_vers_rvb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def rvb_vers_hex(r, g, b):
    return "#%02X%02X%02X" % (int(r), int(g), int(b))


PROFILS_CMJN = [
    "/Library/Application Support/Adobe/Color/Profiles/Recommended/CoatedFOGRA39.icc",
    "/Library/ColorSync/Profiles/CoatedFOGRA39.icc",
    "/Library/Application Support/Adobe/Color/Profiles/Recommended/CoatedGRACoL2006.icc",
    "/System/Library/ColorSync/Profiles/Generic CMYK Profile.icc",
]
_transfo = None


def profil_cmjn():
    return next((p for p in PROFILS_CMJN if os.path.exists(p)), None)


def rvb_vers_cmjn(r, g, b):
    """sRGB → CMJN avec le profil d'impression Coated FOGRA39 (comme InDesign), intention colorimétrique
    relative + compensation du point noir. Repli sans profil : formule simple (indicative)."""
    global _transfo
    p = profil_cmjn()
    if p:
        try:
            from PIL import Image, ImageCms
            if _transfo is None:
                _transfo = ImageCms.buildTransform(ImageCms.createProfile("sRGB"), ImageCms.getOpenProfile(p),
                                                   "RGB", "CMYK", renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC,
                                                   flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)
            px = ImageCms.applyTransform(Image.new("RGB", (1, 1), (int(r), int(g), int(b))), _transfo).getpixel((0, 0))
            return [round(v / 255 * 100) for v in px]
        except Exception:
            pass
    r, g, b = r / 255, g / 255, b / 255
    k = 1 - max(r, g, b)
    if k >= 1:
        return [0, 0, 0, 100]
    c = (1 - r - k) / (1 - k)
    m = (1 - g - k) / (1 - k)
    y = (1 - b - k) / (1 - k)
    return [round(v * 100) for v in (c, m, y, k)]


def luminance(rvb):
    def canal(v):
        v = v / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (canal(v) for v in rvb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)
