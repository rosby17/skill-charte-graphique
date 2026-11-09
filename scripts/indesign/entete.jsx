// Papier à en-tête A4 portrait : logo, coordonnées, zone de lettre éditable, pied de page.
// (Version Word/.dotx : voir references/declinaisons.md.)

function finirDeclinaison() {
  controle(); D.save();
  exporterPDF(CHEMINS.pdf, "[High Quality Print]");
  exporterPDF(CHEMINS.pdf_impression, "[High Quality Print]", true);
  exporterIDML(CHEMINS.idml); fermer();
}

function main() {
  var C = CHARTE, M = C.marque, W = 210, H = 297;
  nouveauDocument(CHEMINS.indd, W, H, 1, 3);
  var formes = formesLogo(), fp = formes[0], fs = formes[formes.length - 1], p = D.pages[0];
  var c = (C.contacts && C.contacts[0]) || {};
  var E = C.entete || {};
  if (!E.forme) {   // bandes verticales du modèle (absentes quand on reprend l'en-tête du client)
    rect(p, -3, -3, 8, H + 6, NU.principale);
    rect(p, 5, -3, 0.8, H + 6, NU.secondaire);
  }
  // charte.json → entete : { forme: "horizontal", filet_long: true } reprend un en-tête existant du client
  // (logo horizontal prolongé d'un long filet jusqu'au bord de la page, coordonnées sous le filet).
  var coord = [C.adresse, (c.telephones || []).join("  ·  "), (c.emails || [])[0], M.site];
  var lignes = []; for (var i = 0; i < coord.length; i++) if (coord[i]) lignes.push(coord[i]);
  if (E.forme && C.logos.formes[E.forme]) {
    var lg = logo(p, E.forme, "couleur", 20, 14, 72, 22, { ancre: "gh" });
    var gb = lg.geometricBounds, yf = gb[2] - 1.2;   // filet au niveau du bas du nom, comme l'en-tête d'origine
    if (E.filet_long) ligne(p, gb[3] + 8, yf, W + 3, yf, NU.principale, 0.7);
    texte(p, 110, gb[2] + 5, 80, 18, lignes.join("\r"), { style: "05 — Légende", align: "d", corps: 7.5, interligne: 10.5 });
  } else {
    logo(p, fp, "couleur", 20, 16, 52, 20, { ancre: "gh" });
    texte(p, 110, 17, 80, 22, lignes.join("\r"), { style: "05 — Légende", align: "d", corps: 7.5, interligne: 10.5 });
    ligne(p, 20, 44, 190, 44, NU.filet, 0.5);
  }
  texte(p, 120, E.forme ? 66 : 54, 70, 5, (M.ville || "Ville") + ", le …", { style: "04 — Texte courant", align: "d", couleur: NU.texte });
  texte(p, 20, E.forme ? 80 : 70, 170, 8, "Objet : …", { style: "03 — Intertitre", corps: 11 });
  texte(p, 20, E.forme ? 94 : 84, 170, 150, "Madame, Monsieur,\r\rVotre texte ici. Ce cadre est modifiable : tapez directement dedans dans InDesign.", { style: "04 — Texte courant", couleur: NU.texte });
  logo(p, fs, "couleur", 150, 228, 60, 60, {}).transparencySettings.blendingSettings.opacity = 5;
  ligne(p, 20, H - 18, 190, H - 18, NU.secondaire, 0.8);
  texte(p, 20, H - 14, 170, 5, [M.nom_complet || M.nom, C.adresse, M.site].join("   ·   ").replace(/(\s*·\s*)+$/,"").replace(/^(\s*·\s*)+/, ""), { style: "06 — Navigation", align: "c" });
  finirDeclinaison();
}
