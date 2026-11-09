// Bibliothèque InDesign du skill charte-graphique (ExtendScript, InDesign 2020+).
// Reprend les acquis des chartes Marque A (lib.jsx), Marque B V6 (styles, calques, gabarits) et Marque C (carte de visite).
// Conventions :
//   - géométrie en MILLIMÈTRES (unités de règle du document), tailles de texte en POINTS (jamais scriptPreferences.measurementUnit) ;
//   - positions données en (x, y, largeur, hauteur) depuis le coin haut-gauche de la page ;
//   - tout texte est éditable, posé sur le calque « 03 — Textes éditables » avec un style de paragraphe nommé ;
//   - nuances RVB nommées « <MARQUE> <nom> » (valeurs rvb de charte.json ; le CMJN reste une indication dans la charte) ;
//   - les cadres d'images attendues portent le libellé « IMG:<fichier> » (remplis par placer_images).
// Variables fournies par indesign.py avant ce fichier : CHARTE (charte.json enrichi), CHEMINS (dossiers absolus).

var D = null;               // document en cours
var CAL = {};               // calques
var NU = {};                // nuances par nom de charte + "papier", "noir", "aucune"
var ST = {};                // styles de paragraphe par nom
var RAPPORT = [];           // compte rendu renvoyé à indesign.py
var MARQUE = CHARTE.marque.nom;

function note(t) { RAPPORT.push(t); }

// ---------- Document ----------
function nouveauDocument(fichier, largeurMM, hauteurMM, nbPages, fondPerduMM) {
  app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
  for (var i = app.documents.length - 1; i >= 0; i--) {
    try { if (app.documents[i].saved && app.documents[i].fullName.fsName == File(fichier).fsName) app.documents[i].close(SaveOptions.NO); } catch (e) {}
  }
  // Créer, enregistrer, fermer, rouvrir : les polices du dossier « Document fonts » deviennent actives.
  var d = app.documents.add(false);
  d.save(File(fichier));
  d.close(SaveOptions.NO);
  D = app.open(File(fichier), false);
  with (D.documentPreferences) {
    facingPages = false;
    pageWidth = largeurMM + "mm"; pageHeight = hauteurMM + "mm";
    pagesPerDocument = nbPages || 1;
    documentBleedUniformSize = true;
    documentBleedTopOffset = (fondPerduMM || 0) + "mm";
  }
  D.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
  D.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
  D.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
  D.zeroPoint = [0, 0];
  D.marginPreferences.top = D.marginPreferences.bottom = D.marginPreferences.left = D.marginPreferences.right = 0;
  try { D.transparencyPreferences.blendingSpace = BlendingSpace.RGB; } catch (e) {}   // 04/11 : jamais de CMJN, il ternit les couleurs validées
  // Calques
  var noms = ["01 — Fonds", "02 — Logos et images", "03 — Textes éditables"];
  // Piège : D.layers[0] est réévalué à chaque ajout de calque → toujours viser les calques PAR NOM.
  D.layers[0].name = noms[0];
  D.layers.add({ name: noms[1] });
  D.layers.add({ name: noms[2] });
  CAL.fond = D.layers.itemByName(noms[0]);
  CAL.image = D.layers.itemByName(noms[1]);
  CAL.texte = D.layers.itemByName(noms[2]);
  CAL.texte.move(LocationOptions.AT_BEGINNING);
  CAL.image.move(LocationOptions.AFTER, CAL.texte);
  CAL.fond.move(LocationOptions.AT_END);
  nuancier();
  styles();
  return D;
}

function enregistrer(pdf, preset) {
  D.save();
  if (pdf) exporterPDF(pdf, preset);
}

