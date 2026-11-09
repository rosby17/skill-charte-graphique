#!/usr/bin/env python3
"""Vectorise un logo (PNG/JPG d'aperçu validé, ChatGPT…) en SVG propre, une couche par couleur.

Méthode (mise au point sur ATLAS, octobre 2026) :
  1. fond détecté sur les bords (ou transparence) ;
  2. palette : imposée (--couleurs) ou trouvée par k-moyennes, couleurs voisines fusionnées ;
  3. chaque pixel est rattaché à la couleur qui l'explique le mieux (mélange fond ↔ couleur = antialiasing) ;
  4. couches empilées de la plus grande à la plus petite, chaque couche englobant celles du dessus
     (aucun liseré blanc entre deux couleurs) ;
  5. suréchantillonnage, contour à 50 %, simplification, courbes de Bézier lissées (angles vifs gardés).

Usage :
  vectoriser.py logo.png -o logos/principal.svg
  vectoriser.py logo.png -o logo.svg --couleurs "#0B2A5B,#C8102E" --recadrer --marge 0.04
  vectoriser.py logo.png -o logo.svg --n 3 --controle controle.png   (planche avant/après)
"""
import argparse
import math
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))

import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:
    sys.exit("OpenCV manquant : lance outils/installer.sh puis utilise ~/.charte-graphique-venv/bin/python")

from commun import hex_vers_rvb, rvb_vers_hex


def fond_auto(rgb, alpha):
    if alpha is not None and (alpha < 250).mean() > 0.05:
        return None  # transparent
    bord = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    return np.median(bord, axis=0)


def palette_auto(px, n, fond):
    loin = px[np.linalg.norm(px - fond, axis=1) > 90] if fond is not None else px
    if len(loin) < 50:
        sys.exit("Aucune couleur trouvée en dehors du fond.")
    ech = loin[np.random.default_rng(0).choice(len(loin), min(len(loin), 60000), replace=False)].astype(np.float32)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 50, 0.5)
    _, etiq, centres = cv2.kmeans(ech, n, None, crit, 5, cv2.KMEANS_PP_CENTERS)
    poids = np.bincount(etiq.ravel(), minlength=n)
    ordre = np.argsort(-poids)
    def sur_segment(c, a, b):
        """Distance de c au segment a-b (c n'est qu'un mélange de a et b ?)."""
        v = b - a
        t = np.clip(((c - a) @ v) / (v @ v), 0, 1)
        return np.linalg.norm(c - (a + t * v))

    # les couleurs les plus « saturées » (loin du fond) d'abord : les mélanges arrivent après et sont rejetés
    ordre = sorted((i for i in ordre if poids[i] >= 0.01 * len(ech)),
                   key=lambda i: -(np.linalg.norm(centres[i] - fond) if fond is not None else poids[i]))
    gardes = []
    for i in ordre:
        c = centres[i]
        if any(np.linalg.norm(c - g) < 45 for g in gardes):
            continue
        extremites = gardes + ([fond] if fond is not None else [])
        if any(sur_segment(c, p, q) < 22 for j, p in enumerate(extremites) for q in extremites[j + 1:]):
            continue  # simple mélange (antialiasing) entre le fond et une couleur, ou entre deux couleurs
        gardes.append(c)
    # recentrer chaque couleur sur les pixels « purs » (cœur des aplats, pas l'antialiasing)
    pal = []
    for c in gardes:
        proches = loin[np.linalg.norm(loin - c, axis=1) < 35]
        pal.append(np.median(proches, axis=0) if len(proches) > 20 else c)
    return np.array(pal, dtype=float)


