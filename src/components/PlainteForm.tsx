"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deposerPlainte } from "@/lib/actions";

const PREUVES = [
  { code: "audio", label: "🎙️ Audio" },
  { code: "video", label: "🎬 Vidéo" },
  { code: "photo", label: "📷 Photo" },
  { code: "capture", label: "🖼️ Capture d'écran" },
  { code: "sms", label: "💬 SMS" },
  { code: "whatsapp", label: "🟢 WhatsApp" },
  { code: "facebook", label: "🔵 Facebook" },
  { code: "x", label: "⚫ X (Twitter)" },
  { code: "tiktok", label: "🎵 TikTok" },
  { code: "instagram", label: "🟣 Instagram" },
  { code: "email", label: "✉️ Email" },
];

type Ref = { id: number; nom: string };

const champ = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700 bg-white";
const etiquette = "block text-xs font-bold text-navy-800 uppercase tracking-wide mb-1";

export default function PlainteForm({ provinces, types }: { provinces: Ref[]; types: Ref[] }) {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<{ numero?: string; gravite?: string; erreur?: string } | null>(null);

  if (resultat?.numero) {
    const labels: Record<string, string> = { faible: "FAIBLE", moyen: "MOYEN", eleve: "ÉLEVÉ", tres_eleve: "TRÈS ÉLEVÉ" };
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h2 className="text-2xl font-black text-emerald-800">Plainte enregistrée avec succès</h2>
        <p className="mt-3 text-sm text-slate-700">Votre numéro de dossier (conservez-le précieusement) :</p>
        <div className="mt-2 text-3xl font-black text-navy-900 tracking-wider bg-white rounded-xl py-4 border border-emerald-300">
          {resultat.numero}
        </div>
        <p className="mt-4 text-sm text-slate-700">
          Score de gravité attribué par l&apos;IA : <strong>{labels[resultat.gravite ?? ""] ?? "—"}</strong>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          L&apos;accusé sera notifié et convoqué via l&apos;API de la Police Nationale Congolaise.
          Vous serez informé de chaque étape : médiation, enquête, audience, décision.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/suivi?numero=${resultat.numero}`} className="bg-navy-800 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
            Suivre mon dossier
          </Link>
          <button onClick={() => setResultat(null)} className="border border-slate-300 font-bold px-5 py-2.5 rounded-lg text-sm">
            Nouvelle plainte
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={(fd) => startTransition(async () => {
        const r = await deposerPlainte(fd);
        setResultat(r ?? { erreur: "Erreur inconnue." });
      })}
      className="space-y-6"
    >
      {/* VICTIME */}
      <fieldset className="bg-white rounded-xl border border-slate-200 p-5">
        <legend className="font-black text-navy-900 px-2">👤 Informations de la victime</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={etiquette}>Nom complet *</label>
            <input name="victime_nom" required className={champ} placeholder="Nom, postnom et prénom" />
          </div>
          <div>
            <label className={etiquette}>Téléphone</label>
            <input name="victime_telephone" className={champ} placeholder="+243 ..." />
          </div>
          <div>
            <label className={etiquette}>Email</label>
            <input name="victime_email" type="email" className={champ} placeholder="exemple@mail.cd" />
          </div>
          <div>
            <label className={etiquette}>Sexe</label>
            <select name="victime_sexe" className={champ} defaultValue="">
              <option value="">— Sélectionner —</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>
          <div>
            <label className={etiquette}>Âge</label>
            <input name="victime_age" type="number" min={1} max={120} className={champ} placeholder="Ex : 28" />
          </div>
          <div className="sm:col-span-2">
            <label className={etiquette}>Adresse</label>
            <input name="victime_adresse" className={champ} placeholder="Avenue, quartier..." />
          </div>
          <div>
            <label className={etiquette}>Province</label>
            <select name="province_id" className={champ} defaultValue="">
              <option value="">— Sélectionner —</option>
              {provinces.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={etiquette}>Ville</label>
            <input name="ville" className={champ} placeholder="Ex : Kinshasa" />
          </div>
          <div className="sm:col-span-2">
            <label className={etiquette}>Commune</label>
            <input name="commune" className={champ} placeholder="Ex : Gombe" />
          </div>
          <div>
            <label className={etiquette}>Pièce d&apos;identité</label>
            <select name="piece_identite_type" className={champ} defaultValue="">
              <option value="">— Sélectionner —</option>
              <option value="carte_nationale">Carte nationale</option>
              <option value="passeport">Passeport</option>
              <option value="carte_electeur">Carte d&apos;électeur</option>
              <option value="permis_conduire">Permis de conduire</option>
            </select>
          </div>
          <div>
            <label className={etiquette}>Numéro de la pièce</label>
            <input name="piece_identite_numero" className={champ} placeholder="N° de la pièce d'identité" />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          🪪 Module d&apos;identification : la vérification d&apos;identité (biométrie, empreintes digitales,
          reconnaissance faciale) est effectuée par les services compétents lors du traitement du dossier.
        </p>
      </fieldset>

      {/* FAITS */}
      <fieldset className="bg-white rounded-xl border border-slate-200 p-5">
        <legend className="font-black text-navy-900 px-2">🗣️ Description des faits</legend>
        <div className="space-y-4">
          <div>
            <label className={etiquette}>Type d&apos;infraction *</label>
            <select name="type_infraction_id" required className={champ} defaultValue="">
              <option value="">— Sélectionner —</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={etiquette}>Décrivez ce qui s&apos;est passé *</label>
            <textarea
              name="description_faits" required rows={5} className={champ}
              placeholder="Décrivez l'infraction : paroles prononcées, contexte, lieu, témoins... L'IA analysera automatiquement votre description."
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <label className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-200 cursor-pointer">
              <input type="checkbox" name="repetition" className="accent-navy-800" />
              Faits répétés
            </label>
            <label className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-200 cursor-pointer">
              <input type="checkbox" name="diffusion_publique" className="accent-navy-800" />
              Diffusion publique
            </label>
            <label className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-200 cursor-pointer">
              <input type="checkbox" name="menace_de_mort" className="accent-navy-800" />
              Menace de mort
            </label>
          </div>
        </div>
      </fieldset>

      {/* ACCUSÉ */}
      <fieldset className="bg-white rounded-xl border border-slate-200 p-5">
        <legend className="font-black text-navy-900 px-2">⚠️ Personne mise en cause</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiquette}>Nom de l&apos;accusé</label>
            <input name="accuse_nom" className={champ} placeholder="Si connu" />
          </div>
          <div>
            <label className={etiquette}>Téléphone de l&apos;accusé</label>
            <input name="accuse_telephone" className={champ} placeholder="+243 ..." />
          </div>
          <div className="sm:col-span-2">
            <label className={etiquette}>Adresse de l&apos;accusé</label>
            <input name="accuse_adresse" className={champ} placeholder="Si connue" />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Si l&apos;accusé est identifié, il sera automatiquement notifié et convoqué via l&apos;API
          sécurisée de la Police Nationale Congolaise, avec possibilité de contester et de se défendre.
        </p>
      </fieldset>

      {/* PREUVES */}
      <fieldset className="bg-white rounded-xl border border-slate-200 p-5">
        <legend className="font-black text-navy-900 px-2">📎 Joindre des preuves</legend>
        <p className="text-xs text-slate-500 mb-3">Cochez les types de preuves que vous possédez — un agent vous contactera pour les récupérer de façon sécurisée.</p>
        <div className="flex flex-wrap gap-2">
          {PREUVES.map((p) => (
            <label key={p.code} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-sm cursor-pointer has-checked:bg-navy-800 has-checked:text-white">
              <input type="checkbox" name="preuves" value={p.code} className="accent-gold" />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>

      {resultat?.erreur && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm font-medium">⚠️ {resultat.erreur}</div>
      )}

      <button
        type="submit" disabled={pending}
        className="w-full bg-flag-red hover:brightness-110 disabled:opacity-60 text-white font-black text-lg py-4 rounded-xl"
      >
        {pending ? "Analyse IA en cours..." : "🚨 Soumettre la plainte"}
      </button>
      <p className="text-[11px] text-slate-400 text-center">
        Toute fausse déclaration constitue une infraction de diffusion de fausses accusations, punissable par la loi.
      </p>
    </form>
  );
}