function exporterPDF(pdf, preset, traits) {
  // Toujours « [High Quality Print] » sans conversion des couleurs : les PDF/X (X-1a, X-4) convertissent en CMJN
  // ou simulent la presse, et le client voit un bleu terne (Marque C, 04/11). L'imprimeur reçoit du RVB.
  try {
    var pr = app.pdfExportPresets.itemByName("[High Quality Print]").properties;
    delete pr.name; delete pr.parent; delete pr.id; delete pr.index;
    for (var k in pr) try { app.pdfExportPreferences[k] = pr[k]; } catch (e) {}
  } catch (e) {}
  with (app.pdfExportPreferences) {
    pageRange = PageRange.ALL_PAGES; useDocumentBleedWithPDF = true; includeHyperlinks = true; includeBookmarks = true;
    cropMarks = !!traits; bleedMarks = false; registrationMarks = false; colorBars = false; pageInformationMarks = false;
    pageMarksOffset = "3mm";
    pdfColorSpace = PDFColorSpace.UNCHANGED_COLOR_SPACE;
  }
  D.exportFile(ExportFormat.PDF_TYPE, File(pdf), false);
}

function exporterIDML(idml) { D.exportFile(ExportFormat.INDESIGN_MARKUP, File(idml)); }

function fermer() { try { D.close(SaveOptions.NO); } catch (e) {} D = null; }

// ---------- Couleurs ----------
function nuance(nom, rvb) {
  var n = MARQUE + " " + nom;
  var c = D.colors.itemByName(n);
  if (!c.isValid) c = D.colors.add({ name: n, model: ColorModel.PROCESS, space: ColorSpace.RGB, colorValue: rvb });
  else { c.space = ColorSpace.RGB; c.colorValue = rvb; }
  return c;
}

function nuancier() {
  NU = { papier: D.swatches.itemByName("Paper"), noir: D.swatches.itemByName("Black"), aucune: D.swatches.itemByName("None") };
  NU.blanc = NU.papier;
  for (var i = 0; i < CHARTE.couleurs.length; i++) {
    var c = CHARTE.couleurs[i];
    NU[c.nom] = nuance(c.nom, c.rvb || hexVersRvb(c.hex));
    if (c.role == "principale" && !NU.principale) NU.principale = NU[c.nom];
    if (c.role == "secondaire" && !NU.secondaire) NU.secondaire = NU[c.nom];
    if (c.role == "accent" && !NU.accent) NU.accent = NU[c.nom];
  }
  NU.principale = NU.principale || NU[CHARTE.couleurs[0].nom];
  NU.secondaire = NU.secondaire || NU.principale;
  NU.accent = NU.accent || NU.secondaire;
  NU.texte = NU[CHARTE.couleur_texte] || NU.principale;
  NU.gris = nuance("Gris interface", [138, 138, 138]);
  NU.filet = nuance("Gris filet", [218, 218, 218]);
  NU.rouge = nuance("Contrôle rouge", [227, 61, 57]);
}

function hexVersRvb(h) {
  h = String(h).replace("#", "");
  return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
}

function teinte(nom, pourcent) {
  var c = CHARTE.couleurs, base = null;
  for (var i = 0; i < c.length; i++) if (c[i].nom == nom) base = c[i];
  var v = [];
  var rvb = base.rvb || hexVersRvb(base.hex);
  for (var j = 0; j < 3; j++) v.push(Math.round(255 - (255 - rvb[j]) * pourcent / 100));   // teinte = mélange avec le blanc
  return nuance(nom + " " + pourcent + " %", v);
}

// ---------- Polices et styles ----------
function police(famille, style) {
  var essais = [[famille, style], [famille, "Regular"], [famille, "Book"], ["Minion Pro", "Regular"], ["Arial", "Regular"]];
  for (var i = 0; i < essais.length; i++) {
    var f = app.fonts.itemByName(essais[i][0] + "\t" + essais[i][1]);
    if (f.isValid) {
      if (i > 0 && !police["_" + famille + style]) { note("Police absente : " + famille + " " + style + " → " + essais[i].join(" ")); police["_" + famille + style] = 1; }
      return f;
    }
  }
  return app.fonts[0];
}

function familleDe(role) { var t = CHARTE.typographies[role]; return t ? t.famille : "Minion Pro"; }

