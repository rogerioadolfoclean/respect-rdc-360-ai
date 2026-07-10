import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PlainteForm from "@/components/PlainteForm";
import { referentiels } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PagePlainte() {
  const { provinces, types } = await referentiels();
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black text-navy-900">📝 Formulaire de plainte en ligne</h1>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Toute victime d&apos;une infraction verbale peut enregistrer une plainte en ligne.
          Le système est connecté via l&apos;API de la Police Nationale Congolaise : l&apos;accusé sera
          automatiquement <strong>notifié et convoqué</strong>. Vos données sont chiffrées et protégées.
        </p>
        <PlainteForm provinces={provinces} types={types} />
      </main>
      <SiteFooter />
    </div>
  );
}
