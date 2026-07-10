import { pool } from "@/lib/db";
import { BadgeStatut } from "@/components/Charts";
import { clotureMediation } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PageMediations() {
  const { rows: mediations } = await pool.query(
    `SELECT m.*, d.numero AS dossier_numero, pl.victime_nom, pl.accuse_nom
     FROM mediations m
     JOIN dossiers d ON d.id = m.dossier_id
     JOIN plaintes pl ON pl.id = d.plainte_id
     ORDER BY (m.resultat = 'en_cours') DESC, m.created_at DESC LIMIT 200`
  );
  const enCours = mediations.filter((m) => m.resultat === "en_cours").length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-navy-900">Médiations ({mediations.length}) — {enCours} en cours</h1>
      <p className="text-sm text-slate-600">
        Avant toute sanction : convocation, excuses, réparation, médiation, conciliation.
        Si la médiation échoue, le dossier est transmis au parquet (enquête → audience → décision du tribunal).
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {mediations.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-navy-800">{m.dossier_numero}</span>
              <BadgeStatut statut={m.resultat} labels={{ en_cours: "En cours", reussie: "Réussie", echouee: "Échouée" }} />
            </div>
            <div className="text-sm">
              <strong>{m.victime_nom}</strong> <span className="text-slate-400">vs</span> <strong>{m.accuse_nom ?? "Non identifié"}</strong>
            </div>
            <div className="text-xs text-slate-500">
              Médiateur : {m.mediateur} · {m.date_mediation ? new Date(m.date_mediation).toLocaleDateString("fr-FR") : "date à fixer"}
            </div>
            {m.notes && <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2">{m.notes}</p>}
            {m.resultat === "en_cours" && (
              <form action={clotureMediation} className="border-t border-slate-100 pt-3 space-y-2">
                <input type="hidden" name="mediation_id" value={m.id} />
                <textarea name="notes" rows={2} placeholder="Compte-rendu de la séance (excuses, réparation, conciliation...)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                <div className="flex gap-2">
                  <button name="resultat" value="reussie" className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs">✓ Médiation réussie (clôture)</button>
                  <button name="resultat" value="echouee" className="flex-1 bg-flag-red text-white font-bold py-2 rounded-lg text-xs">✗ Échec → transmission parquet</button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