function style(nom, o) {
  var s = D.paragraphStyles.itemByName(nom);
  if (!s.isValid) s = D.paragraphStyles.add({ name: nom });
  s.appliedFont = police(o.famille, o.style || "Regular");
  s.pointSize = o.corps;
  s.leading = o.interligne || o.corps * 1.2;
  s.fillColor = o.couleur || NU.texte;
  s.tracking = o.approche || 0;
  s.capitalization = o.capitales ? Capitalization.ALL_CAPS : Capitalization.NORMAL;
  s.hyphenation = false;
  s.spaceAfter = o.apres || 0;
  if (o.base) s.basedOn = o.base;
  ST[nom] = s;
  return s;
}

function styles() {
  var T = familleDe("titres"), X = familleDe("texte");
  var GT = (CHARTE.typographies.titres || {}).graisse || "SemiBold";   // graisse des titres (ex. « Bold » pour Neue Montreal)
  style("00 — Base", { famille: X, style: "Regular", corps: 10, interligne: 15 });
  var h = CHARTE.hierarchie || [];
  for (var i = 0; i < h.length; i++) {
    var n = h[i];
    style("Hiérarchie — " + n.niveau, { famille: familleDe(n.police), style: n.style, corps: n.corps, interligne: n.interligne,
      capitales: n.capitales, approche: n.approche || 0 });
  }
  style("01 — Titre de page", { famille: T, style: GT, corps: 30, interligne: 34 });
  style("01 — Grand titre", { famille: T, style: GT, corps: 54, interligne: 58, couleur: NU.papier });
  var GS = (CHARTE.typographies.texte || {}).graisse_surtitre || "SemiBold";   // graisse des surtitres (ex. « Bold » si la police n’a pas de SemiBold)
  style("02 — Surtitre", { famille: X, style: GS, corps: 8.5, interligne: 11, capitales: true, approche: 180, couleur: NU.secondaire });
  style("03 — Intertitre", { famille: T, style: GT, corps: 14, interligne: 18 });
  style("04 — Texte courant", { famille: X, style: "Regular", corps: 10, interligne: 15, couleur: NU.gris, apres: 2 });
  style("05 — Légende", { famille: X, style: "Regular", corps: 7.5, interligne: 10, couleur: NU.gris });
  style("06 — Navigation", { famille: X, style: "Medium", corps: 7, interligne: 9, capitales: true, approche: 120, couleur: NU.gris });
  style("07 — Chiffre", { famille: T, style: GT, corps: 72, interligne: 72, couleur: NU.accent });
  style("08 — Code couleur", { famille: X, style: "Regular", corps: 8.5, interligne: 12.5, couleur: NU.texte });
}

// ---------- Primitives (mm) ----------
function bornes(x, y, l, h) { return [y, x, y + h, x + l]; }

function rect(page, x, y, l, h, couleur, o) {
  o = o || {};
  var r = page.rectangles.add(o.calque || CAL.fond);
  r.geometricBounds = bornes(x, y, l, h);
  r.fillColor = couleur || NU.aucune;
  // l'épaisseur AVANT la couleur : « Aucune » puis 0 pt remet un filet noir de 1 pt (InDesign 2025)
  if (o.contour) { r.strokeColor = o.contour; r.strokeWeight = o.epaisseur || 0.5; }
  else { r.strokeWeight = 0; r.strokeColor = NU.aucune; }
  if (o.pointilles) r.strokeType = "Dashed";
  if (o.rayon) { r.topLeftCornerOption = r.topRightCornerOption = r.bottomLeftCornerOption = r.bottomRightCornerOption = CornerOptions.ROUNDED_CORNER;
    r.topLeftCornerRadius = r.topRightCornerRadius = r.bottomLeftCornerRadius = r.bottomRightCornerRadius = o.rayon + "mm"; }
  if (o.opacite !== undefined) r.transparencySettings.blendingSettings.opacity = o.opacite;
  if (o.libelle) r.label = o.libelle;
  return r;
}

function ovale(page, x, y, l, h, couleur, o) {
  o = o || {};
  var r = page.ovals.add(o.calque || CAL.fond);
  r.geometricBounds = bornes(x, y, l, h);
  r.fillColor = couleur || NU.aucune;
  if (o.contour) { r.strokeColor = o.contour; r.strokeWeight = o.epaisseur || 0.5; } else { r.strokeWeight = 0; r.strokeColor = NU.aucune; }
  return r;
}

