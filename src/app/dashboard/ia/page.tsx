import Link from "next/link";
import { pool } from "@/lib/db";
import { iaClaudeDisponible } from "@/lib/ia-claude";
import { BadgeGravite, Donut } from "@/components/Charts";
import { reanalyserPlainte } from "@/lib/actions";

export const dynamic = "force-dynamic";

const CAPACITES = [
  { l: "Détecter les insultes", statut: "actif" },
  { l: "Détecter les menaces", statut: "actif" },
  { l: "Détecter les discours haineux", statut: "actif" },
  { l: "Détecter les appels à la violence", statut: "actif" },
  { l: "Détecter les propos discriminatoires", statut: "actif" },
  { l: "Score de gravité automatique", statut: "actif" },
  { l: "Rapport préliminaire pour les autorités", statut: "actif" },
  { l: "Qualification juridique probable", statut: "claude" },
  { l: "Transcrire les audios (reconnaissance vocale)", statut: "phase2" },
  { l: "OCR des captures d'écran", statut: "phase2" },
  { l: "Reconnaissance faciale (identification)", statut: "phase2" },
];

export default async function PageIA() {
  const claude = iaClaudeDisponible();
  const [{ rows: gravites }, { rows: modes }, { rows: recentes }] = await Promise.all([
    pool.query(`SELECT score_gravite, COUNT(*)::int AS total FROM plaintes WHERE score_gravite IS NOT NULL GROUP BY 1`),
    pool.query(`SELECT COALESCE(ia_mode,'moteur_local') AS mode, COUNT(*)::int AS total FROM plaintes GROUP BY 1`),
    pool.query(`SELECT pl.id, pl.numero, pl.score_gravite, pl.score_points, pl.ia_mode, pl.created_at, t.nom AS type_infraction
      FROM plaintes pl LEFT JOIN types_infraction t ON t.id = pl.type_infraction_id
      ORDER BY pl.created_at DESC LIMIT 15`),
  ]);

  const donneesGravite = ["faible", "moyen", "eleve", "tres_eleve"].map((g) => ({
    nom: { faible: "Faible", moyen: "Moyen", eleve: "Élevé", tres_eleve: "Très élevé" }[g]!,
    total: gravites.find((x) => x.score_gravite === g)?.total ?? 0,
    couleur: { faible: "#0e9f6e", moyen: "#f5c518", eleve: "#f97316", tres_eleve: "#ce1021" }[g],
  }));
  const nbClaude = modes.find((m) => m.mode === "claude")?.total ?? 0;
  const nbLocal = modes.find((m) => m.mode === "moteur_local")?.total ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy-900">🤖 Intelligence Artificielle</h1>

      {/* STATUT DU MOTEUR */}
      <div className={`rounded-xl border-2 p-5 ${claude ? "bg-emerald-50 border-emerald-400" : "bg-amber-50 border-amber-400"}`}>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full animate-pulse ${claude ? "bg-emerald-500" : "bg-amber-500"}`} />
          <div>
            <div className="font-black text-navy-900">
              {claude
                ? "IA Claude (Anthropic) — ACTIVE"
                : "Moteur d'analyse local — ACTIF (IA Claude en attente de clé API)"}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {claude
                ? "Chaque plainte est analysée par le modèle Claude : détections, score de gravité, résumé des faits, qualification juridique probable et recommandation."
                : "Le moteur local analyse chaque plainte (détections par lexique + score de gravité). Ajoutez la variable d'environnement ANTHROPIC_API_KEY pour activer l'analyse avancée par Claude — le basculement est automatique, sans redéploiement de code."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* CAPACITES */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-3">Capacités du module IA</h2>
          <ul className="space-y-2 text-sm">
            {CAPACITES.map((c) => (
              <li key={c.l} className="flex items-center justify-between gap-2">
                <span>{c.l}</span>
                {c.statut === "actif" && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">ACTIF</span>}
                {c.statut === "claude" && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${claude ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>{claude ? "ACTIF" : "AVEC CLAUDE"}</span>}
                {c.statut === "phase2" && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">PHASE 2</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* STATS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-3">Scores attribués par l&apos;IA</h2>
          <Donut data={donneesGravite} taille={150} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-3">Analyses par moteur</h2>
          <Donut
            data={[
              { nom: "Claude (Anthropic)", total: nbClaude, couleur: "#7c3aed" },
              { nom: "Moteur local", total: nbLocal, couleur: "#94a3b8" },
            ]}
            taille={150}
          />
          <p className="text-xs text-slate-500 mt-3">
            Utilisez « Réanalyser » ci-dessous pour soumettre à nouveau un dossier au moteur IA actif.
          </p>
        </div>
      </div>

      {/* DERNIERES ANALYSES */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-900 text-white text-left text-xs uppercase">
              <th className="px-4 py-3">Plainte</th>
              <th className="px-4 py-3">Infraction</th>
              <th className="px-4 py-3">Gravité</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Moteur</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentes.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-navy-800">{p.numero}</td>
                <td className="px-4 py-2.5">{p.type_infraction ?? "—"}</td>
                <td className="px-4 py-2.5"><BadgeGravite gravite={p.score_gravite} /></td>
                <td className="px-4 py-2.5 font-bold">{p.score_points}</td>
                <td className="px-4 py-2.5">
                  {p.ia_mode === "claude"
                    ? <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Claude</span>
                    : <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Local</span>}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <form action={reanalyserPlainte}>
                      <input type="hidden" name="plainte_id" value={p.id} />
                      <button className="text-xs font-bold bg-navy-800 text-white px-2.5 py-1 rounded hover:bg-navy-700">🔄 Réanalyser</button>
                    </form>
                    <Link href={`/dashboard/plaintes/${p.id}`} className="text-navy-700 font-bold text-xs hover:underline">Rapport →</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
        ⚖️ <strong>Principe fondamental</strong> — L&apos;IA aide à analyser les preuves et à orienter les dossiers,
        mais la décision finale sur la culpabilité et toute sanction financière est toujours prise par l&apos;autorité
        humaine compétente, avec la possibilité pour la personne mise en cause de se défendre.
      </p>
    </div>
  );
}
