import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { pool } from "@/lib/db";
import { repondreConvocation } from "@/lib/actions";
import { BadgeStatut } from "@/components/Charts";

export const dynamic = "force-dynamic";

async function convocationsParNumero(numero: string) {
  const n = numero.trim().toUpperCase().replace("RSP-", "DOS-");
  const { rows } = await pool.query(
    `SELECT c.*, d.numero AS dossier_numero, pl.numero AS plainte_numero, pl.accuse_nom, t.nom AS type_infraction
     FROM convocations c
     JOIN dossiers d ON d.id = c.dossier_id
     JOIN plaintes pl ON pl.id = d.plainte_id
     LEFT JOIN types_infraction t ON t.id = pl.type_infraction_id
     WHERE UPPER(d.numero) = $1 ORDER BY c.created_at DESC`, [n]);
  return rows;
}

export default async function PageConvocation({ searchParams }: { searchParams: Promise<{ numero?: string }> }) {
  const { numero } = await searchParams;
  const convocations = numero ? await convocationsParNumero(numero) : [];

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black text-navy-900">📨 Convocations</h1>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Vous avez été notifié d&apos;une plainte à votre encontre ? Entrez le numéro de dossier figurant
          sur la notification reçue de la Police Nationale Congolaise. Munissez-vous de votre pièce d&apos;identité.
        </p>

        <form className="flex gap-2 mb-8">
          <input
            name="numero"
            defaultValue={numero ?? ""}
            placeholder="DOS-2026-000123"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-navy-700"
          />
          <button className="bg-navy-800 text-white font-bold px-6 rounded-lg">Rechercher</button>
        </form>

        {numero && convocations.length === 0 && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center text-red-800 font-medium">
            Aucune convocation trouvée pour « {numero} ».
          </div>
        )}

        {convocations.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border-2 border-navy-800 overflow-hidden mb-6">
            <div className="bg-navy-900 text-white px-6 py-4">
              <div className="text-xs uppercase tracking-widest text-gold font-bold">République Démocratique du Congo</div>
              <div className="font-black text-lg">CONVOCATION OFFICIELLE — Police Nationale Congolaise</div>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p className="text-base">
                Vous avez été <strong>notifié d&apos;une plainte à votre encontre</strong>
                {c.accuse_nom && <> (M./Mme <strong>{c.accuse_nom}</strong>)</>}. Vous êtes convoqué.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <div><span className="text-slate-500">Dossier :</span> <strong className="font-mono">{c.dossier_numero}</strong></div>
                <div><span className="text-slate-500">Infraction alléguée :</span> <strong>{c.type_infraction ?? "—"}</strong></div>
                <div><span className="text-slate-500">Date :</span> <strong>{new Date(c.date_convocation).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}</strong></div>
                <div><span className="text-slate-500">Lieu :</span> <strong>{c.lieu}</strong></div>
                <div><span className="text-slate-500">Réf. API Police :</span> <strong className="font-mono">{c.api_police_ref}</strong></div>
                <div className="flex items-center gap-2"><span className="text-slate-500">Statut :</span> <BadgeStatut statut={c.statut} labels={{ envoyee: "Envoyée", notifie: "Notifié", conteste: "Contestée", present: "Présent", absent: "Absent" }} /></div>
              </div>
              <p className="text-xs text-slate-500">
                Munissez-vous de votre pièce d&apos;identité. Conformément au principe fondamental de la plateforme,
                vous avez le droit de contester cette plainte et de vous défendre devant l&apos;autorité compétente.
              </p>
              {c.reponse_accuse && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                  <strong>Votre réponse enregistrée :</strong> {c.reponse_accuse}
                </div>
              )}
              {c.statut !== "conteste" && (
                <form action={repondreConvocation} className="border-t border-slate-200 pt-4 space-y-3">
                  <input type="hidden" name="convocation_id" value={c.id} />
                  <label className="block text-xs font-bold text-navy-800 uppercase">Répondre ou contester</label>
                  <textarea
                    name="reponse" rows={3} required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Expliquez votre version des faits ou les motifs de votre contestation..."
                  />
                  <div className="flex gap-3">
                    <button name="action" value="repondre" className="bg-navy-800 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
                      ✔️ Voir les détails & Répondre
                    </button>
                    <button name="action" value="contester" className="bg-flag-red text-white font-bold px-5 py-2.5 rounded-lg text-sm">
                      ✖️ Contester
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
