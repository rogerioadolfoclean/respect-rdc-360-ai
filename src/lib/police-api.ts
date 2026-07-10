// Client officiel de l'API PNC — Police Nationale Congolaise · Système Digital 360 AI
// Connexion RÉELLE : chaque convocation est transmise au système de la Police
// (POST https://police-rdc-360-ai.vercel.app/api/pnc/convocations, clé x-api-key).
// Si l'API est momentanément injoignable, une référence locale est générée en repli
// et la convocation reste valable côté RESPECT.

export type DemandeConvocationPNC = {
  dossier_numero: string;
  plainte_numero?: string;
  accuse_nom?: string | null;
  accuse_telephone?: string | null;
  accuse_adresse?: string | null;
  infraction?: string | null;
  gravite?: string | null;
  date_convocation?: string;
  lieu?: string;
  details?: string;
};

export type ReponsePNC = {
  reference: string;
  statut: "notifie" | "envoyee";
  mode: "api_reelle" | "repli_local";
  message: string;
};

export async function notifierPoliceNationale(demande: DemandeConvocationPNC): Promise<ReponsePNC> {
  const url = process.env.POLICE_API_URL;
  const cle = process.env.PNC_API_KEY;

  if (url && cle) {
    try {
      const reponse = await fetch(`${url.replace(/\/$/, "")}/api/pnc/convocations`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": cle },
        body: JSON.stringify({ source_systeme: "RESPECT RDC 360 AI", ...demande }),
        signal: AbortSignal.timeout(9000),
        cache: "no-store",
      });
      if (reponse.ok) {
        const d = await reponse.json();
        if (d?.ok && d?.reference) {
          return {
            reference: d.reference,
            statut: "notifie",
            mode: "api_reelle",
            message: d.message ?? "Convocation transmise à la Police Nationale Congolaise.",
          };
        }
      }
      console.error("API PNC — réponse inattendue:", reponse.status);
    } catch (e) {
      console.error("API PNC injoignable:", e instanceof Error ? e.message : e);
    }
  }

  return {
    reference: `PNC-LOCAL-${Math.floor(100000 + Math.random() * 900000)}`,
    statut: "envoyee",
    mode: "repli_local",
    message: "API PNC momentanément indisponible — convocation enregistrée localement, retransmission par les services.",
  };
}
