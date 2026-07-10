import Link from "next/link";
import { pool, LABELS_ETAPE, ETAPES_DOSSIER } from "@/lib/db";
import { BadgeGravite, BadgeStatut } from "@/components/Charts";
import { avancerDossier } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PageDossiers({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const { rows: dossiers } = await pool.query(
    `SELECT d.*, pl.id AS plainte_pk, pl.victime_nom, pl.accuse_nom, pl.score_gravite, t.nom AS type_infraction
     FROM dossiers d
     JOIN plaintes pl ON pl.id = d.plainte_id
     LEFT JOIN types_infraction t ON t.id = pl.type_infraction_id
     ${statut ? "WHERE d.statut = $1" : ""}
     ORDER BY d.updated_at DESC LIMIT 200`,
    statut ? [statut] : []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-black text-navy-900">Dossiers ({dossiers.length})</h1>
        <div className="flex gap-1 text-xs flex-wrap">
          <Link href="/dashboard/dossiers" className={`px-3 py-1.5 rounded-full font-bold ${!statut ? "bg-navy-800 text-white" : "bg-white border border-slate-200"}`}>Tous</Link>
          {ETAPES_DOSSIER.map((e) => (
            <Link key={e} href={`/dashboard/dossiers?statut=${e}`} className={`px-3 py-1.5 rounded-full font-bold ${statut === e ? "bg-navy-800 text-white" : "bg-white border border-slate-200"}`}>{LABELS_ETAPE[e]}</Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-900 text-white text-left text-xs uppercase">
              <th className="px-4 py-3">Dossier</th>
              <th className="px-4 py-3">Victime</th>
              <th className="px-4 py-3">Accusé</th>
              <th className="px-4 py-3">Infraction</th>
              <th className="px-4 py-3">Gravité</th>
              <th className="px-4 py-3">Étape</th>
              <th className="px-4 py-3">Parquet</th>
              <th className="px-4 py-3">Avancer</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((d) => (
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-navy-800">{d.numero}</td>
                <td className="px-4 py-2.5">{d.victime_nom}</td>
                <td className="px-4 py-2.5">{d.accuse_nom ?? "—"}</td>
                <td className="px-4 py-2.5">{d.type_infraction ?? "—"}</td>
                <td className="px-4 py-2.5"><BadgeGravite gravite={d.score_gravite} /></td>
                <td className="px-4 py-2.5"><BadgeStatut statut={d.statut} labels={LABELS_ETAPE} /></td>
                <td className="px-4 py-2.5">{d.transmis_parquet ? <span className="text-flag-red font-bold text-xs">Oui</span> : <span className="text-slate-400 text-xs">Non</span>}</td>
                <td className="px-4 py-2.5">
                  <form action={avancerDossier} className="flex gap-1">
                    <input type="hidden" name="dossier_id" value={d.id} />
                    <select name="statut" defaultValue={d.statut} className="border border-slate-300 rounded px-2 py-1 text-xs bg-white">
                      {ETAPES_DOSSIER.map((e) => <option key={e} value={e}>{LABELS_ETAPE[e]}</option>)}
                    </select>
                    <button className="bg-navy-800 text-white text-xs font-bold px-2 rounded">OK</button>
                  </form>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/dashboard/plaintes/${d.plainte_pk}`} className="text-navy-700 font-bold text-xs hover:underline">Détails →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
