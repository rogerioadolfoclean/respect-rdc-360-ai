import { pool } from "@/lib/db";
import { ajouterUtilisateur, basculerUtilisateur } from "@/lib/actions";

export const dynamic = "force-dynamic";

const ROLES: Record<string, string> = { admin: "Administrateur", agent: "Agent PNC", mediateur: "Médiateur", magistrat: "Magistrat" };
const champ = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white";

export default async function PageUtilisateurs() {
  const { rows: utilisateurs } = await pool.query("SELECT id, nom, email, role, actif, created_at FROM utilisateurs ORDER BY id");
  const { rows: journal } = await pool.query("SELECT * FROM journal_acces ORDER BY created_at DESC LIMIT 25");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy-900">Utilisateurs & Sécurité</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-900 text-white text-left text-xs uppercase">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-bold">{u.nom}</td>
                  <td className="px-4 py-2.5">{u.email}</td>
                  <td className="px-4 py-2.5"><span className="bg-blue-50 text-navy-800 text-xs font-bold px-2 py-0.5 rounded-full">{ROLES[u.role] ?? u.role}</span></td>
                  <td className="px-4 py-2.5">
                    {u.actif
                      ? <span className="text-emerald-700 text-xs font-bold">● Actif</span>
                      : <span className="text-slate-400 text-xs font-bold">● Désactivé</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={basculerUtilisateur}>
                      <input type="hidden" name="utilisateur_id" value={u.id} />
                      <button className="text-xs font-bold text-navy-700 hover:underline">{u.actif ? "Désactiver" : "Activer"}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          action={async (fd) => {
            "use server";
            await ajouterUtilisateur(fd);
          }}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 h-fit"
        >
          <h2 className="font-black text-navy-900">➕ Nouvel utilisateur</h2>
          <input name="nom" required placeholder="Nom complet" className={champ} />
          <input name="email" type="email" required placeholder="email@respect-rdc.cd" className={champ} />
          <input name="mot_de_passe" type="password" required placeholder="Mot de passe" className={champ} />
          <select name="role" className={champ} defaultValue="agent">
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="w-full bg-navy-800 text-white font-bold py-2.5 rounded-lg text-sm">Créer le compte</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-black text-navy-900 mb-3">🔐 Journalisation des accès (25 derniers événements)</h2>
        <div className="space-y-1 text-xs font-mono max-h-80 overflow-y-auto">
          {journal.map((j) => (
            <div key={j.id} className="flex gap-3 border-b border-slate-50 py-1">
              <span className="text-slate-400 shrink-0">{new Date(j.created_at).toLocaleString("fr-FR")}</span>
              <span className="font-bold text-navy-800 shrink-0">{j.action}</span>
              <span className="text-slate-600 truncate">{j.utilisateur} — {j.details}</span>
            </div>
          ))}
          {journal.length === 0 && <p className="text-slate-400">Aucun événement.</p>}
        </div>
      </div>
    </div>
  );
}
