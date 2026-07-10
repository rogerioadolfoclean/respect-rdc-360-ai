import Link from "next/link";
import Logo from "./Logo";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/plainte", label: "Déposer une plainte" },
  { href: "/suivi", label: "Suivre mon dossier" },
  { href: "/convocation", label: "Convocations" },
  { href: "/paiement", label: "Payer une amende" },
  { href: "/formations", label: "Formations" },
];

export default function SiteHeader() {
  return (
    <header className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={44} />
          <div>
            <div className="font-black text-lg leading-tight">
              RESPECT <span className="text-flag-red">RDC</span> <span className="text-gold">360 AI</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-blue-200">
              Plateforme Nationale — République Démocratique du Congo
            </div>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 ml-auto text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-md hover:bg-navy-700 transition-colors font-medium"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/connexion"
            className="ml-2 px-4 py-2 rounded-md bg-gold text-navy-950 font-bold hover:brightness-110"
          >
            Espace autorités
          </Link>
        </nav>
      </div>
      <div className="h-1 flex">
        <div className="flex-1 bg-flag-blue" />
        <div className="flex-1 bg-gold" />
        <div className="flex-1 bg-flag-red" />
      </div>
    </header>
  );
}
