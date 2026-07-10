import { statsNationales } from "@/lib/data";
import { BarresHorizontales, Donut, Courbe } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const s = await statsNationales();

  const KPIS = [
    { v: s.kpi.plaintes_recues, l: "Plaintes reçues", i: "📥", c: "text-navy-800" },
    { v: s.kpi.dossiers_clotures, l: "Dossiers clôturés", i: "📁", c: "text-emerald-700" },
    { v: s.kpi.mediations_reussies, l: "Médiations réussies", i: "🤝", c: "text-amber-600" },
    { v: s.kpi.sanctions_executees, l: "Sanctions exécutées", i: "⚖️", c: "text-flag-red" },
  ];

  const sexes = s.sexes.map((x) => ({
    nom: x.sexe === "M" ? "Homme" : x.sexe === "F" ? "Femme" : "Non précisé",
    total: x.total,
    couleur: x.sexe === "M" ? "#007fff" : x.sexe === "F" ? "#ec4899" : "#94a3b8",
  }));

  const gravites = ["faible", "moyen", "eleve", "tres_eleve"].map((g) => ({
    nom: { faible: "Faible", moyen: "Moyen", eleve: "Élevé", tres_eleve: "Très élevé" }[g]!,
    total: s.gravites.find((x) => x.score_gravite === g)?.total ?? 0,
    couleur: { faible: "#0e9f6e", moyen: "#f5c518", eleve: "#f97316", tres_eleve: "#ce1021" }[g],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-black text-navy-900">Tableau de bord national</h1>
        <span className="text-xs text-slate-500">Statistiques en temps réel — République Démocratique du Congo</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => (
          <div key={k.l} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <span className="text-3xl">{k.i}</span>
            <div>
              <div className={`text-3xl font-black ${k.c}`}>{Number(k.v).toLocaleString("fr-FR")}</div>
              <div className="text-xs text-slate-500 font-medium">{k.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-xl font-black text-navy-800">{Number(s.kpi.convocations).toLocaleString("fr-FR")}</div>
          <div className="text-xs text-slate-500">Convocations envoyées (API Police)</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-xl font-black text-flag-red">{Number(s.kpi.cas_graves).toLocaleString("fr-FR")}</div>
          <div className="text-xs text-slate-500">Cas graves (élevé / très élevé)</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center col-span-2">
          <div className="text-xl font-black text-emerald-700">{Number(s.kpi.montant_paye).toLocaleString("fr-FR")} FC</div>
          <div className="text-xs text-slate-500">Amendes payées — reçus numériques émis</div>
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-4">Plaintes par province (top 10)</h2>
          <BarresHorizontales data={s.provinces} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-4">Plaintes par type d&apos;infraction</h2>
          <Donut data={s.types} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-4">Évolution des plaintes (12 mois)</h2>
          <Courbe data={s.evolution} />
        </div>
        <div className="grid gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-black text-navy-900 mb-4">Répartition par sexe</h2>
            <Donut data={sexes} taille={140} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-black text-navy-900 mb-4">Score de gravité (IA)</h2>
            <Donut data={gravites} taille={140} />
          </div>
        </div>
      </div>
    </div>
  );
}
