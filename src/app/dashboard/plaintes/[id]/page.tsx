import Link from "next/link";
import { notFound } from "next/navigation";
import { detailPlainte } from "@/lib/data";
import { LABELS_ETAPE, LABELS_SANCTION, ETAPES_DOSSIER } from "@/lib/db";
import { BadgeGravite, BadgeStatut, JaugeGravite } from "@/components/Charts";
import { avancerDossier, envoyerConvocation, prononcerSanction } from "@/lib/actions";

export const dynamic = "force-dynamic";

const champ = "border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white";

export default async function DetailPlainte({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await detailPlainte(Number(id));
  if (!d) notFound();
  const { plainte, preuves, dossier, convocations, mediations, sanctions } = d;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link href="/dashboard/plaintes" className="text-xs text-slate-500 hover:underline">← Retour aux plaintes</Link>
          <h1 className="text-2xl font-black text-navy-900 font-mono">{plainte.numero}</h1>
        </div>
        <div className="flex items-center gap-3">
          <BadgeGravite gravite={plainte.score_gravite} />
          {dossier && <BadgeStatut statut={dossier.statut} labels={LABELS_ETAPE} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* VICTIME & ACCUSÉ */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-sm">
          <h2 className="font-black text-navy-900">👤 Victime</h2>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500 text-xs">Nom :</span><br /><strong>{plainte.victime_nom}</strong> {plainte.victime_mineure && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">MINEUR</span>}</div>
            <div><span className="text-slate-500 text-xs">Téléphone :</span><br />{plainte.victime_telephone ?? "—"}</div>
            <div><span className="text-slate-500 text-xs">Sexe / Âge :</span><br />{plainte.victime_sexe === "M" ? "Homme" : plainte.victime_sexe === "F" ? "Femme" : "—"} · {plainte.victime_age ?? "—"} ans</div>
            <div><span className="text-slate-500 text-xs">Localisation :</span><br />{[plainte.province, plainte.ville, plainte.commune].filter(Boolean).join(", ") || "—"}</div>
            <div>
              <span className="text-slate-500 text-xs">🪪 Pièce d&apos;identité :</span><br />
              {plainte.piece_identite_numero
                ? <>
                    <strong>{({ carte_nationale: "Carte nationale", passeport: "Passeport", carte_electeur: "Carte d'électeur", permis_conduire: "Permis de conduire" } as Record<string, string>)[plainte.piece_identite_type] ?? plainte.piece_identite_type}</strong>
                    {" "}· <span className="font-mono">{plainte.piece_identite_numero}</span>
                    {plainte.identite_verifiee && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded font-bold">DÉCLARÉE</span>}
                  </>
                : "Non fournie"}
            </div>
          </div>
          <h2 className="font-black text-navy-900 pt-2 border-t border-slate-100">⚠️ Personne mise en cause</h2>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500 text-xs">Nom :</span><br /><strong>{plainte.accuse_nom ?? "Non identifié"}</strong></div>
            <div><span className="text-slate-500 text-xs">Téléphone :</span><br />{plainte.accuse_telephone ?? "—"}</div>
          </div>
          <h2 className="font-black text-navy-900 pt-2 border-t border-slate-100">🗣️ Faits — {plainte.type_infraction ?? "Type non précisé"}</h2>
          <p className="text-slate-700 bg-slate-50 rounded-lg p-3">{plainte.description_faits}</p>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            {plainte.repetition && <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Répétition</span>}
            {plainte.diffusion_publique && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Diffusion publique</span>}
            {plainte.menace_de_mort && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">Menace de mort</span>}
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Canal : {plainte.canal}</span>
          </div>
          <h2 className="font-black text-navy-900 pt-2 border-t border-slate-100">📎 Preuves ({preuves.length})</h2>
          <div className="flex flex-wrap gap-2">
            {preuves.map((p) => (
              <span key={p.id} className="bg-blue-50 text-navy-700 text-xs px-2 py-1 rounded font-medium">
                {p.type} {p.nom_fichier && <span className="text-slate-400">· {p.nom_fichier}</span>}
              </span>
            ))}
            {preuves.length === 0 && <span className="text-xs text-slate-400">Aucune preuve jointe.</span>}
          </div>
        </div>

        {/* RAPPORT IA */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-3">
            🤖 Rapport préliminaire — Intelligence Artificielle{" "}
            {plainte.ia_mode === "claude"
              ? <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full align-middle">Claude · Anthropic</span>
              : <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full align-middle">Moteur local</span>}
          </h2>
          <JaugeGravite gravite={plainte.score_gravite} />
          <pre className="mt-4 text-xs whitespace-pre-wrap bg-navy-950 text-blue-100 rounded-lg p-4 font-mono max-h-96 overflow-y-auto">{plainte.rapport_ia ?? "Aucun rapport."}</pre>
        </div>
      </div>

      {/* WORKFLOW DOSSIER */}
      {dossier && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-black text-navy-900">📁 Dossier {dossier.numero} — Processus de traitement</h2>
          <div className="flex flex-wrap gap-1.5 items-center text-xs">
            {ETAPES_DOSSIER.map((e, i) => {
              const idx = ETAPES_DOSSIER.indexOf(dossier.statut as typeof ETAPES_DOSSIER[number]);
              return (
                <span key={e} className={`px-3 py-1.5 rounded-full font-bold ${i < idx ? "bg-emerald-100 text-emerald-800" : i === idx ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {LABELS_ETAPE[e]}
                </span>
              );
            })}
            {dossier.transmis_parquet && <span className="px-3 py-1.5 rounded-full font-bold bg-red-100 text-red-800">Transmis au parquet</span>}
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <form action={avancerDossier} className="space-y-2">
              <input type="hidden" name="dossier_id" value={dossier.id} />
              <label className="text-xs font-bold text-navy-800 uppercase">Faire avancer le dossier</label>
              <select name="statut" defaultValue={dossier.statut} className={`${champ} w-full`}>
                {ETAPES_DOSSIER.map((e) => <option key={e} value={e}>{LABELS_ETAPE[e]}</option>)}
              </select>
              <button className="w-full bg-navy-800 text-white font-bold py-2 rounded-lg text-sm">Mettre à jour</button>
            </form>

            <form action={envoyerConvocation} className="space-y-2">
              <input type="hidden" name="dossier_id" value={dossier.id} />
              <label className="text-xs font-bold text-navy-800 uppercase">Convoquer via API Police PNC</label>
              <input name="lieu" placeholder="Lieu (Commissariat Central)" className={`${champ} w-full`} />
              <input name="date_convocation" type="datetime-local" className={`${champ} w-full`} />
              <button className="w-full bg-flag-blue text-white font-bold py-2 rounded-lg text-sm">📨 Notifier & convoquer l&apos;accusé</button>
            </form>

            <form action={prononcerSanction} className="space-y-2">
              <input type="hidden" name="dossier_id" value={dossier.id} />
              <label className="text-xs font-bold text-navy-800 uppercase">Enregistrer une sanction (autorité)</label>
              <select name="type" className={`${champ} w-full`} defaultValue="amende">
                {Object.entries(LABELS_SANCTION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input name="montant_fc" type="number" min={0} placeholder="Montant (FC) si amende" className={`${champ} w-full`} />
              <input name="decidee_par" placeholder="Décidée par (Tribunal de Paix)" className={`${champ} w-full`} />
              <button className="w-full bg-flag-red text-white font-bold py-2 rounded-lg text-sm">⚖️ Prononcer</button>
            </form>
          </div>
        </div>
      )}

      {/* HISTORIQUE */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-black text-navy-900 mb-2 text-sm">📨 Convocations ({convocations.length})</h3>
          {convocations.map((c) => (
            <div key={c.id} className="text-xs border-b border-slate-100 py-2 last:border-0">
              <div className="font-bold">{new Date(c.date_convocation).toLocaleString("fr-FR")}</div>
              <div className="text-slate-500">{c.lieu} · {c.api_police_ref}</div>
              <BadgeStatut statut={c.statut} labels={{ envoyee: "Envoyée", notifie: "Notifié", conteste: "Contestée", present: "Présent", absent: "Absent" }} />
              {c.reponse_accuse && <p className="mt-1 text-slate-600 italic">« {c.reponse_accuse} »</p>}
            </div>
          ))}
          {convocations.length === 0 && <p className="text-xs text-slate-400">Aucune convocation.</p>}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-black text-navy-900 mb-2 text-sm">🤝 Médiations ({mediations.length})</h3>
          {mediations.map((m) => (
            <div key={m.id} className="text-xs border-b border-slate-100 py-2 last:border-0">
              <div className="font-bold">{m.mediateur}</div>
              <BadgeStatut statut={m.resultat} labels={{ en_cours: "En cours", reussie: "Réussie", echouee: "Échouée" }} />
              {m.notes && <p className="mt-1 text-slate-500">{m.notes}</p>}
            </div>
          ))}
          {mediations.length === 0 && <p className="text-xs text-slate-400">Aucune médiation.</p>}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-black text-navy-900 mb-2 text-sm">⚖️ Sanctions ({sanctions.length})</h3>
          {sanctions.map((s) => (
            <div key={s.id} className="text-xs border-b border-slate-100 py-2 last:border-0">
              <div className="font-bold">{LABELS_SANCTION[s.type] ?? s.type}</div>
              {Number(s.montant_fc) > 0 && <div className="text-flag-red font-black">{Number(s.montant_fc).toLocaleString("fr-FR")} FC</div>}
              <div className="text-slate-500">{s.decidee_par}</div>
              <BadgeStatut statut={s.statut} labels={{ prononcee: "Prononcée", executee: "Exécutée", payee: "Payée" }} />
            </div>
          ))}
          {sanctions.length === 0 && <p className="text-xs text-slate-400">Aucune sanction.</p>}
        </div>
      </div>
    </div>
  );
}
