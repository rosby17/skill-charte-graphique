// Carte de visite 85 × 55 mm, recto/verso, fond perdu 3 mm. Un recto par personne de charte.json (contacts[]).
// Mise en page de départ, sobre : à affiner ensuite à la main ou en reproduisant fidèlement un aperçu validé
// (références : fidelite-apercu.md).

function finirDeclinaison() {
  controle();
  D.save();
  exporterPDF(CHEMINS.pdf, "[High Quality Print]");
  exporterPDF(CHEMINS.pdf_impression, "[High Quality Print]", true);
  exporterIDML(CHEMINS.idml);
  fermer();
}

function lignesContact(c) {
  var l = [];
  for (var i = 0; i < (c.telephones || []).length; i++) l.push(c.telephones[i]);
  for (i = 0; i < (c.emails || []).length; i++) l.push(c.emails[i]);
  if (CHARTE.marque.site) l.push(CHARTE.marque.site);
  return l;
}

function main() {
  var C = CHARTE, W = 85, H = 55;
  var contacts = C.contacts && C.contacts.length ? C.contacts : [{ nom: "Prénom NOM", fonction: "Fonction", telephones: ["+225 00 00 00 00 00"], emails: ["prenom.nom@exemple.com"] }];
  nouveauDocument(CHEMINS.indd, W, H, contacts.length + 1, 3);
  var formes = formesLogo(), fp = formes[0], fs = formes[formes.length - 1];
  var fondClair = NU[C.couleur_fond_clair] || NU.papier;

  for (var k = 0; k < contacts.length; k++) {
    var c = contacts[k], p = D.pages[k];
    rect(p, -3, -3, W + 6, H + 6, fondClair);
    rect(p, W - 14, -3, 17, H + 6, NU.principale);
    rect(p, W - 15.2, -3, 1.2, H + 6, NU.secondaire);
    logo(p, fs, "blanc", W - 12, H / 2 - 5, 8, 10, {});
    logo(p, fp, "couleur", 6, 6, 32, 11, { ancre: "gh" });
    texte(p, 6, 22, 60, 6, c.nom, { style: "01 — Titre de page", corps: 12.5, interligne: 14 });
    rect(p, 6, 29.2, 10, 0.35, NU.accent);
    texte(p, 6, 31, 60, 3, c.fonction || "", { style: "02 — Surtitre", corps: 5.6, interligne: 7 });
    texte(p, 6, 37, 62, 14, lignesContact(c).join("\r"), { style: "04 — Texte courant", corps: 6.6, interligne: 8.4, couleur: NU.texte });
  }
  // Verso commun
  p = D.pages[contacts.length];
  rect(p, -3, -3, W + 6, H + 6, NU.principale);
  logo(p, fs, "blanc", W - 40, -8, 60, 60, {}).transparencySettings.blendingSettings.opacity = 8;
  logo(p, fp, C.logos.couleur_sombre_a_inverser ? "negatif" : "blanc", 12, 14, W - 24, 20, {});
  if (C.marque.site || C.marque.slogan) texte(p, 6, H - 11, W - 12, 4, C.marque.slogan || C.marque.site, { style: "02 — Surtitre", corps: 6, couleur: NU.accent, align: "c" });
  finirDeclinaison();
}
