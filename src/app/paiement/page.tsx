import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { amendesImpayees } from "@/lib/data";
import { pool, LABELS_SANCTION, METHODES_PAIEMENT } from "@/lib/db";
import PaiementForm from "@/components/PaiementForm";
import { BadgeStatut } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function PagePaiement({ searchParams }: { searchParams: Promise<{ numero?: string }> }) {
  const { numero } = await searchParams;
  const amendes = numero ? await amendesImpayees(numero) : [];
  const paiementsIds = amendes.length
    ? (await pool.query(
        `SELECT sanction_id, numero_recu, methode, created_at FROM paiements WHERE sanction_id = ANY($1::int[])`,
        [amendes.map((a) => a.id)]
      )).rows
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black text-navy-900">💳 Paiement des amendes</h1>
        <p className="text-sm text-slate-600 mt-2 mb-4">
          Payez votre amende par Mobile Money, carte bancaire, banque, PayPal ou au Trésor Public.
          Un <strong>reçu numérique automatique</strong> vous est délivré immédiatement.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {METHODES_PAIEMENT.map((m) => (
            <span key={m.code} className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-navy-800">{m.nom}</span>
          ))}
        </div>

        <form className="flex gap-2 mb-8">
          <input
            name="numero"
            defaultValue={numero ?? ""}
            placeholder="Numéro de dossier : DOS-2026-000123"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <button className="bg-navy-800 text-white font-bold px-6 rounded-lg">Rechercher</button>
        </form>

        {numero && amendes.length === 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 text-center text-amber-800 font-medium">
            Aucune amende ou dommages-intérêts trouvés pour « {numero} ».
          </div>
        )}

        <div className="space-y-6">
          {amendes.map((a) => {
            const paiement = paiementsIds.find((p) => p.sanction_id === a.id);
            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="font-black text-navy-900">{LABELS_SANCTION[a.type]}</div>
                    <div className="text-xs text-slate-500">Dossier {a.dossier_numero} · Décidée par {a.decidee_par}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-flag-red">{Number(a.montant_fc).toLocaleString("fr-FR")} FC</div>
                    <BadgeStatut statut={a.statut} labels={{ prononcee: "À payer", executee: "Exécutée", payee: "Payée ✓" }} />
                  </div>
                </div>
                {a.statut === "payee" && paiement ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-sm">
                    ✅ Amende payée via <strong>{METHODES_PAIEMENT.find((m) => m.code === paiement.methode)?.nom ?? paiement.methode}</strong> —
                    Reçu numérique : <strong className="font-mono">{paiement.numero_recu}</strong>
                    <span className="text-slate-500"> ({new Date(paiement.created_at).toLocaleDateString("fr-FR")})</span>
                  </div>
                ) : (
                  <PaiementForm sanctionId={a.id} montant={Number(a.montant_fc)} />
                )}
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