def couvertures(rgb, alpha, fond, pal):
    """Pour chaque couleur : part du pixel qu'elle occupe (0..1)."""
    h, w, _ = rgb.shape
    p = rgb.reshape(-1, 3).astype(float)
    k = len(pal)
    cov = np.zeros((k, h * w))
    if fond is None:  # logo détouré : la transparence donne la couverture, la couleur choisit la couche
        a = alpha.reshape(-1) / 255.0
        d = np.stack([np.linalg.norm(p - c, axis=1) for c in pal])
        choix = d.argmin(0)
        cov[choix, np.arange(h * w)] = a
    else:
        res = []
        ts = []
        for c in pal:
            v = c - fond
            t = np.clip(((p - fond) @ v) / (v @ v), 0, 1)
            proj = fond + t[:, None] * v
            res.append(np.linalg.norm(p - proj, axis=1))
            ts.append(t)
        res = np.stack(res); ts = np.stack(ts)
        res[ts < 0.05] = 1e9
        choix = res.argmin(0)
        idx = np.arange(h * w)
        cov[choix, idx] = ts[choix, idx]
        # pixel mélangé entre deux couleurs (pas avec le fond) : couverture pleine pour la plus proche
        loin_fond = np.linalg.norm(p - fond, axis=1) > 0.8 * min(np.linalg.norm(c - fond) for c in pal)
        cov[choix[loin_fond], idx[loin_fond]] = 1.0
    return cov.reshape(k, h, w)


def lisser_contour(pts, angle_vif=55):
    """Polygone simplifié → chemin SVG en Bézier (Catmull-Rom), angles vifs conservés."""
    n = len(pts)
    if n < 3:
        return ""
    def angle(i):
        a, b, c = pts[i - 1], pts[i], pts[(i + 1) % n]
        v1, v2 = b - a, c - b
        n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
        if n1 == 0 or n2 == 0:
            return 0
        return math.degrees(math.acos(max(-1, min(1, (v1 @ v2) / (n1 * n2)))))
    vifs = [angle(i) > angle_vif for i in range(n)]
    d = [f"M{pts[0][0]:.2f} {pts[0][1]:.2f}"]
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        if vifs[i] and vifs[(i + 1) % n]:
            d.append(f"L{p2[0]:.2f} {p2[1]:.2f}")
            continue
        t1 = (p2 - p0) / 6 if not vifs[i] else (p2 - p1) / 3
        t2 = (p3 - p1) / 6 if not vifs[(i + 1) % n] else (p2 - p1) / 3
        c1, c2 = p1 + t1, p2 - t2
        d.append(f"C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}")
    return "".join(d) + "Z"