function ligne(page, x1, y1, x2, y2, couleur, epaisseur, o) {
  o = o || {};
  var l = page.graphicLines.add(o.calque || CAL.fond);
  l.paths[0].pathPoints[0].anchor = [x1, y1];
  l.paths[0].pathPoints[1].anchor = [x2, y2];
  l.strokeColor = couleur || NU.filet; l.strokeWeight = (epaisseur || 0.5) + "pt";
  if (o.pointilles) l.strokeType = "Dashed";
  if (o.fleches) { l.leftLineEnd = ArrowHead.SIMPLE_ARROW_HEAD; l.rightLineEnd = ArrowHead.SIMPLE_ARROW_HEAD; }
  return l;
}

// Texte éditable. o : style (nom), couleur, corps, align ("g"/"c"/"d"), vertical ("h"/"c"/"b"), auto (hauteur auto)
function texte(page, x, y, l, h, contenu, o) {
  o = o || {};
  var t = page.textFrames.add(CAL.texte);
  t.geometricBounds = bornes(x, y, l, h);
  t.contents = contenu || "";
  t.textFramePreferences.insetSpacing = [0, 0, 0, 0];
  t.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
  if (o.vertical) t.textFramePreferences.verticalJustification =
    o.vertical == "c" ? VerticalJustification.CENTER_ALIGN : (o.vertical == "b" ? VerticalJustification.BOTTOM_ALIGN : VerticalJustification.TOP_ALIGN);
  var s = t.parentStory;
  s.appliedParagraphStyle = ST[o.style || "04 — Texte courant"];
  if (o.couleur) s.fillColor = o.couleur;
  if (o.corps) { s.pointSize = o.corps; s.leading = o.interligne || o.corps * 1.2; }
  if (o.police) s.appliedFont = police(o.police[0], o.police[1]);
  if (o.approche !== undefined) s.tracking = o.approche;
  if (o.capitales) s.capitalization = Capitalization.ALL_CAPS;
  if (o.align) s.justification = o.align == "c" ? Justification.CENTER_ALIGN : (o.align == "d" ? Justification.RIGHT_ALIGN : Justification.LEFT_ALIGN);
  if (o.auto) { t.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT; t.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY; }
  if (o.libelle) t.label = o.libelle;
  return t;
}

function aCompleter(v, quoi) { return (v && String(v).length) ? v : "À compléter : " + quoi; }

// Place un fichier (PDF de logo, image) dans une boîte : "contenir" (défaut, centré) ou "remplir"
function placer(page, fichier, x, y, l, h, o) {
  o = o || {};
  var f = File(fichier);
  if (!f.exists) { note("Fichier absent : " + fichier); return null; }
  app.pdfPlacePreferences.pdfCrop = PDFCrop.CROP_MEDIA;
  app.pdfPlacePreferences.pageNumber = o.page || 1;
  var r = page.rectangles.add(o.calque || CAL.image);
  r.geometricBounds = bornes(x, y, l, h);
  r.strokeWeight = 0; r.fillColor = NU.aucune; r.strokeColor = NU.aucune;
  r.place(f);
  r.fit(o.mode == "remplir" ? FitOptions.FILL_PROPORTIONALLY : FitOptions.PROPORTIONALLY);
  if (o.mode != "remplir") {
    r.fit(FitOptions.FRAME_TO_CONTENT);
    var gb = r.geometricBounds, lw = gb[3] - gb[1], lh = gb[2] - gb[0];
    var ax = o.ancre || "c";
    var nx = ax.indexOf("g") >= 0 ? x : (ax.indexOf("d") >= 0 ? x + l - lw : x + (l - lw) / 2);
    var ny = ax.indexOf("h") >= 0 ? y : (ax.indexOf("b") >= 0 ? y + h - lh : y + (h - lh) / 2);
    r.move([nx, ny]);
  } else r.fit(FitOptions.CENTER_CONTENT);
  if (o.libelle) r.label = o.libelle;
  return r;
}

