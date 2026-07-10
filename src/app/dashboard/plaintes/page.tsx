import Link from "next/link";
import { listePlaintes } from "@/lib/data";
import { BadgeGravite, BadgeStatut } from "@/components/Charts";

export const dynamic = "force-dynamic";

const LABELS_PLAINTE = { recue: "Reçue", en_traitement: "En traitement", cloturee: "Clôturée", rejetee: "Rejetée" };

export default async function PagePlaintes({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const plaintes = await listePlaintes(statut);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-black text-navy-900">Plaintes ({plaintes.length})</h1>
        <div className="flex gap-1 text-xs">
          <Link href="/dashboard/plaintes" className={`px-3 py-1.5 rounded-full font-bold ${!statut ? "bg-navy-800 text-white" : "bg-white border border-slate-200"}`}>Toutes</Link>
          {Object.entries(LABELS_PLAINTE).map(([k, v]) => (
            <Link key={k} href={`/dashboard/plaintes?statut=${k}`} className={`px-3 py-1.5 rounded-full font-bold ${statut === k ? "bg-navy-800 text-white" : "bg-white border border-slate-200"}`}>{v}</Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-900 text-white text-left text-xs uppercase">
              <th className="px-4 py-3">Numéro</th>
              <th className="px-4 py-3">Victime</th>
              <th className="px-4 py-3">Accusé</th>
              <th className="px-4 py-3">Infraction</th>
              <th className="px-4 py-3">Province</th>
              <th className="px-4 py-3">Gravité IA</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {plaintes.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-navy-800">{p.numero}</td>
                <td className="px-4 py-2.5">{p.victime_nom}{p.victime_mineure && <span className="ml-1 text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">MINEUR</span>}</td>
                <td className="px-4 py-2.5">{p.accuse_nom ?? "—"}</td>
                <td className="px-4 py-2.5">{p.type_infraction ?? "—"}</td>
                <td className="px-4 py-2.5">{p.province ?? "—"}</td>
                <td className="px-4 py-2.5"><BadgeGravite gravite={p.score_gravite} /></td>
                <td className="px-4 py-2.5"><BadgeStatut statut={p.statut} labels={LABELS_PLAINTE} /></td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-2.5">
                  <Link href={`/dashboard/plaintes/${p.id}`} className="text-navy-700 font-bold text-xs hover:underline">Détails →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
