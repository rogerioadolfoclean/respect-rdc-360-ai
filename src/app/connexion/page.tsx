import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ConnexionForm from "@/components/ConnexionForm";

export default function PageConnexion() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700">
        <ConnexionForm />
      </main>
      <SiteFooter />
    </div>
  );
}
