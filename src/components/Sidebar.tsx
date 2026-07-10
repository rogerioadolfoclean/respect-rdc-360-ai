"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/dashboard", label: "Tableau de bord", icone: "📊" },
  { href: "/dashboard/plaintes", label: "Plaintes", icone: "📥" },
  { href: "/dashboard/dossiers", label: "Dossiers", icone: "📁" },
  { href: "/dashboard/mediations", label: "Médiations", icone: "🤝" },
  { href: "/dashboard/sanctions", label: "Sanctions", icone: "⚖️" },
  { href: "/dashboard/statistiques", label: "Statistiques", icone: "📈" },
  { href: "/dashboard/utilisateurs", label: "Utilisateurs", icone: "👥" },
  { href: "/dashboard/parametres", label: "Paramètres", icone: "⚙️" },
];

export default function Sidebar({ deconnexion }: { deconnexion: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <aside className="bg-navy-950 text-white w-56 shrink-0 hidden md:flex flex-col min-h-full">
      <nav className="flex-1 py-4">
        {LIENS.map((l) => {
          const actif = l.href === "/dashboard" ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium border-l-4 ${
                actif ? "bg-navy-800 border-gold text-gold" : "border-transparent hover:bg-navy-800/60 text-blue-100"
              }`}
            >
              <span>{l.icone}</span> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-navy-700">{deconnexion}</div>
    </aside>
  );
}
