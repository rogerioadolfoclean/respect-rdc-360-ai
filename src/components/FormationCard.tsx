"use client";

import { useState, useTransition } from "react";
import { inscrireFormation } from "@/lib/actions";

type Formation = { id: number; titre: string; theme: string; description: string; duree: string; inscrits: number };

export default function FormationCard({ formation }: { formation: Formation }) {
  const [pending, startTransition] = useTransition();
  const [etat, setEtat] = useState<"idle" | "form" | "ok">("idle");
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-wide text-gold bg-navy-900 self-start px-2 py-1 rounded">
        {formation.theme}
      </div>
      <h3 className="font-black text-navy-900 mt-3">{formation.titre}</h3>
      <p className="text-sm text-slate-600 mt-2 flex-1">{formation.description}</p>
      <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
        <span>⏱️ {formation.duree}</span>
        <span>👥 {formation.inscrits} inscrits</span>
      </div>
      {etat === "ok" ? (
        <div className="mt-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-3 text-sm font-bold text-center">
          ✅ Inscription confirmée !
        </div>
      ) : etat === "form" ? (
        <form
          action={(fd) => startTransition(async () => {
            const r = await inscrireFormation(fd);
            if (r?.erreur) setErreur(r.erreur);
            else setEtat("ok");
          })}
          className="mt-4 space-y-2"
        >
          <input type="hidden" name="formation_id" value={formation.id} />
          <input name="nom" required placeholder="Votre nom complet" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input name="telephone" placeholder="Téléphone (+243...)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          {erreur && <div className="text-xs text-red-700">⚠️ {erreur}</div>}
          <button disabled={pending} className="w-full bg-navy-800 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-60">
            {pending ? "Inscription..." : "Confirmer l'inscription"}
          </button>
        </form>
      ) : (
        <button onClick={() => setEtat("form")} className="mt-4 w-full bg-gold text-navy-950 font-black py-2 rounded-lg text-sm hover:brightness-110">
          S&apos;inscrire gratuitement
        </button>
      )}
    </div>
  );
}
