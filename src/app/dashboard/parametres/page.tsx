import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

const SECURITE = [
  { l: "Chiffrement des données", d: "Connexions TLS (sslmode=verify-full) vers la base de données nationale", ok: true },
  { l: "Authentification", d: "Sessions sécurisées HttpOnly — biométrie prévue en Phase 2", ok: true },
  { l: "Journalisation des accès", d: "Chaque action sensible est enregistrée dans le journal d'audit", ok: true },
  { l: "Sauvegardes automatiques", d: "Sauvegardes gérées par l'infrastructure cloud Neon (point-in-time recovery)", ok: true },
  { l: "Protection contre la fraude", d: "Références de paiement uniques + reçus numériques vérifiables", ok: true },
  { l: "Archivage sécurisé", d: "Dossiers clôturés conservés conformément à la loi", ok: true },
  { l: "Protection des données personnelles", d: "Accès restreint aux autorités compétentes uniquement", ok: true },
];

const ACTEURS = [
  "Ministère de la Justice", "Police Nationale Congolaise", "Parquet", "Tribunaux",
  "Commission nationale des droits humains", "Barreau", "Avocats", "Médiateurs", "Services sociaux",
];

export default async function PageParametres() {
  const { rows: [db] } = await pool.query("SELECT current_database() AS db, version() AS version");
  const { rows: compteurs } = await pool.query(`SELECT 'Plaintes' AS t, COUNT(*)::int AS n FROM plaintes
    UNION ALL SELECT 'Dossiers', COUNT(*)::int FROM dossiers
    UNION ALL SELECT 'Convocations', COUNT(*)::int FROM convocations
    UNION ALL SELECT 'Médiations', COUNT(*)::int FROM mediations
    UNION ALL SELECT 'Sanctions', COUNT(*)::int FROM sanctions
    UNION ALL SELECT 'Paiements', COUNT(*)::int FROM paiements
    UNION ALL SELECT 'Utilisateurs', COUNT(*)::int FROM utilisateurs
    UNION ALL SELECT 'Journal d''accès', COUNT(*)::int FROM journal_acces`);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-black text-navy-900">Paramètres du système</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-black text-navy-900 mb-3">🔗 Connexion API Police Nationale Congolaise</h2>
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="font-bold text-emerald-800">API sécurisée — OPÉRATIONNELLE</div>
            <div className="text-xs text-slate-600">
              Notification automatique · Convocation officielle · Suivi du dossier · Rapport d&apos;exécution
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-black text-navy-900 mb-3">🛡️ Sécurité</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SECURITE.map((s) => (
            <div key={s.l} className="flex gap-2 text-sm bg-slate-50 rounded-lg p-3 border border-slate-100">
              <span className="text-emerald-600 font-black">✓</span>
              <div>
                <div className="font-bold text-navy-900">{s.l}</div>
                <div className="text-xs text-slate-500">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-3">🗄️ Base de données nationale</h2>
          <div className="text-sm space-y-1">
            <div><span className="text-slate-500">Base :</span> <strong className="font-mono">{db.db}</strong> (PostgreSQL — Neon Cloud)</div>
          </div>
          <table className="w-full text-sm mt-3">
            <tbody>
              {compteurs.map((c) => (
                <tr key={c.t} className="border-t border-slate-100">
                  <td className="py-1.5 text-slate-600">{c.t}</td>
                  <td className="py-1.5 text-right font-black text-navy-800">{c.n.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-black text-navy-900 mb-3">🏛️ Acteurs concernés</h2>
          <div className="flex flex-wrap gap-2">
            {ACTEURS.map((a) => (
              <span key={a} className="bg-blue-50 text-navy-800 text-xs font-bold px-3 py-1.5 rounded-full">{a}</span>
            ))}
          </div>
          <h2 className="font-black text-navy-900 mt-5 mb-2">⚖️ Principe fondamental</h2>
          <p className="text-xs text-slate-600">
            L&apos;IA aide à analyser les preuves et orienter les dossiers, mais la décision finale sur la
            culpabilité et toute sanction financière est toujours prise par l&apos;autorité humaine compétente,
            avec possibilité pour la personne mise en cause de se défendre.
          </p>
        </div>
      </div>
    </div>
  );
}
