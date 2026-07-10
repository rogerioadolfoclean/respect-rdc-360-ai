import { pool, LABELS_SANCTION, METHODES_PAIEMENT } from "@/lib/db";
import { BadgeStatut } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function PageSanctions() {
  const [{ rows: sanctions }, { rows: paiements }] = await Promise.all([
    pool.query(
      `SELECT s.*, d.numero AS dossier_numero, pl.accuse_nom
       FROM sanctions s
       JOIN dossiers d ON d.id = s.dossier_id
       JOIN plaintes pl ON pl.id = d.plainte_id
       ORDER BY s.created_at DESC LIMIT 200`
    ),
    pool.query(
      `SELECT p.*, s.dossier_id FROM paiements p JOIN sanctions s ON s.id = p.sanction_id ORDER BY p.created_at DESC LIMIT 100`
    ),
  ]);

  const totalAmendes = sanctions.filter((s) => s.type === "amende").reduce((t, s) => t + Number(s.montant_fc), 0);
  const totalPaye = paiements.filter((p) => p.statut === "confirme").reduce((t, p) => t + Number(p.montant_fc), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy-900">Sanctions & Paiements</h1>
      <p className="text-sm text-slate-600">
        Les sanctions sont prévues par la loi et décidées par les autorités judiciaires compétentes —
        la plateforme ne prononce pas elle-même les sanctions.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-black text-navy-800">{sanctions.length}</div>
          <div className="text-xs text-slate-500">Sanctions prononcées</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-black text-flag-red">{totalAmendes.toLocaleString("fr-FR")} FC</div>
          <div className="text-xs text-slate-500">Total amendes prononcées</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center col-span-2 lg:col-span-1">
          <div className="text-2xl font-black text-emerald-700">{totalPaye.toLocaleString("fr-FR")} FC</div>
          <div className="text-xs text-slate-500">Encaissé (reçus numériques)</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-900 text-white text-left text-xs uppercase">
              <th className="px-4 py-3">Dossier</th>
              <th className="px-4 py-3">Accusé</th>
              <th className="px-4 py-3">Sanction</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Décidée par</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {sanctions.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-navy-800">{s.dossier_numero}</td>
                <td className="px-4 py-2.5">{s.accuse_nom ?? "—"}</td>
                <td className="px-4 py-2.5">{LABELS_SANCTION[s.type] ?? s.type}</td>
                <td className="px-4 py-2.5 font-bold">{Number(s.montant_fc) > 0 ? `${Number(s.montant_fc).toLocaleString("fr-FR")} FC` : "—"}</td>
                <td className="px-4 py-2.5 text-xs">{s.decidee_par}</td>
                <td className="px-4 py-2.5"><BadgeStatut statut={s.statut} labels={{ prononcee: "Prononcée", executee: "Exécutée", payee: "Payée" }} /></td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-black text-navy-900">🧾 Derniers paiements (reçus numériques)</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-900 text-white text-left text-xs uppercase">
              <th className="px-4 py-3">Reçu N°</th>
              <th className="px-4 py-3">Méthode</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">{p.numero_recu}</td>
                <td className="px-4 py-2.5 font-bold">{METHODES_PAIEMENT.find((m) => m.code === p.methode)?.nom ?? p.methode}</td>
                <td className="px-4 py-2.5">{Number(p.montant_fc).toLocaleString("fr-FR")} FC</td>
                <td className="px-4 py-2.5 text-xs font-mono">{p.reference}</td>
                <td className="px-4 py-2.5"><BadgeStatut statut={p.statut} labels={{ confirme: "Confirmé", en_attente: "En attente", echoue: "Échoué" }} /></td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
