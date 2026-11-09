// Charte graphique complète, A4 paysage, entièrement éditable.
// Chapitres (structure Marque A V2 + Marque B V6) : couverture, sommaire, avant-propos,
// 01 La marque, 02 Le logo, 03 Les couleurs, 04 La typographie, 05 L'univers visuel, 06 Les applications, dos.

function main() {
  var C = CHARTE, M = C.marque, T = C.textes || {};
  nouveauDocument(CHEMINS.indd, P.l, P.h, 1, 3);
  var formes = formesLogo();
  var fp = formes[0];                                   // forme principale
  var fs = formes[formes.length - 1];                   // la plus compacte (symbole) pour les petits usages

  // ----- Couverture -----
  var p = pageSuivante(NU.principale);
  logo(p, fs, "blanc", P.l - 150, -20, 190, 190, {}).transparencySettings.blendingSettings.opacity = 7;
  logo(p, fp, "negatif", P.m + 4, 40, 120, 45, { ancre: "g" });
  rect(p, P.m + 4, 112, 36, 1.2, NU.secondaire);
  texte(p, P.m + 4, 120, 200, 22, "Charte graphique", { style: "01 — Grand titre" });
  texte(p, P.m + 4, 142, 200, 6, "Guide de l’identité visuelle" + (M.nom_complet ? " · " + M.nom_complet : ""), { style: "02 — Surtitre", couleur: NU.accent });
  texte(p, P.m + 4, P.h - 26, 160, 10, "Version " + M.version + (M.annee ? " · " + M.annee : "") + (M.ville ? "\r" + M.ville : ""), { style: "05 — Légende", couleur: NU.papier });
  if (M.direction_artistique) texte(p, P.l - P.m - 120, P.h - 22, 120, 5, "Direction artistique : " + M.direction_artistique, { style: "05 — Légende", couleur: NU.papier, align: "d" });

  // ----- Sommaire (rempli à la fin) -----
  var pSom = pageCourante("Sommaire", "Sommaire", "Contenu du guide", { sommaire: false });

  // ----- Avant-propos -----
  RUBRIQUE = "Avant-propos";
  p = pageCourante("Avant-propos", "Pourquoi cette charte ?", "Avant-propos");
  texte(p, P.m, 52, 150, 90, aCompleter(T.avant_propos, "avant-propos"), { style: "04 — Texte courant", corps: 13, interligne: 20, couleur: NU.texte });
  colonnesTexte(p, P.m, 140, 260, [
    ["À qui s’adresse-t-elle ?", "À toute personne qui crée un support au nom de " + M.nom + " : équipe, prestataires, imprimeurs, agences."],
    ["Comment l’utiliser ?", "Partez toujours des fichiers livrés (logos, modèles). En cas de doute, demandez avant d’imprimer."],
    ["Une marque vivante", "Cette charte évolue avec " + M.nom + ". Chaque nouvelle version remplace la précédente."]], 3);
  logo(p, fs, "couleur", P.l - P.m - 70, 40, 70, 70, {});

  // ----- 01 La marque -----
  separateur("01", "La marque", "Ce que " + M.nom + " est, ce qu’elle défend et la façon dont elle parle.");
  p = pageCourante("La marque", "Qui sommes-nous ?", "Présentation");
  texte(p, P.m, 50, 125, 120, aCompleter(T.presentation, "présentation de la marque (5 à 8 lignes)"), { style: "04 — Texte courant", corps: 11.5, interligne: 18, couleur: NU.texte });
  rect(p, 160, 50, 119, 58, teinte(C.couleurs[0].nom, 8));
  texte(p, 168, 58, 103, 6, "Mission", { style: "02 — Surtitre" });
  texte(p, 168, 66, 103, 40, aCompleter(T.mission, "mission"), { style: "04 — Texte courant", couleur: NU.texte });
  rect(p, 160, 114, 119, 58, NU.principale);
  texte(p, 168, 122, 103, 6, "Vision", { style: "02 — Surtitre", couleur: NU.accent });
  texte(p, 168, 130, 103, 40, aCompleter(T.vision, "vision"), { style: "04 — Texte courant", couleur: NU.papier });

  p = pageCourante("La marque", "Nos valeurs", "Ce qui nous guide");
  var v = T.valeurs && T.valeurs.length ? T.valeurs : [{ nom: "À compléter", texte: "3 à 5 valeurs : un mot et une phrase." }];
  var lv = (P.l - 2 * P.m - 8 * (v.length - 1)) / v.length;
  for (var i = 0; i < v.length; i++) {
    var vx = P.m + i * (lv + 8);
    rect(p, vx, 55, lv, 110, i % 2 ? teinte(C.couleurs[0].nom, 8) : NU.principale, { rayon: 2 });
    texte(p, vx + 7, 63, 20, 12, (i < 9 ? "0" : "") + (i + 1), { style: "03 — Intertitre", couleur: NU.accent, corps: 22 });
    texte(p, vx + 7, 85, lv - 14, 12, v[i].nom, { style: "03 — Intertitre", couleur: i % 2 ? NU.texte : NU.papier });
    texte(p, vx + 7, 100, lv - 14, 60, v[i].texte, { style: "04 — Texte courant", couleur: i % 2 ? NU.gris : NU.papier });
  }

  p = pageCourante("La marque", "Personnalité et ton", "Comment nous parlons");
  var pers = T.personnalite || [];
  for (i = 0; i < pers.length; i++) {
    var py = 56 + i * 20;
    texte(p, P.m, py, 40, 5, pers[i].gauche, { style: "05 — Légende", couleur: NU.texte });
    texte(p, P.m + 100, py, 40, 5, pers[i].droite, { style: "05 — Légende", couleur: NU.texte, align: "d" });
    rect(p, P.m, py + 7, 140, 1.2, NU.filet);
    ovale(p, P.m + 140 * pers[i].valeur - 3, py + 4.6, 6, 6, NU.secondaire);
  }
  if (!pers.length) texte(p, P.m, 56, 140, 10, aCompleter("", "curseurs de personnalité"), { style: "04 — Texte courant" });
  var ton = T.ton || { est: [], n_est_pas: [] };
  texte(p, 175, 52, 100, 6, M.nom + " est…", { style: "02 — Surtitre" });
  texte(p, 175, 60, 100, 50, (ton.est.length ? ton.est : ["À compléter"]).join("\r"), { style: "03 — Intertitre", interligne: 22 });
  texte(p, 230, 52, 50, 6, "… et n’est pas", { style: "02 — Surtitre", couleur: NU.gris });
  texte(p, 230, 60, 50, 50, (ton.n_est_pas.length ? ton.n_est_pas : ["À compléter"]).join("\r"), { style: "03 — Intertitre", interligne: 22, couleur: NU.gris });

  // ----- 02 Le logo -----
  separateur("02", "Le logo", "Le signe qui représente " + M.nom + " partout : ses formes, ses versions et ses règles.");
  p = pageCourante("Le logo", "Logotype et signification", "Le logo");
  // fond du logo : la couleur la plus claire de la palette (le logo couleur doit y être lisible)
  var clairIdx = 0; for (i = 1; i < C.couleurs.length; i++) if ((C.couleurs[i].contraste_noir || 0) > (C.couleurs[clairIdx].contraste_noir || 0)) clairIdx = i;
  rect(p, P.m, 50, 140, 125, NU[C.couleurs[clairIdx].nom], { contour: NU.filet, epaisseur: 0.4 });
  logo(p, fp, "couleur", P.m + 15, 70, 110, 85, {});
  var sig = T.signification && T.signification.length ? T.signification : [{ titre: "À compléter", texte: "Ce que représente chaque élément du logo." }];
  for (i = 0; i < sig.length && i < 4; i++) {
    rect(p, 170, 52 + i * 31, 10, 0.8, NU.secondaire);
    texte(p, 170, 56 + i * 31, 109, 7, sig[i].titre, { style: "03 — Intertitre", corps: 12 });
    texte(p, 170, 64 + i * 31, 109, 20, sig[i].texte, { style: "04 — Texte courant" });
  }

  // Construction : logo dans une grille d'unités x
  p = pageCourante("Le logo", "Construction", "Proportions");
  var cadre = { x: P.m, y: 48, l: 180, h: 135 };
  var lg = logo(p, fp, "couleur", cadre.x + 25, cadre.y + 25, cadre.l - 50, cadre.h - 50, {});
  if (lg) {
    var gb = lg.geometricBounds, xs = (gb[2] - gb[0]) * C.logos.zone_protection.rapport;
    for (var gx = gb[1]; gx <= gb[3] + 0.1; gx += xs) ligne(p, gx, cadre.y, gx, cadre.y + cadre.h, NU.filet, 0.4);
    for (var gy = gb[0]; gy <= gb[2] + 0.1; gy += xs) ligne(p, cadre.x, gy, cadre.x + cadre.l, gy, NU.filet, 0.4);
    rect(p, gb[1], gb[0], gb[3] - gb[1], gb[2] - gb[0], null, { contour: NU.secondaire, epaisseur: 0.6, calque: CAL.texte });
    cote(p, gb[1], gb[2] + 6, gb[1] + xs, gb[2] + 6, "x");
  }
  texte(p, 210, 52, 69, 120, "Le logo s’inscrit dans une grille d’unités x." + (C.logos.zone_protection.definition ? "\r\r" + C.logos.zone_protection.definition + "." : "") +
    "\r\rLes proportions entre les éléments sont fixes : on ne les modifie jamais. On utilise toujours les fichiers livrés.", { style: "04 — Texte courant" });

  // Formes du logo
  p = pageCourante("Le logo", "Les versions du logo", "Formes");
  var lf = (P.l - 2 * P.m - 10 * (formes.length - 1)) / formes.length;
  for (i = 0; i < formes.length; i++) {
    var fx = P.m + i * (lf + 10), info = C.logos.formes[formes[i]];
    rect(p, fx, 50, lf, 95, teinte(C.couleurs[0].nom, 6));
    logo(p, formes[i], "couleur", fx + 4, 58, lf - 8, 78, {});   // marge réduite : 5 formes ou plus restent lisibles
    texte(p, fx, 152, lf, 7, info.libelle || formes[i], { style: "03 — Intertitre", corps: 12 });
    texte(p, fx, 161, lf, 20, info.usage || "", { style: "04 — Texte courant" });
  }

  // Versions couleur
  p = pageCourante("Le logo", "Versions couleur et monochromes", "Déclinaisons");
  var cases = [["couleur", NU.papier, "Couleur, sur fond clair"], ["negatif", NU.principale, "Négatif, sur fond sombre"],
               ["blanc", NU.secondaire, "Blanc, sur la couleur secondaire"], ["noir", NU.papier, "Noir, impression une couleur"],
               ["mono", NU.papier, "Monochrome, couleur principale"], ["blanc", NU.noir, "Blanc, sur fond noir"]];
  var lc = (P.l - 2 * P.m - 16) / 3;
  for (i = 0; i < cases.length; i++) {
    var cx = P.m + (i % 3) * (lc + 8), cy = 48 + Math.floor(i / 3) * 70;
    rect(p, cx, cy, lc, 58, cases[i][1], { contour: cases[i][1] == NU.papier ? NU.filet : null, epaisseur: 0.5 });
    logo(p, fp, cases[i][0], cx + 18, cy + 10, lc - 36, 38, {});
    texte(p, cx, cy + 60, lc, 5, cases[i][2], { style: "05 — Légende" });
  }

  // Zone de protection
  p = pageCourante("Le logo", "Zone de protection", "Respirer");
  lg = logo(p, fp, "couleur", P.m + 40, 70, 120, 70, {});
  if (lg) {
    gb = lg.geometricBounds; xs = (gb[2] - gb[0]) * C.logos.zone_protection.rapport;
    rect(p, gb[1] - xs, gb[0] - xs, gb[3] - gb[1] + 2 * xs, gb[2] - gb[0] + 2 * xs, null, { contour: NU.secondaire, epaisseur: 0.6, pointilles: true, calque: CAL.texte });
    cote(p, gb[1] - xs, gb[0] - xs - 4, gb[1], gb[0] - xs - 4, "x");
    cote(p, gb[3] + 4 + xs, gb[2], gb[3] + 4 + xs, gb[2] + xs, "x");
  }
  texte(p, 210, 52, 69, 110, "Aucun texte, image ou bord de page ne doit entrer dans cette zone." +
    (C.logos.zone_protection.definition ? "\r\r" + C.logos.zone_protection.definition + "." : "\r\rx = " + Math.round(C.logos.zone_protection.rapport * 100) + " % de la hauteur du logo."), { style: "04 — Texte courant" });

  // Tailles minimales
  p = pageCourante("Le logo", "Tailles minimales", "Lisibilité");
  var tm = C.logos.tailles_minimales || [];
  for (i = 0; i < tm.length; i++) {
    var ty = 52 + i * 42;
    texte(p, P.m, ty, 70, 7, (C.logos.formes[tm[i].forme] || {}).libelle || tm[i].forme, { style: "03 — Intertitre", corps: 12 });
    texte(p, P.m, ty + 9, 70, 12, "Impression : " + tm[i].print_mm + " mm de large\rÉcran : " + tm[i].ecran_px + " px de large", { style: "04 — Texte courant" });
    logo(p, tm[i].forme, "couleur", 100, ty, tm[i].print_mm, 30, { ancre: "gh" });   // taille réelle
    cote(p, 100, ty + 33, 100 + tm[i].print_mm, ty + 33, tm[i].print_mm + " mm");
  }
  if (!tm.length) texte(p, P.m, 52, 200, 10, aCompleter("", "tailles minimales (mm et px) par forme"), { style: "04 — Texte courant" });

  // Fonds autorisés
  p = pageCourante("Le logo", "Le logo sur les fonds", "Contraste");
  var fonds = [];
  for (i = 0; i < C.couleurs.length && fonds.length < 4; i++) fonds.push(C.couleurs[i]);
  var lfd = (P.l - 2 * P.m - 8 * (fonds.length)) / (fonds.length + 1);
  for (i = 0; i <= fonds.length; i++) {
    var fdx = P.m + i * (lfd + 8);
    if (i < fonds.length) {
      // logos.blanc_sur_couleurs : sur une couleur de marque (bleu, vert…), version blanche ; la version couleur reste pour les fonds pâles.
      var clair = fonds[i].contraste_noir > fonds[i].contraste_blanc && (!C.logos.blanc_sur_couleurs || fonds[i].contraste_noir >= 12);
      rect(p, fdx, 52, lfd, 100, NU[fonds[i].nom], { contour: clair ? NU.filet : null });
      var tresSombre = fonds[i].contraste_blanc >= 7;   // négatif seulement sur un fond très sombre si blanc_sur_couleurs
      logo(p, fp, clair ? "couleur" : (C.logos.couleur_sombre_a_inverser && (!C.logos.blanc_sur_couleurs || tresSombre) ? "negatif" : "blanc"), fdx + 8, 80, lfd - 16, 44, {});
      texte(p, fdx, 156, lfd, 5, "Sur " + fonds[i].nom, { style: "05 — Légende" });
    } else {
      image(p, (C.images_fond_logo || "00-photo-logo.png"), fdx, 52, lfd, 100, "Photo calme pour le logo");
      logo(p, fp, "blanc", fdx + 8, 80, lfd - 16, 44, {});
      texte(p, fdx, 156, lfd, 5, "Sur une photo : zone calme, version blanche", { style: "05 — Légende", auto: true });
    }
  }

  // Interdits
  p = pageCourante("Le logo", "Ce qu’il ne faut pas faire", "Interdits");
  var interdits = ["Déformer", "Pivoter", "Changer les couleurs", "Ajouter une ombre", "Mettre un contour", "Fond trop chargé"];
  for (i = 0; i < interdits.length; i++) {
    var ix = P.m + (i % 3) * (lc + 8), iy = 48 + Math.floor(i / 3) * 70;
    rect(p, ix, iy, lc, 58, i == 5 ? NU.secondaire : NU.papier, { contour: NU.filet });
    var il = logo(p, fp, i == 2 ? "faux" : "couleur", ix + 22, iy + 12, lc - 44, 34, {});
    if (il) {
      if (i == 0) il.resize(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR, ResizeMethods.MULTIPLYING_CURRENT_DIMENSIONS_BY, [1.35, 0.7]);
      if (i == 1) il.rotationAngle = 18;
      if (i == 3) { il.transparencySettings.dropShadowSettings.mode = ShadowMode.DROP; il.transparencySettings.dropShadowSettings.distance = "1.5mm"; il.transparencySettings.dropShadowSettings.size = "1mm"; }
      if (i == 4) { il.strokeColor = NU.accent; il.strokeWeight = "2pt"; il.strokeAlignment = StrokeAlignment.OUTSIDE_ALIGNMENT; }
    }
    croix(p, ix + lc - 11, iy + 3, 8);
    texte(p, ix, iy + 60, lc, 5, interdits[i], { style: "05 — Légende", couleur: NU.texte });
  }

  // ----- 03 Les couleurs -----
  separateur("03", "Les couleurs", "Une palette courte, toujours la même, pour être reconnue au premier regard.");
  p = pageCourante("Les couleurs", "La palette", "Couleurs de la marque");
  var cs = C.couleurs, lcs = (P.l - 2 * P.m - 6 * (cs.length - 1)) / cs.length;
  for (i = 0; i < cs.length; i++) {
    var sx = P.m + i * (lcs + 6), cc = cs[i];
    rect(p, sx, 48, lcs, 78, NU[cc.nom], { contour: cc.contraste_noir > 15 ? NU.filet : null });
    texte(p, sx, 131, lcs, 6, cc.nom, { style: "03 — Intertitre", corps: 11 });
    texte(p, sx, 139, lcs, 6, cc.role || "", { style: "02 — Surtitre", couleur: NU.gris });
    texte(p, sx, 147, lcs, 30, "HEX  " + cc.hex + "\rRVB  " + cc.rvb.join(" · ") + "\rCMJN  " + cc.cmjn.join(" · ") +
      "\rPantone  " + (cc.pantone || "à confirmer"), { style: "08 — Code couleur" });
  }
  texte(p, P.m, P.h - 22, 260, 5, "CMJN calculés pour l’impression couchée (profil " + (cs[0].cmjn_profil || "FOGRA39") + "), à confirmer par l’imprimeur sur épreuve. Pantone : à valider sur nuancier physique.", { style: "05 — Légende" });

  p = pageCourante("Les couleurs", "Nuances et proportions", "Équilibre");
  for (i = 0; i < Math.min(cs.length, 3); i++) {
    var ny = 50 + i * 24;
    texte(p, P.m, ny + 5, 34, 6, cs[i].nom, { style: "05 — Légende", couleur: NU.texte });
    var parts = [100, 80, 60, 40, 20];
    for (var k = 0; k < parts.length; k++) {
      rect(p, P.m + 36 + k * 27, ny, 25, 16, parts[k] == 100 ? NU[cs[i].nom] : teinte(cs[i].nom, parts[k]));
      texte(p, P.m + 36 + k * 27, ny + 17, 25, 4, parts[k] + " %", { style: "05 — Légende", corps: 6 });
    }
  }
  var prop = C.proportions || {}, px0 = P.m, ptot = 0;
  for (var pn in prop) ptot += prop[pn];
  texte(p, P.m, 130, 120, 6, "Proportions conseillées", { style: "02 — Surtitre" });
  for (pn in prop) {
    var pl = (P.l - 2 * P.m) * prop[pn] / (ptot || 100);
    if (NU[pn]) rect(p, px0, 138, pl, 22, NU[pn], { contour: NU.filet });
    texte(p, px0 + 2, 162, Math.max(pl, 20), 5, pn + " " + prop[pn] + " %", { style: "05 — Légende" });
    px0 += pl;
  }
  texte(p, 200, 50, 79, 70, "Contrastes pour le texte (norme WCAG) :\r" + (function () {
    var s = []; for (var j = 0; j < cs.length; j++) s.push(cs[j].nom + " : " + (cs[j].contraste_blanc >= 4.5 ? "texte blanc ✓" : (cs[j].contraste_noir >= 4.5 ? "texte foncé ✓" : "titres seulement")));
    return s.join("\r"); })(), { style: "04 — Texte courant", corps: 9 });

  // ----- 04 La typographie -----
  separateur("04", "La typographie", "Deux familles de caractères, pas plus : une voix pour les titres, une pour les textes.");
  p = pageCourante("La typographie", "Les polices de la marque", "Typographie");
  var roles = ["titres", "texte"];
  for (i = 0; i < roles.length; i++) {
    var tp = C.typographies[roles[i]]; if (!tp) continue;
    var tx = P.m + i * 135;
    texte(p, tx, 50, 125, 6, (roles[i] == "titres" ? "Titres" : "Textes") + " — " + (tp.role || ""), { style: "02 — Surtitre" });
    texte(p, tx, 58, 125, 30, "Aa", { police: [tp.famille, (tp.styles || ["Regular"])[Math.min(1, (tp.styles || [1]).length - 1)]], corps: 80, interligne: 80, couleur: NU.principale });
    texte(p, tx + 55, 62, 70, 10, tp.famille, { police: [tp.famille, "Regular"], corps: 20, couleur: NU.texte });
    texte(p, tx + 55, 74, 70, 10, (tp.styles || []).join(" · "), { style: "05 — Légende" });
    texte(p, tx, 98, 125, 30, "ABCDEFGHIJKLMNOPQRSTUVWXYZ\rabcdefghijklmnopqrstuvwxyz\r0123456789 éèàçô’«»&@€", { police: [tp.famille, "Regular"], corps: 12, interligne: 17, couleur: NU.texte });
    texte(p, tx, 135, 125, 10, tp.licence ? "Licence : " + tp.licence : "", { style: "05 — Légende" });
  }
  var bur = C.typographies.bureautique;
  if (bur) texte(p, P.m, 160, 260, 12, "Bureautique (Word, PowerPoint, e-mails) : " + bur.famille + (bur.role ? " — " + bur.role : ""), { style: "04 — Texte courant", couleur: NU.texte });

  p = pageCourante("La typographie", "Hiérarchie des textes", "Mise en page");
  var hi = C.hierarchie || [], hy = 50;
  for (i = 0; i < hi.length; i++) {
    var hs = ST["Hiérarchie — " + hi[i].niveau];
    texte(p, P.m, hy + 2, 50, 10, hi[i].niveau + "\r" + C.typographies[hi[i].police].famille + " " + hi[i].style + " · " + hi[i].corps + "/" + hi[i].interligne + " pt", { style: "05 — Légende" });
    var ht = texte(p, P.m + 58, hy, 200, hi[i].interligne * 0.36 + 3, i < 2 ? M.nom + " " + (M.nom_complet || "") : "Un texte d’exemple pour juger du rendu et de l’interligne.", { auto: true });
    ht.parentStory.appliedParagraphStyle = hs;
    hy = Math.max(hy + 16, ht.geometricBounds[2] + 7);
  }

  // ----- 05 L'univers visuel -----
  var imgs = C.images || [];
  separateur("05", "L’univers visuel", "Les images et l’ambiance qui accompagnent la marque.");
  p = pageCourante("L’univers visuel", "Style photographique", "Images");
  var univ = []; for (i = 0; i < imgs.length; i++) if (imgs[i].page == "univers") univ.push(imgs[i]);
  if (!univ.length) univ = [{ fichier: "05-univers-1.png", legende: "Photo d’ambiance" }, { fichier: "05-univers-2.png", legende: "Photo d’ambiance" }];
  var lu = (P.l - 2 * P.m - 8 * (univ.length - 1)) / univ.length;
  for (i = 0; i < univ.length; i++) {
    image(p, univ[i].fichier, P.m + i * (lu + 8), 48, lu, 110, univ[i].legende);
    texte(p, P.m + i * (lu + 8), 161, lu, 5, univ[i].legende || "", { style: "05 — Légende" });
  }

  // ----- 06 Les applications -----
  separateur("06", "Les applications", "Les supports du quotidien, prêts à imprimer ou à modifier.");
  var decl = CHEMINS.declinaisons || [];
  for (i = 0; i < decl.length; i++) {
    p = pageCourante("Les applications", decl[i].titre, "Applications");
    var nbp = decl[i].pages || 1, ld = (P.l - 2 * P.m - 10 * (nbp - 1)) / nbp;
    for (var q = 0; q < nbp; q++) {
      rect(p, P.m + q * (ld + 10), 48, ld, 120, teinte(C.couleurs[0].nom, 6));
      placer(p, decl[i].pdf, P.m + q * (ld + 10) + 8, 54, ld - 16, 108, { page: q + 1 });
    }
    texte(p, P.m, 172, 260, 10, decl[i].legende || "", { style: "05 — Légende" });
  }
  var appl = []; for (i = 0; i < imgs.length; i++) if (imgs[i].page == "applications" || imgs[i].page == "papeterie") appl.push(imgs[i]);
  for (i = 0; i < appl.length; i += 2) {
    p = pageCourante("Les applications", appl[i].legende || "Mise en situation", "Mises en situation");
    var deux = appl[i + 1] ? [appl[i], appl[i + 1]] : [appl[i]];
    var la = (P.l - 2 * P.m - 8 * (deux.length - 1)) / deux.length;
    for (q = 0; q < deux.length; q++) {
      image(p, deux[q].fichier, P.m + q * (la + 8), 48, la, 120, deux[q].legende);
      texte(p, P.m + q * (la + 8), 171, la, 5, deux[q].legende || "", { style: "05 — Légende" });
    }
  }

  // ----- 07+ Branches (sous-marques) : un chapitre par branche, mêmes couleurs et polices que la maison mère -----
  var BR = C.branches || [], CB = CHEMINS.branches || [];
  for (var b = 0; b < BR.length; b++) {
    var br = BR[b], cb = CB[b] || {}, varMere = CHEMINS.variantes, imgMere = CHEMINS.images;
    var num = (b + 7 < 10 ? "0" : "") + (b + 7);
    separateur(num, br.nom, br.accroche || "");
    CHEMINS.variantes = cb.variantes; CHEMINS.images = cb.images;   // logos et images de la branche
    var bf = []; for (var kf in br.formes) bf.push(kf);

    // Présentation : logo de la branche, texte, règles, et le logo de la maison mère pour rappeler le lien
    p = pageCourante(br.nom, "Une branche de " + (M.nom_complet || M.nom), br.nom);
    rect(p, P.m, 50, 140, 125, NU[C.couleurs[clairIdx].nom], { contour: NU.filet, epaisseur: 0.4 });
    logo(p, bf[0], "couleur", P.m + 15, 66, 110, 80, {});
    CHEMINS.variantes = varMere;
    logo(p, fp, "couleur", P.m + 6, 158, 40, 12, { ancre: "g" });
    texte(p, P.m + 48, 160, 90, 8, "Maison mère : " + (M.nom_complet || M.nom), { style: "05 — Légende" });
    CHEMINS.variantes = cb.variantes;
    texte(p, 170, 50, 109, 34, br.texte || "", { style: "04 — Texte courant", couleur: NU.texte });
    var rg = br.regles || [];
    for (i = 0; i < rg.length && i < 3; i++) {
      rect(p, 170, 90 + i * 29, 10, 0.8, NU.secondaire);
      texte(p, 170, 93 + i * 29, 109, 7, rg[i].titre, { style: "03 — Intertitre", corps: 11 });
      texte(p, 170, 100 + i * 29, 109, 18, rg[i].texte, { style: "04 — Texte courant", corps: 8.5 });
    }

    // Formes du logo de la branche
    p = pageCourante(br.nom, "Les versions du logo " + br.nom, br.nom);
    var lbf = (P.l - 2 * P.m - 10 * (bf.length - 1)) / bf.length;
    for (i = 0; i < bf.length; i++) {
      var bx = P.m + i * (lbf + 10), bi = br.formes[bf[i]];
      rect(p, bx, 50, lbf, 95, teinte(C.couleurs[0].nom, 6));
      logo(p, bf[i], "couleur", bx + 4, 58, lbf - 8, 78, {});
      texte(p, bx, 152, lbf, 7, bi.libelle || bf[i], { style: "03 — Intertitre", corps: 12 });
      texte(p, bx, 161, lbf, 20, bi.usage || "", { style: "04 — Texte courant" });
    }

    // Couleur, négatif, blanc, noir, mono
    p = pageCourante(br.nom, "Versions couleur et monochromes", br.nom);
    for (i = 0; i < cases.length; i++) {
      var bcx = P.m + (i % 3) * (lc + 8), bcy = 48 + Math.floor(i / 3) * 70;
      rect(p, bcx, bcy, lc, 58, cases[i][1], { contour: cases[i][1] == NU.papier ? NU.filet : null, epaisseur: 0.5 });
      logo(p, bf[0], cases[i][0], bcx + 18, bcy + 10, lc - 36, 38, {});
      texte(p, bcx, bcy + 60, lc, 5, cases[i][2], { style: "05 — Légende" });
    }

    // Univers visuel de la branche
    if (br.univers && br.univers.length) {
      p = pageCourante(br.nom, "L’univers " + br.nom, br.nom);
      var lbu = (P.l - 2 * P.m - 8 * (br.univers.length - 1)) / br.univers.length;
      for (i = 0; i < br.univers.length; i++) image(p, br.univers[i], P.m + i * (lbu + 8), 48, lbu, 120, "");
    }

    // Papeterie de la branche
    var bd = cb.declinaisons || [];
    for (i = 0; i < bd.length; i++) {
      p = pageCourante(br.nom, bd[i].titre + " " + br.nom, br.nom);
      var nbb = bd[i].pages || 1, lbd = (P.l - 2 * P.m - 10 * (nbb - 1)) / nbb;
      for (q = 0; q < nbb; q++) {
        rect(p, P.m + q * (lbd + 10), 48, lbd, 120, teinte(C.couleurs[0].nom, 6));
        placer(p, bd[i].pdf, P.m + q * (lbd + 10) + 8, 54, lbd - 16, 108, { page: q + 1 });
      }
      texte(p, P.m, 172, 260, 10, bd[i].legende || "", { style: "05 — Légende" });
    }
    CHEMINS.variantes = varMere; CHEMINS.images = imgMere;
  }

  // ----- Dos -----
  p = pageSuivante(NU.principale);
  logo(p, fp, "negatif", P.l / 2 - 50, 60, 100, 45, {});
  texte(p, P.l / 2 - 100, 120, 200, 10, "Merci de faire vivre la marque avec soin.", { style: "03 — Intertitre", couleur: NU.papier, align: "c" });
  texte(p, P.l / 2 - 100, 134, 200, 14, [M.site, C.adresse].join("   ·   ").replace(/^\s*·\s*|\s*·\s*$/g, ""), { style: "05 — Légende", couleur: NU.papier, align: "c" });

  construireSommaire(pSom);
  controle();
  D.save();
  exporterPDF(CHEMINS.pdf, "[High Quality Print]");
  exporterIDML(CHEMINS.idml);
  fermer();
}
