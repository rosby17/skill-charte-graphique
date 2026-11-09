// Badge format carte CR80 (54 × 86 mm, portrait), recto nominatif + verso.

function finirDeclinaison() {
  controle(); D.save();
  exporterPDF(CHEMINS.pdf, "[High Quality Print]");
  exporterPDF(CHEMINS.pdf_impression, "[High Quality Print]", true);
  exporterIDML(CHEMINS.idml); fermer();
}

function main() {
  var C = CHARTE, M = C.marque, W = 54, H = 86;
  nouveauDocument(CHEMINS.indd, W, H, 2, 2);
  var formes = formesLogo(), fp = formes[0], fs = formes[formes.length - 1];
  var c = (C.contacts && C.contacts[0]) || { nom: "Prénom NOM", fonction: "Fonction" };
  var p = D.pages[0];
  rect(p, -2, -2, W + 4, H + 4, NU.papier);
  rect(p, -2, -2, W + 4, 24, NU.principale);
  rect(p, -2, 22, W + 4, 1, NU.secondaire);
  logo(p, fp, C.logos.couleur_sombre_a_inverser ? "negatif" : "blanc", 8, 6, W - 16, 12, {});
  var ph = ovale(p, W / 2 - 13, 29, 26, 26, teinte(C.couleurs[0].nom, 10), { contour: NU.accent, epaisseur: 1 });
  ph.label = "PHOTO";
  texte(p, W / 2 - 10, 40, 20, 4, "Photo", { style: "05 — Légende", align: "c" });
  texte(p, 4, 60, W - 8, 6, c.nom, { style: "03 — Intertitre", corps: 11, align: "c" });
  texte(p, 4, 67, W - 8, 4, c.fonction || "", { style: "02 — Surtitre", corps: 5.5, align: "c" });
  rect(p, -2, H - 7, W + 4, 9, NU.principale);
  p = D.pages[1];
  rect(p, -2, -2, W + 4, H + 4, NU.principale);
  logo(p, fs, "blanc", W / 2 - 12, 24, 24, 24, {});
  texte(p, 5, 58, W - 10, 22, "Ce badge est personnel.\rEn cas de perte, merci de le retourner à " + (M.nom_complet || M.nom) + (C.adresse ? ", " + C.adresse : "") + ".",
    { style: "05 — Légende", couleur: NU.papier, align: "c" });
  finirDeclinaison();
}
