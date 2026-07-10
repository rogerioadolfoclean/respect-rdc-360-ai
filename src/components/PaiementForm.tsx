"use client";

import { useState, useTransition } from "react";
import { payerAmende } from "@/lib/actions";
import { METHODES_PAIEMENT } from "@/lib/constants";

export default function PaiementForm({ sanctionId, montant }: { sanctionId: number; montant: number }) {
  const [pending, startTransition] = useTransition();
  const [methode, setMethode] = useState("m_pesa");
  const [recu, setRecu] = useState<{ numeroRecu?: string; reference?: string; erreur?: string } | null>(null);

  const mobile = METHODES_PAIEMENT.find((m) => m.code === methode)?.type === "Mobile Money";

  if (recu?.numeroRecu) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">🧾</div>
        <div className="font-black text-emerald-800 text-lg">Paiement confirmé — Reçu numérique automatique</div>
        <div className="mt-3 bg-white rounded-lg border border-emerald-300 p-4 text-left text-sm font-mono space-y-1">
          <div>REÇU N° : <strong>{recu.numeroRecu}</strong></div>
          <div>RÉFÉRENCE : {recu.reference}</div>
          <div>MONTANT : {montant.toLocaleString("fr-FR")} FC</div>
          <div>MÉTHODE : {METHODES_PAIEMENT.find((m) => m.code === methode)?.nom}</div>
          <div>DATE : {new Date().toLocaleString("fr-FR")}</div>
          <div className="text-emerald-700">STATUT : CONFIRMÉ ✓</div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Conservez ce reçu — il fait foi auprès du Trésor Public et des autorités judiciaires.</p>
      </div>
    );
  }

  return (
    <form
      action={(fd) => startTransition(async () => {
        const r = await payerAmende(fd);
        setRecu(r ?? { erreur: "Erreur inconnue" });
      })}
      className="border-t border-slate-200 pt-4"
    >
      <input type="hidden" name="sanction_id" value={sanctionId} />
      <label className="block text-xs font-bold text-navy-800 uppercase mb-2">Choisissez votre méthode de paiement</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {METHODES_PAIEMENT.map((m) => (
          <label
            key={m.code}
            className={`border rounded-lg px-3 py-2 text-sm font-bold cursor-pointer text-center ${
              methode === m.code ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-slate-50 text-navy-800"
            }`}
          >
            <input
              type="radio" name="methode" value={m.code} checked={methode === m.code}
              onChange={() => setMethode(m.code)} className="hidden"
            />
            {m.nom}
            <div className={`text-[10px] font-normal ${methode === m.code ? "text-blue-200" : "text-slate-400"}`}>{m.type}</div>
          </label>
        ))}
      </div>
      {mobile && (
        <div className="mb-4">
          <label className="block text-xs font-bold text-navy-800 uppercase mb-1">Numéro Mobile Money</label>
          <input name="telephone" required placeholder="+243 ..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      )}
      {recu?.erreur && <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm mb-3">⚠️ {recu.erreur}</div>}
      <button disabled={pending} className="w-full bg-emerald-600 hover:brightness-110 disabled:opacity-60 text-white font-black py-3 rounded-lg">
        {pending ? "Traitement du paiement..." : `Payer ${montant.toLocaleString("fr-FR")} FC`}
      </button>
    </form>
  );
}
