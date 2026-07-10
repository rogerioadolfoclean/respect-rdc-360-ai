import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import Sidebar from "@/components/Sidebar";
import { sessionActuelle, deconnexion } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await sessionActuelle();
  if (!session) redirect("/connexion");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-navy-950 text-white">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={36} />
            <div>
              <div className="font-black text-sm leading-tight">
                RESPECT <span className="text-flag-red">RDC</span> <span className="text-gold">360 AI</span>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-blue-200">Site Web — Tableau de bord national</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="bg-navy-800 px-3 py-1.5 rounded-full">
              👤 {session.nom} · <span className="text-gold uppercase font-bold">{session.role}</span>
            </span>
          </div>
        </div>
        <div className="h-0.5 flex">
          <div className="flex-1 bg-flag-blue" /><div className="flex-1 bg-gold" /><div className="flex-1 bg-flag-red" />
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar
          deconnexion={
            <form action={deconnexion}>
              <button className="w-full text-left text-sm text-blue-100 hover:text-white flex items-center gap-3 px-1">
                <span>🚪</span> Déconnexion
              </button>
            </form>
          }
        />
        <main className="flex-1 min-w-0 p-4 md:p-6 bg-background">{children}</main>
      </div>
    </div>
  );
}