def tracer(alpha, sur, tol, aire_min, ox=0.0, oy=0.0):
    h, w = alpha.shape
    grand = cv2.resize(alpha.astype(np.float32), (w * sur, h * sur), interpolation=cv2.INTER_CUBIC)
    masque = (grand >= 0.5).astype(np.uint8)
    contours, _ = cv2.findContours(masque, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    morceaux = []
    for c in contours:
        if abs(cv2.contourArea(c)) < aire_min * sur * sur:
            continue
        s = cv2.approxPolyDP(c, tol * sur, True).reshape(-1, 2).astype(float)
        s = (s + 0.5) / sur - 0.5
        s[:, 0] += ox; s[:, 1] += oy
        morceaux.append(lisser_contour(s))
    return " ".join(m for m in morceaux if m)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    ap.add_argument("-o", "--sortie", required=True)
    ap.add_argument("--couleurs", help="palette imposée, ex. \"#0B2A5B,#C8102E\" (sinon automatique)")
    ap.add_argument("--n", type=int, default=5, help="nombre maximal de couleurs en automatique")
    ap.add_argument("--fond", default="auto", help="auto, transparent ou #RRGGBB")
    ap.add_argument("--sur", type=int, default=4, help="suréchantillonnage (4 par défaut)")
    ap.add_argument("--tol", type=float, default=0.35, help="tolérance de simplification en pixels d'origine")
    ap.add_argument("--lisser", type=float, default=0.6, help="flou avant tracé (pixels)")
    ap.add_argument("--aire-min", type=float, default=6, help="surface minimale d'une forme (px²)")
    ap.add_argument("--recadrer", action="store_true", help="viewBox ajustée au logo")
    ap.add_argument("--marge", type=float, default=0.0, help="marge autour du logo recadré (part de la plus grande dimension)")
    ap.add_argument("--controle", help="PNG de contrôle : original | vecteur | superposition")
    a = ap.parse_args()

    im = Image.open(a.image)
    rgba = np.asarray(im.convert("RGBA")).astype(float)
    rgb, alpha = rgba[..., :3], rgba[..., 3]
    if a.fond == "transparent":
        fond = None
    elif a.fond == "auto":
        fond = fond_auto(rgb, alpha)
    else:
        fond = np.array(hex_vers_rvb(a.fond), float)
    if fond is not None and (alpha < 250).any():  # aplatir la transparence sur le fond
        rgb = rgb * (alpha[..., None] / 255) + fond * (1 - alpha[..., None] / 255)

    px = rgb.reshape(-1, 3)
    pal = (np.array([hex_vers_rvb(c) for c in a.couleurs.split(",")], float) if a.couleurs
           else palette_auto(px, a.n, fond))
    cov = couvertures(rgb, alpha, fond, pal)
    aires = cov.sum(axis=(1, 2))
    ordre = np.argsort(-aires)                       # la plus grande couche d'abord (dessous)
    h, w = rgb.shape[:2]

    x0, y0, x1, y1 = 0, 0, w, h
    if a.recadrer:
        tout = cov.sum(0) > 0.3
        ys, xs = np.nonzero(tout)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        m = a.marge * max(x1 - x0, y1 - y0)
        x0, y0, x1, y1 = x0 - m, y0 - m, x1 + m, y1 + m

    couches = []
    for rang, i in enumerate(ordre):
        dessus = ordre[rang:]
        al = np.clip(cov[dessus].sum(0), 0, 1)       # la couche englobe celles du dessus
        if a.lisser > 0:
            al = cv2.GaussianBlur(al.astype(np.float32), (0, 0), a.lisser)
        d = tracer(al, a.sur, a.tol, a.aire_min, -x0, -y0)
        if d:
            couches.append((rvb_vers_hex(*pal[i]), d))

    W, H = x1 - x0, y1 - y0
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W:.0f}" height="{H:.0f}">']
    for couleur, d in couches:
        svg.append(f'  <path data-couleur="{couleur}" fill="{couleur}" fill-rule="evenodd" d="{d}"/>')
    svg.append("</svg>")
    Path(a.sortie).parent.mkdir(parents=True, exist_ok=True)
    Path(a.sortie).write_text("\n".join(svg) + "\n", encoding="utf-8")
    print(f"{a.sortie} : {len(couches)} couche(s) {', '.join(c for c, _ in couches)} — {W:.0f}×{H:.0f}")

    if a.controle:
        from commun import chrome_png
        import tempfile
        html = Path(tempfile.mkdtemp()) / "c.html"
        img = Path(a.image).resolve()
        html.write_text(f'''<html><body style="margin:0;background:#fff;display:flex">
<div style="position:relative;width:{W:.0f}px;height:{H:.0f}px;overflow:hidden"><img src="file://{img}" style="position:absolute;left:{-x0:.1f}px;top:{-y0:.1f}px"></div>
<div style="width:{W:.0f}px;height:{H:.0f}px"><img src="file://{Path(a.sortie).resolve()}" width="{W:.0f}" height="{H:.0f}"></div>
<div style="position:relative;width:{W:.0f}px;height:{H:.0f}px;overflow:hidden"><img src="file://{img}" style="position:absolute;left:{-x0:.1f}px;top:{-y0:.1f}px;opacity:.5">
<img src="file://{Path(a.sortie).resolve()}" width="{W:.0f}" height="{H:.0f}" style="position:absolute;left:0;top:0;opacity:.5;mix-blend-mode:multiply"></div></body></html>''')
        chrome_png(html, Path(a.controle).resolve(), int(W * 3), int(H), transparent=False)
        print("contrôle :", a.controle)


if __name__ == "__main__":
    main()
