// Intelligence Artificielle RÉELLE — RESPECT RDC 360 AI
// Analyse des plaintes par Claude (Anthropic) lorsque ANTHROPIC_API_KEY est configurée ;
// repli automatique sur le moteur local à mots-clés sinon (aucune plainte n'est bloquée).
// PRINCIPE FONDAMENTAL : l'IA produit un rapport préliminaire destiné aux autorités
// compétentes — elle ne remplace jamais la décision humaine.

import Anthropic from "@anthropic-ai/sdk";
import { analyserPlainte, type AnalyseIA } from "./ia";

export type ModeIA = "claude" | "moteur_local";

export type EntreeAnalyse = {
  description: string;
  victime_mineure: boolean;
  diffusion_publique: boolean;
  menace_de_mort: boolean;
  repetition: boolean;
  nb_preuves: number;
  type_infraction: string;
  numero: string;
};

export function iaClaudeDisponible(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SCHEMA_ANALYSE = {
  type: "object" as const,
  properties: {
    detections: {
      type: "array",
      items: { type: "string" },
      description:
        "Éléments illicites détectés dans la description (insultes, menaces, discours haineux, appels à la violence, propos discriminatoires, diffamation, harcèlement). Vide si rien de probant.",
    },
    score_points: {
      type: "integer",
      description: "Score de gravité en points, de 1 (bénin) à 15 (extrêmement grave).",
    },
    score_gravite: {
      type: "string",
      enum: ["faible", "moyen", "eleve", "tres_eleve"],
      description: "faible: 1-2 pts, moyen: 3-5 pts, eleve: 6-8 pts, tres_eleve: 9+ pts.",
    },
    resume_faits: {
      type: "string",
      description: "Résumé neutre et factuel des faits allégués, en 2 phrases maximum.",
    },
    qualification_juridique: {
      type: "string",
      description:
        "Qualification juridique probable au regard du droit congolais (à confirmer par l'autorité compétente).",
    },
    recommandation: {
      type: "string",
      description:
        "Orientation recommandée : médiation (convocation, excuses, réparation, conciliation) ou transmission prioritaire aux autorités avec enquête.",
    },
  },
  required: [
    "detections",
    "score_points",
    "score_gravite",
    "resume_faits",
    "qualification_juridique",
    "recommandation",
  ],
  additionalProperties: false as const,
};

const SYSTEME = `Tu es le module d'analyse de la plateforme nationale RESPECT RDC 360 AI de la République Démocratique du Congo, qui traite les plaintes pour infractions verbales (injures, diffamation, calomnie, menaces, discours de haine, incitation à la violence, harcèlement, tribalisme, discriminations).

Tu analyses la description des faits fournie par une victime et tu produis une évaluation préliminaire destinée aux autorités compétentes (Police Nationale Congolaise, Parquet, Tribunaux, médiateurs).

Règles impératives :
- La plateforme ne sanctionne PAS : critiques politiques pacifiques, débats démocratiques, opinions sans injure ni haine, journalisme de bonne foi, recherche scientifique, œuvres artistiques. Si les faits décrits relèvent de ces catégories, attribue un score faible et dis-le dans la recommandation.
- Ton analyse est PRÉLIMINAIRE : la décision finale sur la culpabilité et toute sanction appartient exclusivement à l'autorité humaine compétente, avec droit de défense pour la personne mise en cause.
- Sois factuel et neutre. Ne conclus jamais à la culpabilité.
- Facteurs aggravants à intégrer au score : répétition (+2), victime mineure (+3), menace de mort (+4), diffusion publique (+2).`;

function labelGravite(g: string): string {
  return ({ faible: "FAIBLE", moyen: "MOYEN", eleve: "ÉLEVÉ", tres_eleve: "TRÈS ÉLEVÉ" }[g] ?? g.toUpperCase());
}

async function analyserAvecClaude(entree: EntreeAnalyse): Promise<AnalyseIA> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system: SYSTEME,
    output_config: {
      format: { type: "json_schema", schema: SCHEMA_ANALYSE },
    },
    messages: [
      {
        role: "user",
        content: `Analyse cette plainte :

Numéro : ${entree.numero}
Type d'infraction déclaré : ${entree.type_infraction}
Description des faits par la victime : « ${entree.description} »

Facteurs déclarés :
- Faits répétés : ${entree.repetition ? "OUI" : "non"}
- Victime mineure : ${entree.victime_mineure ? "OUI" : "non"}
- Menace de mort : ${entree.menace_de_mort ? "OUI" : "non"}
- Diffusion publique : ${entree.diffusion_publique ? "OUI" : "non"}
- Nombre de preuves jointes : ${entree.nb_preuves}`,
      },
    ],
  });

  const texte = response.content.find((b) => b.type === "text");
  if (!texte || texte.type !== "text") throw new Error("Réponse IA vide");
  const analyse = JSON.parse(texte.text) as {
    detections: string[];
    score_points: number;
    score_gravite: "faible" | "moyen" | "eleve" | "tres_eleve";
    resume_faits: string;
    qualification_juridique: string;
    recommandation: string;
  };

  const rapport = [
    `RAPPORT PRÉLIMINAIRE D'ANALYSE — Intelligence Artificielle (Claude · Anthropic)`,
    `Plainte : ${entree.numero}`,
    `Type d'infraction déclaré : ${entree.type_infraction}`,
    ``,
    `SCORE DE GRAVITÉ : ${labelGravite(analyse.score_gravite)} (${analyse.score_points} points)`,
    ``,
    `RÉSUMÉ DES FAITS ALLÉGUÉS :`,
    analyse.resume_faits,
    ``,
    `ÉLÉMENTS DÉTECTÉS :`,
    analyse.detections.length > 0
      ? analyse.detections.map((d) => `• ${d}`).join("\n")
      : "• Aucun élément illicite probant détecté — vérification humaine requise.",
    ``,
    `QUALIFICATION JURIDIQUE PROBABLE (à confirmer par l'autorité) :`,
    analyse.qualification_juridique,
    ``,
    `PREUVES JOINTES : ${entree.nb_preuves}`,
    ``,
    `RECOMMANDATION : ${analyse.recommandation}`,
    ``,
    `AVERTISSEMENT LÉGAL : Ce rapport est produit par une intelligence artificielle à titre`,
    `préliminaire et est destiné aux autorités compétentes. Il ne constitue ni une preuve de`,
    `culpabilité ni une décision. Conformément au principe fondamental de la plateforme,`,
    `toute décision sur la culpabilité et toute sanction relève exclusivement de l'autorité`,
    `humaine compétente, avec droit de défense pour la personne mise en cause.`,
  ].join("\n");

  return {
    detections: analyse.detections,
    score_points: analyse.score_points,
    score_gravite: analyse.score_gravite,
    rapport,
  };
}

export async function analyserPlainteIA(
  entree: EntreeAnalyse
): Promise<AnalyseIA & { mode: ModeIA }> {
  if (iaClaudeDisponible()) {
    try {
      const analyse = await analyserAvecClaude(entree);
      return { ...analyse, mode: "claude" };
    } catch (e) {
      console.error("IA Claude indisponible — repli sur le moteur local:", e instanceof Error ? e.message : e);
    }
  }
  return { ...analyserPlainte(entree), mode: "moteur_local" };
}
