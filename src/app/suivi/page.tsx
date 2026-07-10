import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { suiviParNumero } from "@/lib/data";
import { ETAPES_DOSSIER, LABELS_ETAPE, LABELS_SANCTION } from "@/lib/db";
import { BadgeGravite, BadgeStatut, JaugeGravite } from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function PageSuivi({ searchParams }: { searchParams: Promise<{ numero?: string }> }) {
  const { numero } = await searchParams;
  const suivi = numero ? await suiviParNumero(numero) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black text-navy-900">📁 Suivi de dossier</h1>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Entrez votre numéro de dossier (ex : RSP-2026-000123) pour suivre l&apos;évolution de votre plainte en temps réel.
        </p>

        <form className="flex gap-2 mb-8">
          <input
            name="numero"
            defaultValue={numero ?? ""}
            placeholder="RSP-2026-000123"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <button className="bg-navy-800 text-white font-bold px-6 rounded-lg">Rechercher</button>
        </form>

        {numero && !suivi && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center text-red-800 font-medium">
            Aucun dossier trouvé pour « {numero} ». Vérifiez le numéro et réessayez.
          </div>
        )}

        {suivi && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Dossier</div>
                  <div className="text-2xl font-black text-navy-900 font-mono">{suivi.plainte.numero}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Statut actuel</div>
                  <BadgeStatut statut={suivi.dossier?.statut ?? "plainte_recue"} labels={LABELS_ETAPE} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                <div><span className="text-slate-500">Type :</span> <strong>{suivi.plainte.type_infraction ?? "—"}</strong></div>
                <div><span className="text-slate-500">Province :</span> <strong>{suivi.plainte.province ?? "—"}</strong></div>
                <div><span className="text-slate-500">Déposée le :</span> <strong>{new Date(suivi.plainte.created_at).toLocaleDateString("fr-FR")}</strong></div>
                <div className="flex items-center gap-2"><span className="text-slate-500">Gravité IA :</span> <BadgeGravite gravite={suivi.plainte.score_gravite} /></div>
              </div>
              <div className="mt-4"><JaugeGravite gravite={suivi.plainte.score_gravite} /></div>
            </div>

            {/* TIMELINE */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-black text-navy-900 mb-4">Évolution du dossier</h2>
              <ol className="relative border-l-2 border-slate-200 ml-3 space-y-5">
                {ETAPES_DOSSIER.map((e, i) => {
                  const idxActuel = ETAPES_DOSSIER.indexOf((suivi.dossier?.statut ?? "plainte_recue") as typeof ETAPES_DOSSIER[number]);
                  const fait = i <= idxActuel;
                  const actuel = i === idxActuel;
                  return (
                    <li key={e} className="ml-5">
                      <span
                        className={`absolute -left-[11px] w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                          fait ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-300"
                        }`}
                      >
                        {fait ? "✓" : i + 1}
                      </span>
                      <span className={`text-sm font-bold ${actuel ? "text-navy-900" : fait ? "text-emerald-700" : "text-slate-400"}`}>
                        {LABELS_ETAPE[e]}
                        {actuel && <span className="ml-2 text-[10px] bg-gold text-navy-950 px-2 py-0.5 rounded-full uppercase">En cours</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* CONVOCATIONS */}
            {suivi.convocations.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-black text-navy-900 mb-3">📨 Convocations</h2>
                {suivi.convocations.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm last:border-0">
                    <div>
                      <div className="font-bold">{new Date(c.date_convocation).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}</div>
                      <div className="text-slate-500 text-xs">{c.lieu} · Réf. API Police : {c.api_police_ref}</div>
                    </div>
                    <BadgeStatut statut={c.statut} labels={{ envoyee: "Envoyée", notifie: "Accusé notifié", conteste: "Contestée", present: "Présent", absent: "Absent" }} />
                  </div>
                ))}
              </div>
            )}

            {/* MÉDIATIONS */}
            {suivi.mediations.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-black text-navy-900 mb-3">🤝 Médiation</h2>
                {suivi.mediations.map((m) => (
                  <div key={m.id} className="border-b border-slate-100 py-2 text-sm last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{m.mediateur}</span>
                      <BadgeStatut statut={m.resultat} labels={{ en_cours: "En cours", reussie: "Réussie", echouee: "Échouée" }} />
                    </div>
                    {m.notes && <p className="text-slate-500 text-xs mt-1">{m.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* SANCTIONS */}
            {suivi.sanctions.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-black text-navy-900 mb-3">⚖️ Décisions et sanctions</h2>
                {suivi.sanctions.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm last:border-0">
                    <div>
                      <div className="font-bold">{LABELS_SANCTION[s.type] ?? s.type}</div>
                      <div className="text-slate-500 text-xs">
                        Décidée par : {s.decidee_par}
                        {Number(s.montant_fc) > 0 && <> · Montant : <strong>{Number(s.montant_fc).toLocaleString("fr-FR")} FC</strong></>}
                      </div>
                    </div>
                    <BadgeStatut statut={s.statut} labels={{ prononcee: "Prononcée", executee: "Exécutée", payee: "Payée" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
