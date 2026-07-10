import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Logo from "@/components/Logo";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

const OBJECTIFS = [
  "Réduire les discours de haine",
  "Lutter contre les injures publiques",
  "Réduire la diffamation",
  "Combattre le harcèlement",
  "Prévenir les violences verbales",
  "Lutter contre les discriminations",
  "Favoriser la résolution pacifique des conflits",
  "Sensibiliser les citoyens au respect mutuel",
];

const INFRACTIONS = [
  "Injures publiques", "Injures privées", "Diffamation", "Calomnie", "Menaces verbales",
  "Discours de haine", "Incitation à la violence", "Harcèlement moral", "Harcèlement numérique",
  "Cyberharcèlement", "Racisme", "Tribalisme", "Xénophobie", "Sexisme", "Discrimination religieuse",
  "Diffusion de fausses accusations", "Humiliation publique", "Atteinte à l'honneur",
  "Atteinte à la réputation", "Insultes envers les personnes vulnérables",
];

const EXCLUSIONS = [
  "Les critiques politiques pacifiques",
  "Les débats démocratiques",
  "Les opinions personnelles exprimées sans injure ni haine",
  "Les travaux journalistiques réalisés de bonne foi",
  "Les recherches scientifiques",
  "Les œuvres artistiques protégées par la loi",
];

const CANAUX_PREUVE = ["Audio", "Vidéo", "Photo", "Capture d'écran", "SMS", "WhatsApp", "Facebook", "X (Twitter)", "TikTok", "Instagram", "Email"];

const IA_CAPACITES = [
  "Transcrire les audios",
  "Détecter les insultes",
  "Détecter les menaces",
  "Détecter les discours haineux",
  "Détecter les appels à la violence",
  "Détecter les propos discriminatoires",
  "Produire un rapport préliminaire destiné aux autorités compétentes (sans remplacer la décision humaine)",
];

const PAIEMENTS = ["M-Pesa", "Orange Money", "Airtel Money", "Vodacom M-Pesa", "TigoCash", "MTN Mobile Money", "EcoCash", "Hello Cash", "Visa", "Mastercard", "PayPal", "Banque", "Trésor Public"];

