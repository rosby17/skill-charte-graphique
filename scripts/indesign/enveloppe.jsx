// Enveloppe DL 220 × 110 mm (avec ou sans fenêtre : la zone destinataire suit la norme fenêtre droite).

function finirDeclinaison() {
  controle(); D.save();
  exporterPDF(CHEMINS.pdf, "[High Quality Print]");
  exporterPDF(CHEMINS.pdf_impression, "[High Quality Print]", true);
  exporterIDML(CHEMINS.idml); fermer();
}

function main() {
  var C = CHARTE, M = C.marque, W = 220, H = 110;
  nouveauDocument(CHEMINS.indd, W, H, 1, 3);
  var formes = formesLogo(), fp = formes[0], p = D.pages[0];
  logo(p, fp, "couleur", 12, 10, 42, 15, { ancre: "gh" });
  texte(p, 12, 29, 80, 14, [M.nom_complet, C.adresse, M.site].join("\r").replace(/^\r+|\r+$/g, "").replace(/\r\r+/g, "\r"), { style: "05 — Légende" });
  texte(p, 120, 55, 90, 30, "Destinataire\rAdresse\rCode postal, Ville", { style: "04 — Texte courant", couleur: NU.texte, libelle: "Destinataire (fenêtre DL droite : 20 mm du bas, 20 mm du bord)" });
  rect(p, -3, H - 6, W + 6, 9, NU.principale);
  rect(p, -3, H - 7.2, W + 6, 1.2, NU.secondaire);
  finirDeclinaison();
}
