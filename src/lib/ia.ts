// Moteur d'Intelligence Artificielle — RESPECT RDC 360 AI
// Analyse les faits décrits, détecte les infractions verbales et calcule le score de gravité.
// PRINCIPE FONDAMENTAL : l'IA produit un rapport préliminaire destiné aux autorités
// compétentes — elle ne remplace jamais la décision humaine.

export type AnalyseIA = {
  detections: string[];
  score_points: number;
  score_gravite: "faible" | "moyen" | "eleve" | "tres_eleve";
  rapport: string;
};

const LEXIQUE: { categorie: string; poids: number; mots: string[] }[] = [
  {
    categorie: "Insultes détectées",
    poids: 2,
    mots: ["insulte", "insulté", "insultant", "injure", "injurié", "idiot", "imbécile", "stupide", "voleur", "sorcier", "sorcière", "chien", "salaud", "humili", "moqu"],
  },
  {
    categorie: "Menaces détectées",
    poids: 3,
    mots: ["menace", "menacé", "tuer", "mort", "frapper", "brûler", "détruire", "vengeance", "attaquer", "kidnapp"],
  },
  {
    categorie: "Discours haineux détecté",
    poids: 3,
    mots: ["haine", "haineux", "tribalis", "racis", "xénophob", "ethnie", "tribu"],
  },
  {
    categorie: "Appel à la violence détecté",
    poids: 4,
    mots: ["incite", "incitation", "violence", "lyncher", "chasser", "expulser", "brutalis"],
  },
  {
    categorie: "Propos discriminatoires détectés",
    poids: 2,
    mots: ["discrimin", "sexis", "religie", "handicap", "exclu", "rejet"],
  },
  {
    categorie: "Diffamation / fausses accusations détectées",
    poids: 2,
    mots: ["diffam", "calomni", "fausse accusation", "fausses accusations", "mensonge", "réputation", "honneur", "accusé faussement"],
  },
  {
    categorie: "Harcèlement détecté",
    poids: 2,
    mots: ["harcèle", "harcel", "quotidien", "répét", "sans cesse", "chaque jour", "poursuit"],
  },
];

export function analyserPlainte(input: {
  description: string;
  victime_mineure: boolean;
  diffusion_publique: boolean;
  menace_de_mort: boolean;
  repetition: boolean;
  nb_preuves: number;
  type_infraction: string;
  numero: string;
}): AnalyseIA {
  const texte = input.description.toLowerCase();
  const detections: string[] = [];
  let points = 1;

  for (const cat of LEXIQUE) {
    const trouves = cat.mots.filter((m) => texte.includes(m));
    if (trouves.length > 0) {
      detections.push(`${cat.categorie} (${trouves.length} indice${trouves.length > 1 ? "s" : ""})`);
      points += cat.poids;
    }
  }

  const facteurs: string[] = [];
  if (input.repetition) { points += 2; facteurs.push("Répétition des faits (+2)"); }
  if (input.victime_mineure) { points += 3; facteurs.push("Victime mineure (+3)"); }
  if (input.menace_de_mort) { points += 4; facteurs.push("Menace de mort (+4)"); }
  if (input.diffusion_publique) { points += 2; facteurs.push("Diffusion publique (+2)"); }
  if (input.nb_preuves >= 2) { points += 1; facteurs.push("Preuves multiples (+1)"); }

  const gravite = points >= 9 ? "tres_eleve" : points >= 6 ? "eleve" : points >= 3 ? "moyen" : "faible";
  const labels = { faible: "FAIBLE", moyen: "MOYEN", eleve: "ÉLEVÉ", tres_eleve: "TRÈS ÉLEVÉ" } as const;

  const rapport = [
    `RAPPORT PRÉLIMINAIRE D'ANALYSE — Intelligence Artificielle`,
    `Plainte : ${input.numero}`,
    `Type d'infraction déclaré : ${input.type_infraction}`,
    ``,
    `SCORE DE GRAVITÉ : ${labels[gravite]} (${points} points)`,
    ``,
    `ÉLÉMENTS DÉTECTÉS DANS LA DESCRIPTION DES FAITS :`,
    detections.length > 0 ? detections.map((d) => `• ${d}`).join("\n") : "• Aucun marqueur linguistique automatique détecté — vérification humaine requise.",
    ``,
    `FACTEURS AGGRAVANTS :`,
    facteurs.length > 0 ? facteurs.map((f) => `• ${f}`).join("\n") : "• Aucun facteur aggravant déclaré.",
    ``,
    `PREUVES JOINTES : ${input.nb_preuves}`,
    ``,
    `RECOMMANDATION : ${gravite === "faible" || gravite === "moyen"
      ? "Orientation vers la MÉDIATION (convocation, excuses, réparation, conciliation) avant toute procédure."
      : "Transmission prioritaire aux autorités compétentes après tentative de médiation. Enquête approfondie recommandée."}`,
    ``,
    `AVERTISSEMENT LÉGAL : Ce rapport est produit par une intelligence artificielle à titre`,
    `préliminaire et est destiné aux autorités compétentes. Il ne constitue ni une preuve de`,
    `culpabilité ni une décision. Conformément au principe fondamental de la plateforme,`,
    `toute décision sur la culpabilité et toute sanction relève exclusivement de l'autorité`,
    `humaine compétente, avec droit de défense pour la personne mise en cause.`,
  ].join("\n");

  return { detections, score_points: points, score_gravite: gravite, rapport };
}
