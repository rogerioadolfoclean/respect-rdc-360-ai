import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { pool } from "@/lib/db";
import FormationCard from "@/components/FormationCard";

export const dynamic = "force-dynamic";

export default async function PageFormations() {
  const { rows: formations } = await pool.query("SELECT * FROM formations ORDER BY id");
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black text-navy-900">🎓 Sensibilisation & Formation</h1>
        <p className="text-sm text-slate-600 mt-2 mb-8">
          Formations <strong>gratuites</strong> ouvertes à tous les citoyens : respect des personnes, droits humains,
          tolérance, citoyenneté, communication non violente et lutte contre la haine.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((f) => (
            <FormationCard key={f.id} formation={f} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
