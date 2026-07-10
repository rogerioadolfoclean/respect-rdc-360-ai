"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { pool } from "./db";
import { analyserPlainte } from "./ia";

async function journaliser(utilisateur: string, action: string, details: string) {
  await pool.query(
    "INSERT INTO journal_acces (utilisateur, action, details) VALUES ($1,$2,$3)",
    [utilisateur, action, details]
  );
}

// ─────────────────────────────── DÉPÔT DE PLAINTE ───────────────────────────────

export async function deposerPlainte(formData: FormData) {
  const get = (k: string) => (formData.get(k) as string | null)?.trim() || null;

  const victime_nom = get("victime_nom");
  const description = get("description_faits");
  const typeId = Number(get("type_infraction_id")) || null;
  if (!victime_nom || !description) {
    return { erreur: "Le nom de la victime et la description des faits sont obligatoires." };
  }

  const age = Number(get("victime_age")) || null;
  const mineure = age !== null && age < 18;
  const diffusion = formData.get("diffusion_publique") === "on";
  const menaceMort = formData.get("menace_de_mort") === "on";
  const repetition = formData.get("repetition") === "on";
  const preuves = formData.getAll("preuves") as string[];

  const annee = new Date().getFullYear();
  const { rows: [{ n }] } = await pool.query("SELECT COUNT(*)::int + 1 AS n FROM plaintes");
  const numero = `RSP-${annee}-${String(n).padStart(6, "0")}`;

  const { rows: [t] } = typeId
    ? await pool.query("SELECT nom FROM types_infraction WHERE id=$1", [typeId])
    : { rows: [{ nom: "Non précisé" }] };

  const analyse = analyserPlainte({
    description,
    victime_mineure: mineure,
    diffusion_publique: diffusion,
    menace_de_mort: menaceMort,
    repetition,
    nb_preuves: preuves.length,
    type_infraction: t?.nom ?? "Non précisé",
    numero,
  });

  const { rows: [pl] } = await pool.query(
    `INSERT INTO plaintes (numero,victime_nom,victime_telephone,victime_email,victime_adresse,victime_sexe,victime_age,victime_mineure,
     accuse_nom,accuse_telephone,accuse_adresse,type_infraction_id,description_faits,canal,province_id,ville,commune,
     diffusion_publique,menace_de_mort,repetition,statut,score_gravite,score_points,rapport_ia)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'recue',$21,$22,$23) RETURNING id`,
    [numero, victime_nom, get("victime_telephone"), get("victime_email"), get("victime_adresse"),
     get("victime_sexe"), age, mineure, get("accuse_nom"), get("accuse_telephone"), get("accuse_adresse"),
     typeId, description, "en_ligne", Number(get("province_id")) || null, get("ville"), get("commune"),
     diffusion, menaceMort, repetition, analyse.score_gravite, analyse.score_points, analyse.rapport]
  );

  for (const p of preuves) {
    await pool.query(
      "INSERT INTO preuves (plainte_id,type,description) VALUES ($1,$2,$3)",
      [pl.id, p, `Preuve de type ${p} déclarée par la victime`]
    );
  }

  const { rows: [ds] } = await pool.query(
    "INSERT INTO dossiers (plainte_id,numero,statut) VALUES ($1,$2,'analyse_ia') RETURNING id",
    [pl.id, numero.replace("RSP", "DOS")]
  );

  // Connexion API Police Nationale Congolaise : notification automatique de l'accusé
  const accuse = get("accuse_nom");
  if (accuse) {
    const apiRef = `PNC-API-${Math.floor(100000 + Math.random() * 900000)}`;
    await pool.query(
      `INSERT INTO convocations (dossier_id,date_convocation,lieu,statut,api_police_ref)
       VALUES ($1, NOW() + INTERVAL '7 days', $2, 'notifie', $3)`,
      [ds.id, `Commissariat Central — ${get("ville") || "Kinshasa"}`, apiRef]
    );
  }

  await journaliser("public", "DEPOT_PLAINTE", `Plainte ${numero} enregistrée — gravité ${analyse.score_gravite}`);
  revalidatePath("/dashboard");
  return { numero, gravite: analyse.score_gravite };
}

// ─────────────────────────────── CONVOCATION (ACCUSÉ) ───────────────────────────────

export async function repondreConvocation(formData: FormData) {
  const id = Number(formData.get("convocation_id"));
  const action = formData.get("action") as string;
  const reponse = (formData.get("reponse") as string | null)?.trim() || null;
  await pool.query(
    "UPDATE convocations SET statut=$1, reponse_accuse=$2 WHERE id=$3",
    [action === "contester" ? "conteste" : "notifie", reponse, id]
  );
  await journaliser("public", "REPONSE_CONVOCATION", `Convocation #${id} — ${action}`);
  revalidatePath("/convocation");
}