// Logo d'une forme et d'une version ("couleur", "negatif", "blanc", "noir", "mono", "faux")
function cheminLogo(forme, version) { return CHEMINS.variantes + "/" + forme + "-" + (version || "couleur") + ".pdf"; }
function logo(page, forme, version, x, y, l, h, o) { return placer(page, cheminLogo(forme, version), x, y, l, h, o); }
function formesLogo() { var r = []; for (var k in CHARTE.logos.formes) r.push(k); return r; }

// Cadre d'image attendue (ChatGPT) : placée si le fichier existe, sinon un cadre clair « Image à générer »
function image(page, fichier, x, y, l, h, legende) {
  var chemin = CHEMINS.images + "/" + fichier;
  if (File(chemin).exists) return placer(page, chemin, x, y, l, h, { mode: "remplir", libelle: "IMG:" + fichier });
  var r = rect(page, x, y, l, h, teinte(CHARTE.couleurs[0].nom, 8), { calque: CAL.image, libelle: "IMG:" + fichier });
  texte(page, x + 6, y + h / 2 - 8, l - 12, 16, "Image à générer : " + fichier + (legende ? "\r" + legende : ""),
    { style: "05 — Légende", align: "c", vertical: "c", libelle: "PH:" + fichier });
  note("Image attendue : " + fichier);
  return r;
}

// Croix rouge (page des interdits)
function croix(page, x, y, t) {
  ovale(page, x, y, t, t, NU.rouge);
  var m = t * 0.3;
  ligne(page, x + m, y + m, x + t - m, y + t - m, NU.papier, 1.6, { calque: CAL.texte });
  ligne(page, x + t - m, y + m, x + m, y + t - m, NU.papier, 1.6, { calque: CAL.texte });
}

// Cote : flèche double + étiquette
function cote(page, x1, y1, x2, y2, etiquette, couleur) {
  ligne(page, x1, y1, x2, y2, couleur || NU.secondaire, 0.6, { fleches: true, calque: CAL.texte });
  var vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  texte(page, vertical ? x1 + 1.5 : (x1 + x2) / 2 - 15, vertical ? (y1 + y2) / 2 - 2 : y1 - 5, 30, 4, etiquette,
    { style: "05 — Légende", couleur: couleur || NU.secondaire, align: vertical ? "g" : "c" });
}

// ---------- Pages de la charte (A4 paysage) ----------
var P = { l: 297, h: 210, m: 18 };   // page et marge
var SOMMAIRE = [];                   // [{chapitre, titre, page}]
var RUBRIQUE = "";

function pageSuivante(fond) {
  var p = D.pages.length == 1 && !pageSuivante.premiere ? D.pages[0] : D.pages.add(LocationOptions.AT_END);
  pageSuivante.premiere = true;
  p.appliedMaster = NothingEnum.NOTHING;
  if (fond) rect(p, -3, -3, P.l + 6, P.h + 6, fond);
  return p;
}

function entete(p, rubrique, sombre) {
  var c = sombre ? NU.papier : NU.gris;
  texte(p, P.m, 9, 150, 4, MARQUE + "  /  " + rubrique, { style: "06 — Navigation", couleur: c });
  texte(p, P.l - P.m - 120, 9, 120, 4, "Guide de l’identité visuelle", { style: "06 — Navigation", couleur: c, align: "d" });
  var pied = texte(p, P.m, P.h - 11, 200, 4, MARQUE + " — Charte graphique · Version " + CHARTE.marque.version + " · Page ", { style: "06 — Navigation", couleur: c });
  pied.parentStory.insertionPoints[-1].contents = SpecialCharacters.AUTO_PAGE_NUMBER;
}

function pageCourante(rubrique, titre, surtitre, o) {
  o = o || {};
  var p = pageSuivante(o.fond);
  entete(p, rubrique, o.sombre);
  if (surtitre) texte(p, P.m, 22, 200, 5, surtitre, { style: "02 — Surtitre" });
  if (titre) texte(p, P.m, 28, 230, 14, titre, { style: "01 — Titre de page", couleur: o.sombre ? NU.papier : null });
  if (o.sommaire !== false && titre) SOMMAIRE.push({ chapitre: RUBRIQUE, titre: titre, page: p });
  return p;
}

