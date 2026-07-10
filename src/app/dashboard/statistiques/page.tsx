import { pool } from "@/lib/db";
import { statsNationales } from "@/lib/data";
import { BarresHorizontales, Donut, Courbe } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function PageStatistiques() {
  const [s, canaux, ages, toutesProvinces] = await Promise.all([
    statsNationales(),
    pool.query(`SELECT canal AS nom, COUNT(*)::int AS total FROM plaintes GROUP BY canal ORDER BY total DESC`),
    pool.query(`SELECT CASE
        WHEN victime_age < 18 THEN 'Mineurs (<18)'
        WHEN victime_age BETWEEN 18 AND 30 THEN '18–30 ans'
        WHEN victime_age BETWEEN 31 AND 45 THEN '31–45 ans'
        WHEN victime_age BETWEEN 46 AND 60 THEN '46–60 ans'
        ELSE '60+ ans' END AS nom, COUNT(*)::int AS total
      FROM plaintes WHERE victime_age IS NOT NULL GROUP BY 1 ORDER BY total DESC`),
    pool.query(`SELECT p.nom, COUNT(pl.id)::int AS total FROM provinces p
      LEFT JOIN plaintes pl ON pl.province_id = p.id GROUP BY p.nom ORDER BY total DESC`),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy-900">Statistiques nationales détaillées</h1>
      <p className="text-sm text-slate-600">Statistiques en temps réel : province, ville, commune, sexe, âge, type d&apos;infraction, plaintes, dossiers clôturés, médiations réussies, sanctions exécutées.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-4">Toutes les provinces (26)</h2>
          <BarresHorizontales data={toutesProvinces.rows} />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-black text-navy-900 mb-4">Canaux de signalement</h2>
            <Donut data={canaux.rows} taille={150} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-black text-navy-900 mb-4">Répartition par âge des victimes</h2>
            <Donut data={ages.rows} taille={150} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <h2 className="font-black text-navy-900 mb-4">Évolution des plaintes</h2>
          <Courbe data={s.evolution} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <h2 className="font-black text-navy-900 mb-4">Types d&apos;infraction les plus signalés</h2>
          <BarresHorizontales data={s.types} couleur="#007fff" />
        </div>
      </div>
    </div>
  );
}