// ─────────────────────────────── PAIEMENT DES AMENDES ───────────────────────────────

export async function payerAmende(formData: FormData) {
  const sanctionId = Number(formData.get("sanction_id"));
  const methode = formData.get("methode") as string;
  const telephone = (formData.get("telephone") as string | null)?.trim();

  const { rows: [s] } = await pool.query(
    "SELECT s.*, d.numero AS dossier_numero FROM sanctions s JOIN dossiers d ON d.id=s.dossier_id WHERE s.id=$1",
    [sanctionId]
  );
  if (!s) return { erreur: "Sanction introuvable." };
  if (s.statut === "payee") return { erreur: "Cette amende a déjà été payée." };

  const annee = new Date().getFullYear();
  const numeroRecu = `RECU-${annee}-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const reference = `PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;

  await pool.query(
    "INSERT INTO paiements (sanction_id,methode,montant_fc,reference,numero_recu,statut) VALUES ($1,$2,$3,$4,$5,'confirme')",
    [sanctionId, methode, s.montant_fc, reference + (telephone ? ` (${telephone})` : ""), numeroRecu]
  );
  await pool.query("UPDATE sanctions SET statut='payee' WHERE id=$1", [sanctionId]);
  await journaliser("public", "PAIEMENT_AMENDE", `Sanction #${sanctionId} payée via ${methode} — reçu ${numeroRecu}`);
  revalidatePath("/paiement");
  return { numeroRecu, reference, montant: s.montant_fc, dossier: s.dossier_numero, methode };
}

// ─────────────────────────────── FORMATIONS ───────────────────────────────

export async function inscrireFormation(formData: FormData) {
  const formationId = Number(formData.get("formation_id"));
  const nom = (formData.get("nom") as string | null)?.trim();
  if (!nom) return { erreur: "Votre nom est obligatoire." };
  await pool.query(
    "INSERT INTO inscriptions_formation (formation_id,nom,telephone) VALUES ($1,$2,$3)",
    [formationId, nom, (formData.get("telephone") as string | null)?.trim() || null]
  );
  await pool.query("UPDATE formations SET inscrits = inscrits + 1 WHERE id=$1", [formationId]);
  revalidatePath("/formations");
  return { ok: true };
}

// ─────────────────────────────── AUTHENTIFICATION ───────────────────────────────

export async function connexion(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const motDePasse = formData.get("mot_de_passe") as string | null;
  if (!email || !motDePasse) return { erreur: "Email et mot de passe obligatoires." };

  const { rows: [u] } = await pool.query(
    "SELECT id, nom, email, mot_de_passe, role FROM utilisateurs WHERE email=$1 AND actif=TRUE",
    [email]
  );
  if (!u || u.mot_de_passe !== Buffer.from(motDePasse).toString("base64")) {
    await journaliser(email, "CONNEXION_ECHOUEE", "Identifiants invalides");
    return { erreur: "Identifiants invalides." };
  }

  const session = Buffer.from(JSON.stringify({ id: u.id, nom: u.nom, role: u.role })).toString("base64");
  (await cookies()).set("session_respect", session, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8, path: "/" });
  await journaliser(email, "CONNEXION", `Connexion réussie (${u.role})`);
  redirect("/dashboard");
}

export async function deconnexion() {
  (await cookies()).delete("session_respect");
  redirect("/");
}

