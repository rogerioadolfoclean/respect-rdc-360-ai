// Constantes partagées client/serveur (aucune dépendance Node)

export const ETAPES_DOSSIER = [
  "plainte_recue",
  "analyse_ia",
  "mediation",
  "enquete",
  "audience",
  "decision",
  "cloture",
] as const;

export const LABELS_ETAPE: Record<string, string> = {
  plainte_recue: "Plainte reçue",
  analyse_ia: "Analyse IA",
  mediation: "Médiation",
  enquete: "Enquête",
  audience: "Audience",
  decision: "Décision",
  cloture: "Clôturé",
};

export const LABELS_GRAVITE: Record<string, string> = {
  faible: "Faible",
  moyen: "Moyen",
  eleve: "Élevé",
  tres_eleve: "Très élevé",
};

export const LABELS_SANCTION: Record<string, string> = {
  avertissement: "Avertissement",
  excuses_publiques: "Obligation d'excuses publiques",
  travaux_interet_general: "Travaux d'intérêt général",
  amende: "Amende",
  dommages_interets: "Dommages-intérêts à la victime",
  formation_citoyennete: "Formation à la citoyenneté",
};

export const METHODES_PAIEMENT: { code: string; nom: string; type: string }[] = [
  { code: "m_pesa", nom: "M-Pesa", type: "Mobile Money" },
  { code: "orange_money", nom: "Orange Money", type: "Mobile Money" },
  { code: "airtel_money", nom: "Airtel Money", type: "Mobile Money" },
  { code: "vodacom_mpesa", nom: "Vodacom M-Pesa", type: "Mobile Money" },
  { code: "tigocash", nom: "TigoCash", type: "Mobile Money" },
  { code: "mtn_momo", nom: "MTN Mobile Money", type: "Mobile Money" },
  { code: "ecocash", nom: "EcoCash", type: "Mobile Money" },
  { code: "hello_cash", nom: "Hello Cash", type: "Mobile Money" },
  { code: "visa", nom: "Carte Visa", type: "Carte bancaire" },
  { code: "mastercard", nom: "Mastercard", type: "Carte bancaire" },
  { code: "paypal", nom: "PayPal", type: "International" },
  { code: "banque", nom: "Virement bancaire", type: "Banque" },
  { code: "bicec", nom: "BICEC / Rawbank", type: "Banque" },
  { code: "tresor_public", nom: "Trésor Public", type: "Guichet officiel" },
];
