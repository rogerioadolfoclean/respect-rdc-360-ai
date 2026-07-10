import { pool } from "./db";

export async function statsNationales() {
  const [{ rows: [kpi] }, provinces, types, evolution, sexes, gravites, canaux] = await Promise.all([
    pool.query(`SELECT
      (SELECT COUNT(*) FROM plaintes)::int AS plaintes_recues,
      (SELECT COUNT(*) FROM dossiers WHERE statut='cloture')::int AS dossiers_clotures,
      (SELECT COUNT(*) FROM mediations WHERE resultat='reussie')::int AS mediations_reussies,
      (SELECT COUNT(*) FROM sanctions WHERE statut IN ('executee','payee'))::int AS sanctions_executees,
      (SELECT COALESCE(SUM(montant_fc),0) FROM paiements WHERE statut='confirme')::bigint AS montant_paye,
      (SELECT COUNT(*) FROM convocations)::int AS convocations,
      (SELECT COUNT(*) FROM plaintes WHERE score_gravite IN ('eleve','tres_eleve'))::int AS cas_graves`),
    pool.query(`SELECT p.nom, COUNT(pl.id)::int AS total FROM plaintes pl
      JOIN provinces p ON p.id = pl.province_id
      GROUP BY p.nom ORDER BY total DESC LIMIT 10`),
    pool.query(`SELECT t.nom, COUNT(pl.id)::int AS total FROM plaintes pl
      JOIN types_infraction t ON t.id = pl.type_infraction_id
      GROUP BY t.nom ORDER BY total DESC LIMIT 8`),
    pool.query(`SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'MM/YYYY') AS mois,
      DATE_TRUNC('month', created_at) AS d, COUNT(*)::int AS total
      FROM plaintes GROUP BY 1,2 ORDER BY d ASC LIMIT 12`),
    pool.query(`SELECT COALESCE(victime_sexe,'?') AS sexe, COUNT(*)::int AS total FROM plaintes GROUP BY 1`),
    pool.query(`SELECT score_gravite, COUNT(*)::int AS total FROM plaintes WHERE score_gravite IS NOT NULL GROUP BY 1`),
    pool.query(`SELECT canal, COUNT(*)::int AS total FROM plaintes GROUP BY 1 ORDER BY total DESC`),
  ]);
  return {
    kpi,
    provinces: provinces.rows,
    types: types.rows,
    evolution: evolution.rows,
    sexes: sexes.rows,
    gravites: gravites.rows,
    canaux: canaux.rows,
  };
}

export async function listePlaintes(filtre?: string) {
  const where = filtre ? `WHERE pl.statut = $1` : "";
  const { rows } = await pool.query(
    `SELECT pl.*, t.nom AS type_infraction, p.nom AS province
     FROM plaintes pl
     LEFT JOIN types_infraction t ON t.id = pl.type_infraction_id
     LEFT JOIN provinces p ON p.id = pl.province_id
     ${where} ORDER BY pl.created_at DESC LIMIT 200`,
    filtre ? [filtre] : []
  );
  return rows;
}

export async function detailPlainte(id: number) {
  const [{ rows: [plainte] }, { rows: preuves }, { rows: [dossier] }] = await Promise.all([
    pool.query(
      `SELECT pl.*, t.nom AS type_infraction, p.nom AS province
       FROM plaintes pl
       LEFT JOIN types_infraction t ON t.id = pl.type_infraction_id
       LEFT JOIN provinces p ON p.id = pl.province_id
       WHERE pl.id = $1`, [id]),
    pool.query("SELECT * FROM preuves WHERE plainte_id=$1 ORDER BY id", [id]),
    pool.query("SELECT * FROM dossiers WHERE plainte_id=$1", [id]),
  ]);
  if (!plainte) return null;
  const [{ rows: convocations }, { rows: mediations }, { rows: sanctions }] = dossier
    ? await Promise.all([
        pool.query("SELECT * FROM convocations WHERE dossier_id=$1 ORDER BY created_at DESC", [dossier.id]),
        pool.query("SELECT * FROM mediations WHERE dossier_id=$1 ORDER BY created_at DESC", [dossier.id]),
        pool.query("SELECT * FROM sanctions WHERE dossier_id=$1 ORDER BY created_at DESC", [dossier.id]),
      ])
    : [{ rows: [] }, { rows: [] }, { rows: [] }];
  return { plainte, preuves, dossier, convocations, mediations, sanctions };
}

export async function suiviParNumero(numero: string) {
  const n = numero.trim().toUpperCase().replace("DOS-", "RSP-");
  const { rows: [plainte] } = await pool.query(
    `SELECT pl.*, t.nom AS type_infraction, p.nom AS province
     FROM plaintes pl
     LEFT JOIN types_infraction t ON t.id = pl.type_infraction_id
     LEFT JOIN provinces p ON p.id = pl.province_id
     WHERE UPPER(pl.numero) = $1`, [n]);
  if (!plainte) return null;
  const { rows: [dossier] } = await pool.query("SELECT * FROM dossiers WHERE plainte_id=$1", [plainte.id]);
  const [{ rows: convocations }, { rows: mediations }, { rows: sanctions }] = dossier
    ? await Promise.all([
        pool.query("SELECT * FROM convocations WHERE dossier_id=$1 ORDER BY created_at DESC", [dossier.id]),
        pool.query("SELECT * FROM mediations WHERE dossier_id=$1 ORDER BY created_at DESC", [dossier.id]),
        pool.query("SELECT * FROM sanctions WHERE dossier_id=$1 ORDER BY created_at DESC", [dossier.id]),
      ])
    : [{ rows: [] }, { rows: [] }, { rows: [] }];
  return { plainte, dossier, convocations, mediations, sanctions };
}

export async function amendesImpayees(numero: string) {
  const n = numero.trim().toUpperCase().replace("RSP-", "DOS-");
  const { rows } = await pool.query(
    `SELECT s.*, d.numero AS dossier_numero, pl.victime_nom, pl.accuse_nom
     FROM sanctions s
     JOIN dossiers d ON d.id = s.dossier_id
     JOIN plaintes pl ON pl.id = d.plainte_id
     WHERE UPPER(d.numero) = $1 AND s.type IN ('amende','dommages_interets')
     ORDER BY s.created_at DESC`, [n]);
  return rows;
}

export async function referentiels() {
  const [provinces, types] = await Promise.all([
    pool.query("SELECT id, nom FROM provinces ORDER BY nom"),
    pool.query("SELECT id, nom FROM types_infraction ORDER BY id"),
  ]);
  return { provinces: provinces.rows, types: types.rows };
}