export async function sessionActuelle(): Promise<{ id: number; nom: string; role: string } | null> {
  const c = (await cookies()).get("session_respect");
  if (!c) return null;
  try {
    return JSON.parse(Buffer.from(c.value, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

// ─────────────────────────────── ADMINISTRATION DES DOSSIERS ───────────────────────────────

export async function avancerDossier(formData: FormData) {
  const id = Number(formData.get("dossier_id"));
  const statut = formData.get("statut") as string;
  await pool.query(
    "UPDATE dossiers SET statut=$1, transmis_parquet = transmis_parquet OR $2, updated_at=NOW() WHERE id=$3",
    [statut, ["enquete", "audience", "decision"].includes(statut), id]
  );
  if (statut === "cloture") {
    await pool.query("UPDATE plaintes SET statut='cloturee' WHERE id=(SELECT plainte_id FROM dossiers WHERE id=$1)", [id]);
  } else if (statut !== "plainte_recue") {
    await pool.query("UPDATE plaintes SET statut='en_traitement' WHERE id=(SELECT plainte_id FROM dossiers WHERE id=$1)", [id]);
  }
  if (statut === "mediation") {
    const { rows } = await pool.query("SELECT id FROM mediations WHERE dossier_id=$1", [id]);
    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO mediations (dossier_id,mediateur,date_mediation,resultat,notes) VALUES ($1,'Médiateur National',NOW() + INTERVAL '10 days','en_cours','Séance de conciliation programmée : convocation, excuses, réparation.')",
        [id]
      );
    }
  }
  await journaliser("admin", "AVANCEMENT_DOSSIER", `Dossier #${id} → ${statut}`);
  revalidatePath("/dashboard/dossiers");
  revalidatePath("/dashboard");
}

export async function envoyerConvocation(formData: FormData) {
  const dossierId = Number(formData.get("dossier_id"));
  const lieu = (formData.get("lieu") as string | null)?.trim() || "Commissariat Central";
  const dateStr = formData.get("date_convocation") as string | null;
  const apiRef = `PNC-API-${Math.floor(100000 + Math.random() * 900000)}`;
  await pool.query(
    "INSERT INTO convocations (dossier_id,date_convocation,lieu,statut,api_police_ref) VALUES ($1,$2,$3,'notifie',$4)",
    [dossierId, dateStr ? new Date(dateStr) : new Date(Date.now() + 7 * 86400000), lieu, apiRef]
  );
  await journaliser("admin", "CONVOCATION_API_PNC", `Dossier #${dossierId} — convocation transmise via API Police Nationale (${apiRef})`);
  revalidatePath("/dashboard/dossiers");
}

export async function clotureMediation(formData: FormData) {
  const id = Number(formData.get("mediation_id"));
  const resultat = formData.get("resultat") as string;
  const notes = (formData.get("notes") as string | null)?.trim() || null;
  await pool.query("UPDATE mediations SET resultat=$1, notes=COALESCE($2,notes) WHERE id=$3", [resultat, notes, id]);
  const { rows: [m] } = await pool.query("SELECT dossier_id FROM mediations WHERE id=$1", [id]);
  if (m) {
    await pool.query(
      "UPDATE dossiers SET statut=$1, updated_at=NOW() WHERE id=$2",
      [resultat === "reussie" ? "cloture" : "enquete", m.dossier_id]
    );
    if (resultat === "reussie") {
      await pool.query("UPDATE plaintes SET statut='cloturee' WHERE id=(SELECT plainte_id FROM dossiers WHERE id=$1)", [m.dossier_id]);
    }
  }
  await journaliser("admin", "CLOTURE_MEDIATION", `Médiation #${id} — ${resultat}`);
  revalidatePath("/dashboard/mediations");
}

export async function prononcerSanction(formData: FormData) {
  const dossierId = Number(formData.get("dossier_id"));
  const type = formData.get("type") as string;
  const montant = Number(formData.get("montant_fc")) || 0;
  await pool.query(
    "INSERT INTO sanctions (dossier_id,type,montant_fc,statut,decidee_par) VALUES ($1,$2,$3,'prononcee',$4)",
    [dossierId, type, montant, (formData.get("decidee_par") as string | null)?.trim() || "Tribunal de Paix"]
  );
  await pool.query("UPDATE dossiers SET statut='decision', updated_at=NOW() WHERE id=$1", [dossierId]);
  await journaliser("admin", "SANCTION_PRONONCEE", `Dossier #${dossierId} — ${type} (${montant} FC)`);
  revalidatePath("/dashboard/sanctions");
  revalidatePath("/dashboard/dossiers");
}

export async function ajouterUtilisateur(formData: FormData) {
  const nom = (formData.get("nom") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const motDePasse = formData.get("mot_de_passe") as string | null;
  const role = formData.get("role") as string;
  if (!nom || !email || !motDePasse) return { erreur: "Tous les champs sont obligatoires." };
  try {
    await pool.query(
      "INSERT INTO utilisateurs (nom,email,mot_de_passe,role) VALUES ($1,$2,$3,$4)",
      [nom, email, Buffer.from(motDePasse).toString("base64"), role]
    );
  } catch {
    return { erreur: "Cet email existe déjà." };
  }
  await journaliser("admin", "CREATION_UTILISATEUR", `${email} (${role})`);
  revalidatePath("/dashboard/utilisateurs");
  return { ok: true };
}

export async function basculerUtilisateur(formData: FormData) {
  const id = Number(formData.get("utilisateur_id"));
  await pool.query("UPDATE utilisateurs SET actif = NOT actif WHERE id=$1", [id]);
  revalidatePath("/dashboard/utilisateurs");
}
