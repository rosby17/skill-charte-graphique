// Kakemono / roll-up 85 × 200 cm, construit à l'échelle 1/10 (85 × 200 mm) : l'imprimeur agrandit × 10.
// L'image principale vient de ChatGPT (cadre « IMG:kakemono-visuel.png »), une image en 1/10 doit faire ≥ 3000 px de haut.

function finirDeclinaison() {
  controle(); D.save();
  exporterPDF(CHEMINS.pdf, "[High Quality Print]");
  exporterPDF(CHEMINS.pdf_impression, "[High Quality Print]", true);
  exporterIDML(CHEMINS.idml); fermer();
}

function main() {
  var C = CHARTE, M = C.marque, W = 85, H = 200;
  nouveauDocument(CHEMINS.indd, W, H, 1, 1);
  var formes = formesLogo(), fp = formes[0], fs = formes[formes.length - 1], p = D.pages[0];
  rect(p, -1, -1, W + 2, H + 2, NU[C.couleur_fond_clair] || NU.papier);
  logo(p, fp, "couleur", 12, 14, W - 24, 24, {});
  texte(p, 8, 44, W - 16, 16, M.slogan || "Votre message principal en une phrase", { style: "01 — Titre de page", corps: 15, interligne: 18, align: "c" });
  image(p, "kakemono-visuel.png", -1, 66, W + 2, 88, "Visuel principal du kakemono");
  rect(p, -1, 154, W + 2, 47, NU.principale);
  rect(p, -1, 153, W + 2, 1.2, NU.secondaire);
  var c = (C.contacts && C.contacts[0]) || {};
  texte(p, 8, 164, W - 16, 22, [M.site, (c.telephones || [])[0], C.adresse].join("\r").replace(/^\r+|\r+$/g, "").replace(/\r\r+/g, "\r"),
    { style: "03 — Intertitre", corps: 9, interligne: 13, couleur: NU.papier, align: "c" });
  logo(p, fs, "blanc", W / 2 - 6, 186, 12, 10, {});
  finirDeclinaison();
}
