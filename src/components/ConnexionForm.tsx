"use client";

import { useState, useTransition } from "react";
import { connexion } from "@/lib/actions";
import Logo from "./Logo";

export default function ConnexionForm() {
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <form
      action={(fd) => startTransition(async () => {
        const r = await connexion(fd);
        if (r?.erreur) setErreur(r.erreur);
      })}
      className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
    >
      <div className="flex flex-col items-center mb-6">
        <Logo size={70} />
        <h1 className="font-black text-navy-900 text-xl mt-3">Espace autorités</h1>
        <p className="text-xs text-slate-500 text-center mt-1">
          Réservé aux autorités compétentes : Ministère de la Justice, Police Nationale Congolaise,
          Parquet, Tribunaux, Médiateurs. Authentification sécurisée · accès journalisés.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-navy-800 uppercase mb-1">Email</label>
          <input name="email" type="email" required className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" placeholder="admin@respect-rdc.cd" />
        </div>
        <div>
          <label className="block text-xs font-bold text-navy-800 uppercase mb-1">Mot de passe</label>
          <input name="mot_de_passe" type="password" required className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" placeholder="••••••••" />
        </div>
        {erreur && <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm">⚠️ {erreur}</div>}
        <button disabled={pending} className="w-full bg-navy-900 hover:bg-navy-800 text-white font-black py-3 rounded-lg disabled:opacity-60">
          {pending ? "Vérification..." : "Se connecter"}
        </button>
        <p className="text-[11px] text-slate-400 text-center">
          Compte de démonstration : admin@respect-rdc.cd / respect2026
        </p>
      </div>
    </form>
  );
}