function separateur(numero, titre, accroche) {
  RUBRIQUE = titre;
  var p = pageSuivante(NU.principale);
  logo(p, formesLogo()[formesLogo().length - 1], "blanc", P.l - 95, 40, 70, 70, { ancre: "d" }).transparencySettings.blendingSettings.opacity = 12;
  texte(p, P.m + 4, 70, 60, 30, numero, { style: "07 — Chiffre", couleur: NU.accent });
  texte(p, P.m + 4, 102, 200, 40, titre, { style: "01 — Grand titre" });
  rect(p, P.m + 4, 128, 36, 1.2, NU.secondaire);
  if (accroche) texte(p, P.m + 4, 136, 170, 30, accroche, { style: "04 — Texte courant", couleur: NU.papier });
  SOMMAIRE.push({ chapitre: titre, titre: null, page: p, numero: numero });
  return p;
}

function colonnesTexte(p, x, y, l, blocs, colonnes) {
  var gout = 10, lc = (l - gout * (colonnes - 1)) / colonnes;
  for (var i = 0; i < blocs.length; i++) {
    var cx = x + (i % colonnes) * (lc + gout), cy = y + Math.floor(i / colonnes) * 62;
    rect(p, cx, cy, 14, 0.8, NU.secondaire);
    texte(p, cx, cy + 5, lc, 8, blocs[i][0], { style: "03 — Intertitre" });
    texte(p, cx, cy + 15, lc, 44, blocs[i][1], { style: "04 — Texte courant" });
  }
}

// ---------- Sommaire cliquable + signets ----------
function construireSommaire(pageSommaire) {
  var x = P.m, y = 48, col = 0, lc = (P.l - 2 * P.m - 20) / 2;
  for (var i = 0; i < SOMMAIRE.length; i++) {
    var e = SOMMAIRE[i];
    var num = e.page.documentOffset + 1;
    if (y > P.h - 30) { col++; y = 48; x = P.m + col * (lc + 20); }
    var t;
    if (!e.titre) {
      y += 3;
      t = texte(pageSommaire, x, y, lc, 7, e.numero + "   " + e.chapitre + "\t" + num, { style: "03 — Intertitre", corps: 12 });
      y += 9;
    } else {
      t = texte(pageSommaire, x + 9, y, lc - 9, 5, e.titre + "\t" + num, { style: "04 — Texte courant", corps: 9, interligne: 11 });
      y += 6;
    }
    var para = t.parentStory.paragraphs[0];
    para.tabStops.add({ alignment: TabStopAlignment.RIGHT_ALIGN, position: (e.titre ? lc - 9 : lc) + "mm", leader: e.titre ? " . " : "" });
    try {
      var dest = D.hyperlinkPageDestinations.add(e.page);
      var src = D.hyperlinkTextSources.add(t.parentStory.texts[0]);
      D.hyperlinks.add(src, dest, { name: "Sommaire " + i, visible: false });
      if (!e.titre) D.bookmarks.add(dest, { name: e.numero + " " + e.chapitre });
    } catch (er) { note("Lien sommaire : " + er); }
  }
}

// ---------- Contrôle ----------
function controle() {
  var deb = 0;
  for (var i = 0; i < D.textFrames.length; i++) if (D.textFrames[i].overflows) { deb++; note("Texte qui déborde page " + (D.textFrames[i].parentPage ? D.textFrames[i].parentPage.name : "?") + " : « " + String(D.textFrames[i].contents).substr(0, 40) + " »"); }
  var manq = [];
  for (var j = 0; j < D.fonts.length; j++) if (D.fonts[j].status != FontStatus.INSTALLED) manq.push(D.fonts[j].name);
  if (manq.length) note("Polices non installées : " + manq.join(", "));
  for (var k = 0; k < D.links.length; k++) if (D.links[k].status != LinkStatus.NORMAL) note("Lien à vérifier : " + D.links[k].name);
  note("Pages : " + D.pages.length + " · débordements : " + deb);
}
