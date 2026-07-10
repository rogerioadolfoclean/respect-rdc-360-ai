export default function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-blue-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-black text-white mb-2">RESPECT RDC 360 AI</div>
          <p className="text-blue-200">
            Plateforme Nationale Intelligente de Prévention, Signalement et Sanction des
            Infractions Verbales. Le respect commence par nos paroles.
          </p>
        </div>
        <div>
          <div className="font-bold text-gold mb-2">Acteurs concernés</div>
          <p className="text-blue-200">
            Ministère de la Justice · Police Nationale Congolaise · Parquet · Tribunaux ·
            Commission nationale des droits humains · Barreau · Avocats · Médiateurs · Services sociaux
          </p>
        </div>
        <div>
          <div className="font-bold text-gold mb-2">Principe fondamental</div>
          <p className="text-blue-200">
            Aucune personne n&apos;est automatiquement condamnée par une intelligence artificielle.
            La décision finale appartient toujours à l&apos;autorité humaine compétente, avec droit de défense.
          </p>
        </div>
      </div>
      <div className="border-t border-navy-700 text-center text-xs text-blue-300 py-3 px-4">
        © {new Date().getFullYear()} République Démocratique du Congo — Laboratoire DevaryxKernel Software ·
        Données chiffrées, accès journalisés, protection des données personnelles
      </div>
    </footer>
  );
}