export default async function Accueil() {
  const { rows: [kpi] } = await pool.query(`SELECT
    (SELECT COUNT(*) FROM plaintes)::int AS plaintes,
    (SELECT COUNT(*) FROM dossiers WHERE statut='cloture')::int AS clotures,
    (SELECT COUNT(*) FROM mediations WHERE resultat='reussie')::int AS mediations,
    (SELECT COUNT(*) FROM sanctions WHERE statut IN ('executee','payee'))::int AS sanctions`);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      {/* HÉRO */}
      <section className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-flag-red text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Projet National — République Démocratique du Congo
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              RESPECT <span className="text-flag-red">RDC</span> <span className="text-gold">360 AI</span>
            </h1>
            <p className="mt-3 text-xl text-blue-100 font-semibold">
              Plateforme Nationale Intelligente de Prévention, Signalement et Sanction des Infractions Verbales
            </p>
            <p className="mt-4 text-blue-200">
              Construire une société congolaise où le respect, la dignité humaine et la paix sociale
              deviennent des valeurs fondamentales grâce à une plateforme numérique utilisant
              l&apos;intelligence artificielle — conformément à la Constitution, aux droits fondamentaux
              et à la liberté d&apos;expression.
            </p>
            <p className="mt-3 text-gold font-bold italic">« Le respect commence par nos paroles. »</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/plainte" className="bg-flag-red hover:brightness-110 text-white font-bold px-6 py-3 rounded-lg">
                🚨 Déposer une plainte
              </Link>
              <Link href="/suivi" className="bg-gold hover:brightness-110 text-navy-950 font-bold px-6 py-3 rounded-lg">
                📁 Suivre mon dossier
              </Link>
              <Link href="/formations" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-lg">
                🎓 Formations gratuites
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6">
            <Logo size={140} />
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {[
                { v: kpi.plaintes, l: "Plaintes reçues" },
                { v: kpi.clotures, l: "Dossiers clôturés" },
                { v: kpi.mediations, l: "Médiations réussies" },
                { v: kpi.sanctions, l: "Sanctions exécutées" },
              ].map((k) => (
                <div key={k.l} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20">
                  <div className="text-3xl font-black text-gold">{k.v.toLocaleString("fr-FR")}</div>
                  <div className="text-xs text-blue-100 mt-1">{k.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OBJECTIFS */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-black text-navy-900 mb-6">🎯 Objectifs de la plateforme</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {OBJECTIFS.map((o) => (
            <div key={o} className="bg-white rounded-lg border border-slate-200 p-4 text-sm font-medium flex gap-2">
              <span className="text-emerald-600 font-black">✓</span> {o}
            </div>
          ))}
        </div>
      </section>

      {/* INFRACTIONS */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-black text-flag-red mb-4">🗣️ Infractions concernées</h2>
            <div className="flex flex-wrap gap-2">
              {INFRACTIONS.map((i) => (
                <span key={i} className="bg-white border border-red-200 text-red-900 text-xs font-medium px-3 py-1.5 rounded-full">{i}</span>
              ))}
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h2 className="text-xl font-black text-emerald-700 mb-4">🛡️ Infractions exclues — libertés protégées</h2>
            <ul className="space-y-2 text-sm">
              {EXCLUSIONS.map((e) => (
                <li key={e} className="flex gap-2"><span className="text-emerald-600 font-black">✓</span> {e}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-emerald-800 bg-emerald-100 rounded-lg p-3">
              La plateforme ne punit pas les critiques légitimes envers les autorités ni les opinions :
              elle vise uniquement les comportements déjà reconnus comme illicites par la loi congolaise.
            </p>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-black text-navy-900 mb-6">🧩 Modules du système</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-black text-navy-800 mb-3">📤 Dépôt de plainte multi-canaux</h3>
            <p className="text-sm text-slate-600 mb-3">La victime peut joindre des preuves de tout type :</p>
            <div className="flex flex-wrap gap-1.5">
              {CANAUX_PREUVE.map((c) => (
                <span key={c} className="bg-blue-50 text-navy-700 text-xs px-2 py-1 rounded font-medium">{c}</span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-black text-navy-800 mb-3">🤖 Intelligence Artificielle</h3>
            <ul className="text-sm text-slate-600 space-y-1.5">
              {IA_CAPACITES.map((c) => (
                <li key={c} className="flex gap-2"><span className="text-flag-blue">•</span> {c}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-black text-navy-800 mb-3">⚖️ Score de gravité</h3>
            <p className="text-sm text-slate-600 mb-3">Chaque dossier reçoit un score :</p>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-1 rounded text-xs font-bold text-white bg-emerald-600">FAIBLE</span>
              <span className="px-2 py-1 rounded text-xs font-bold text-navy-950 bg-gold">MOYEN</span>
              <span className="px-2 py-1 rounded text-xs font-bold text-white bg-orange-500">ÉLEVÉ</span>
              <span className="px-2 py-1 rounded text-xs font-bold text-white bg-flag-red">TRÈS ÉLEVÉ</span>
            </div>
            <p className="text-xs text-slate-500">
              Selon : nombre d&apos;insultes, répétition, violence, victime mineure, discrimination,
              menace de mort, diffusion publique.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESSUS */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-black mb-2">🔄 Processus de traitement</h2>
          <p className="text-blue-200 text-sm mb-6">
            Avant toute sanction : convocation, excuses, réparation, médiation, conciliation.
            Si la médiation échoue : transmission au parquet, enquête, audience, décision du tribunal.
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {["Plainte reçue", "Analyse IA", "Médiation", "Enquête", "Audience", "Décision", "Clôture"].map((e, i, a) => (
              <div key={e} className="flex items-center gap-2">
                <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm font-bold">
                  <span className="text-gold mr-1">{i + 1}.</span> {e}
                </div>
                {i < a.length - 1 && <span className="text-gold font-black">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-blue-200 bg-white/5 rounded-lg p-3 border border-white/10">
            🔗 <strong>Connexion API Police Nationale Congolaise</strong> — dès l&apos;enregistrement d&apos;une plainte,
            l&apos;accusé est automatiquement notifié et convoqué via l&apos;API sécurisée du système de la Police de la RDC :
            notification automatique, convocation officielle, suivi du dossier, rapport d&apos;exécution.
          </p>
        </div>
      </section>

      {/* PAIEMENTS */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-black text-navy-900 mb-2">💳 Paiement des amendes</h2>
        <p className="text-sm text-slate-600 mb-4">Mobile Money, banque, carte bancaire ou Trésor public — reçu numérique automatique.</p>
        <div className="flex flex-wrap gap-2">
          {PAIEMENTS.map((p) => (
            <span key={p} className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-navy-800">{p}</span>
          ))}
        </div>
      </section>

      {/* PRINCIPE FONDAMENTAL */}
      <section className="bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <h2 className="text-xl font-black text-navy-900 mb-3">⚖️ Principe fondamental</h2>
          <p className="text-sm text-slate-700">
            Aucune personne ne devrait être automatiquement condamnée ou taxée par une intelligence artificielle.
            L&apos;IA peut aider à analyser les preuves et à orienter les dossiers, mais la décision finale sur la
            culpabilité et toute sanction financière doit toujours être prise par l&apos;autorité compétente,
            conformément à la loi et avec la possibilité pour la personne mise en cause de se défendre.
            Ce principe protège à la fois les victimes et les personnes accusées.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
