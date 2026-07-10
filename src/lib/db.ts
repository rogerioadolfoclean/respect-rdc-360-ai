import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

export const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") global.pgPool = pool;

export type Plainte = {
  id: number;
  numero: string;
  victime_nom: string;
  victime_telephone: string | null;
  victime_email: string | null;
  victime_adresse: string | null;
  victime_sexe: "M" | "F" | null;
  victime_age: number | null;
  victime_mineure: boolean;
  accuse_nom: string | null;
  accuse_telephone: string | null;
  accuse_adresse: string | null;
  type_infraction_id: number | null;
  type_infraction?: string;
  description_faits: string;
  canal: string;
  province_id: number | null;
  province?: string;
  ville: string | null;
  commune: string | null;
  diffusion_publique: boolean;
  menace_de_mort: boolean;
  repetition: boolean;
  statut: string;
  score_gravite: "faible" | "moyen" | "eleve" | "tres_eleve" | null;
  score_points: number;
  rapport_ia: string | null;
  created_at: string;
};

export type Dossier = {
  id: number;
  plainte_id: number;
  numero: string;
  statut: string;
  transmis_parquet: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export {
  ETAPES_DOSSIER,
  LABELS_ETAPE,
  LABELS_GRAVITE,
  LABELS_SANCTION,
  METHODES_PAIEMENT,
} from "./constants";
