// Création du schéma + données initiales — RESPECT RDC 360 AI
// Usage : node scripts/setup-db.js (lit DATABASE_URL depuis .env)
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const env = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS provinces (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS types_infraction (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(80) UNIQUE NOT NULL,
  categorie VARCHAR(40) NOT NULL DEFAULT 'verbale'
);

CREATE TABLE IF NOT EXISTS utilisateurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(200) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'agent' CHECK (role IN ('admin','agent','mediateur','magistrat')),
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plaintes (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(30) UNIQUE NOT NULL,
  victime_nom VARCHAR(120) NOT NULL,
  victime_telephone VARCHAR(30),
  victime_email VARCHAR(120),
  victime_adresse TEXT,
  victime_sexe VARCHAR(1) CHECK (victime_sexe IN ('M','F')),
  victime_age INT,
  victime_mineure BOOLEAN DEFAULT FALSE,
  accuse_nom VARCHAR(120),
  accuse_telephone VARCHAR(30),
  accuse_adresse TEXT,
  type_infraction_id INT REFERENCES types_infraction(id),
  description_faits TEXT NOT NULL,
  canal VARCHAR(30) DEFAULT 'en_ligne',
  province_id INT REFERENCES provinces(id),
  ville VARCHAR(80),
  commune VARCHAR(80),
  diffusion_publique BOOLEAN DEFAULT FALSE,
  menace_de_mort BOOLEAN DEFAULT FALSE,
  repetition BOOLEAN DEFAULT FALSE,
  statut VARCHAR(30) DEFAULT 'recue' CHECK (statut IN ('recue','en_traitement','cloturee','rejetee')),
  score_gravite VARCHAR(15) CHECK (score_gravite IN ('faible','moyen','eleve','tres_eleve')),
  score_points INT DEFAULT 0,
  rapport_ia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preuves (
  id SERIAL PRIMARY KEY,
  plainte_id INT NOT NULL REFERENCES plaintes(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  description TEXT,
  nom_fichier VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dossiers (
  id SERIAL PRIMARY KEY,
  plainte_id INT NOT NULL REFERENCES plaintes(id) ON DELETE CASCADE,
  numero VARCHAR(30) UNIQUE NOT NULL,
  statut VARCHAR(30) DEFAULT 'plainte_recue' CHECK (statut IN ('plainte_recue','analyse_ia','mediation','enquete','audience','decision','cloture')),
  transmis_parquet BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS convocations (
  id SERIAL PRIMARY KEY,
  dossier_id INT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  date_convocation TIMESTAMPTZ NOT NULL,
  lieu VARCHAR(160) DEFAULT 'Commissariat Central',
  statut VARCHAR(20) DEFAULT 'envoyee' CHECK (statut IN ('envoyee','notifie','conteste','present','absent')),
  reponse_accuse TEXT,
  api_police_ref VARCHAR(40),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mediations (
  id SERIAL PRIMARY KEY,
  dossier_id INT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  mediateur VARCHAR(120),
  date_mediation TIMESTAMPTZ,
  resultat VARCHAR(20) DEFAULT 'en_cours' CHECK (resultat IN ('en_cours','reussie','echouee')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sanctions (
  id SERIAL PRIMARY KEY,
  dossier_id INT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL CHECK (type IN ('avertissement','excuses_publiques','travaux_interet_general','amende','dommages_interets','formation_citoyennete')),
  montant_fc NUMERIC(14,2) DEFAULT 0,
  statut VARCHAR(20) DEFAULT 'prononcee' CHECK (statut IN ('prononcee','executee','payee')),
  decidee_par VARCHAR(120) DEFAULT 'Tribunal de Paix',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paiements (
  id SERIAL PRIMARY KEY,
  sanction_id INT NOT NULL REFERENCES sanctions(id) ON DELETE CASCADE,
  methode VARCHAR(30) NOT NULL,
  montant_fc NUMERIC(14,2) NOT NULL,
  reference VARCHAR(60),
  numero_recu VARCHAR(40) UNIQUE,
  statut VARCHAR(20) DEFAULT 'confirme' CHECK (statut IN ('en_attente','confirme','echoue')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formations (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(160) NOT NULL,
  theme VARCHAR(60),
  description TEXT,
  duree VARCHAR(40),
  inscrits INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inscriptions_formation (
  id SERIAL PRIMARY KEY,
  formation_id INT NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  nom VARCHAR(120) NOT NULL,
  telephone VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_acces (
  id SERIAL PRIMARY KEY,
  utilisateur VARCHAR(120),
  action VARCHAR(80) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const PROVINCES = [
  "Kinshasa","Kongo-Central","Kwango","Kwilu","Mai-Ndombe","Équateur","Mongala","Nord-Ubangi","Sud-Ubangi","Tshuapa",
  "Tshopo","Bas-Uele","Haut-Uele","Ituri","Nord-Kivu","Sud-Kivu","Maniema","Lomami","Kasaï","Kasaï-Central",
  "Kasaï-Oriental","Sankuru","Haut-Lomami","Lualaba","Haut-Katanga","Tanganyika"
];

const TYPES = [
  "Injures publiques","Injures privées","Diffamation","Calomnie","Menaces verbales","Discours de haine",
  "Incitation à la violence","Harcèlement moral","Harcèlement numérique","Cyberharcèlement","Racisme","Tribalisme",
  "Xénophobie","Sexisme","Discrimination religieuse","Diffusion de fausses accusations","Humiliation publique",
  "Atteinte à l'honneur","Atteinte à la réputation","Insultes envers les personnes vulnérables"
];

const FORMATIONS = [
  ["Respect des personnes","Respect","Formation gratuite sur le respect de la dignité humaine dans la vie quotidienne et en ligne.","4 heures",312],
  ["Droits humains","Droits humains","Comprendre les droits fondamentaux garantis par la Constitution de la RDC.","6 heures",254],
  ["Tolérance et vivre-ensemble","Tolérance","Apprendre à vivre ensemble malgré les différences ethniques, religieuses et politiques.","4 heures",198],
  ["Citoyenneté responsable","Citoyenneté","Devoirs et responsabilités du citoyen congolais envers la communauté.","5 heures",176],
  ["Communication non violente","Communication","Techniques pratiques pour résoudre les conflits par le dialogue.","8 heures",287],
  ["Lutte contre la haine","Anti-haine","Identifier et combattre les discours de haine, le tribalisme et la discrimination.","6 heures",231]
];

const NOMS_V = ["Mukendi Kalala","Ngalula Tshiala","Ilunga Mwamba","Kabongo Mutombo","Mbuyi Kanku","Tshibangu Mulumba","Kasongo Nyembo","Mwanza Kabeya","Odia Kalonji","Mutombo Dikembe","Nzuzi Makiese","Luyindula Mbemba","Bahati Amani","Furaha Zawadi","Amisi Ramazani","Safi Neema","Bolingo Ekofo","Lokwa Bompenda","Mokili Ngambe","Esengo Mputu"];
const NOMS_A = ["Kalombo Mwepu","Tshimanga Kazadi","Beya Muteba","Kanyinda Mbayo","Cibangu Ntumba","Mulaja Kabasele","Kimbembe Nsimba","Matondo Phanzu","Asani Musafiri","Sifa Mapenzi","Bisimwa Cirhuza","Ekanga Bosukla","Monga Kyungu","Banza Ilunga","Numbi Kalenga","Yav Mwant","Mbala Nsaka","Kiese Lutete","Panzu Nlandu","Mavungu Nzuzi"];
const VILLES = { 1:["Kinshasa"],15:["Goma","Butembo","Beni"],16:["Bukavu","Uvira"],25:["Lubumbashi","Likasi"],2:["Matadi","Boma"],21:["Mbuji-Mayi"],20:["Kananga"],11:["Kisangani"],4:["Kikwit","Bandundu"],14:["Bunia"] };
const DESCRIPTIONS = [
  "M'a insulté publiquement au marché devant plusieurs témoins en criant des injures graves.",
  "A diffusé de fausses accusations contre moi sur WhatsApp affirmant que je suis un voleur.",
  "M'a menacé de mort à plusieurs reprises par SMS et appels téléphoniques.",
  "A publié sur Facebook des propos diffamatoires détruisant ma réputation professionnelle.",
  "Me harcèle quotidiennement avec des messages insultants sur mon numéro depuis des semaines.",
  "A tenu des propos tribalistes et haineux contre ma communauté lors d'une réunion publique.",
  "A humilié publiquement ma fille mineure devant toute l'école avec des insultes.",
  "M'a calomnié auprès de mon employeur en m'accusant faussement de détournement.",
  "Publie régulièrement des vidéos TikTok m'insultant et incitant les gens à la violence contre moi.",
  "A tenu des propos sexistes et discriminatoires à mon égard sur mon lieu de travail.",
];
const CANAUX = ["en_ligne","whatsapp","sms","facebook","x","tiktok","instagram","email"];
const METHODES = ["m_pesa","orange_money","airtel_money","vodacom_mpesa","tigocash","mtn_momo","ecocash","hello_cash","visa","mastercard","paypal","tresor_public","banque","bicec"];

function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
function ri(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

async function main() {
  const pool = new Pool({ connectionString: url, max: 3 });
  await pool.query(SCHEMA);
  console.log("Schéma créé.");

  const { rows: [{ count }] } = await pool.query("SELECT COUNT(*)::int AS count FROM provinces");
  if (count > 0) { console.log("Données déjà présentes — seed ignoré."); await pool.end(); return; }

  for (const p of PROVINCES) await pool.query("INSERT INTO provinces (nom) VALUES ($1)", [p]);
  for (const t of TYPES) await pool.query("INSERT INTO types_infraction (nom) VALUES ($1)", [t]);
  for (const f of FORMATIONS) await pool.query("INSERT INTO formations (titre,theme,description,duree,inscrits) VALUES ($1,$2,$3,$4,$5)", f);

  await pool.query("INSERT INTO utilisateurs (nom,email,mot_de_passe,role) VALUES ($1,$2,$3,$4)",
    ["Administrateur National", "admin@respect-rdc.cd", Buffer.from("respect2026").toString("base64"), "admin"]);
  await pool.query("INSERT INTO utilisateurs (nom,email,mot_de_passe,role) VALUES ($1,$2,$3,$4)",
    ["Agent PNC Kinshasa", "agent@respect-rdc.cd", Buffer.from("agent2026").toString("base64"), "agent"]);
  await pool.query("INSERT INTO utilisateurs (nom,email,mot_de_passe,role) VALUES ($1,$2,$3,$4)",
    ["Médiateur National", "mediateur@respect-rdc.cd", Buffer.from("mediation2026").toString("base64"), "mediateur"]);
  console.log("Provinces, types, formations, utilisateurs insérés.");

  // Plaintes de démonstration réparties sur 12 mois
  const provincesPonderees = [1,1,1,1,1,15,15,15,16,16,25,25,25,2,2,21,21,20,11,11,4,14,ri(1,26),ri(1,26),ri(1,26)];
  let seq = 0;
  for (let i = 0; i < 140; i++) {
    seq++;
    const created = new Date(Date.now() - ri(0, 365) * 86400000 - ri(0, 86400000));
    const annee = created.getFullYear();
    const numero = `RSP-${annee}-${String(seq).padStart(6, "0")}`;
    const provId = rnd(provincesPonderees);
    const typeId = ri(1, 20);
    const sexe = Math.random() < 0.62 ? "M" : "F";
    const age = ri(14, 65);
    const mineure = age < 18;
    const diffusion = Math.random() < 0.4;
    const menaceMort = typeId === 5 && Math.random() < 0.5;
    const repetition = Math.random() < 0.35;
    let pts = 2 + (mineure ? 3 : 0) + (diffusion ? 2 : 0) + (menaceMort ? 4 : 0) + (repetition ? 2 : 0) + ri(0, 3);
    const gravite = pts >= 9 ? "tres_eleve" : pts >= 6 ? "eleve" : pts >= 3 ? "moyen" : "faible";
    const statut = Math.random() < 0.55 ? "cloturee" : Math.random() < 0.7 ? "en_traitement" : "recue";
    const ville = (VILLES[provId] || ["Chef-lieu"])[0];

    const { rows: [pl] } = await pool.query(
      `INSERT INTO plaintes (numero,victime_nom,victime_telephone,victime_sexe,victime_age,victime_mineure,accuse_nom,accuse_telephone,
       type_infraction_id,description_faits,canal,province_id,ville,commune,diffusion_publique,menace_de_mort,repetition,
       statut,score_gravite,score_points,rapport_ia,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING id`,
      [numero, rnd(NOMS_V), `+24389${ri(1000000, 9999999)}`, sexe, age, mineure, rnd(NOMS_A), `+24381${ri(1000000, 9999999)}`,
       typeId, rnd(DESCRIPTIONS), rnd(CANAUX), provId, ville, "Commune " + ri(1, 24), diffusion, menaceMort, repetition,
       statut, gravite, pts,
       `RAPPORT PRÉLIMINAIRE IA — Dossier ${numero}\nScore de gravité : ${gravite.toUpperCase()} (${pts} points).\nÉléments détectés par l'analyse automatique des preuves. Ce rapport est destiné aux autorités compétentes et ne remplace pas la décision humaine.`,
       created]
    );

    // Preuves
    const nPreuves = ri(1, 3);
    for (let j = 0; j < nPreuves; j++) {
      const tp = rnd(["audio","video","photo","capture","sms","whatsapp","facebook","email"]);
      await pool.query("INSERT INTO preuves (plainte_id,type,description,nom_fichier,created_at) VALUES ($1,$2,$3,$4,$5)",
        [pl.id, tp, `Preuve ${tp} jointe à la plainte`, `preuve_${pl.id}_${j + 1}.${tp === "audio" ? "mp3" : tp === "video" ? "mp4" : "jpg"}`, created]);
    }

    // Dossier
    const etapes = ["plainte_recue","analyse_ia","mediation","enquete","audience","decision","cloture"];
    const etape = statut === "cloturee" ? "cloture" : statut === "recue" ? rnd(["plainte_recue","analyse_ia"]) : rnd(["mediation","enquete","audience","decision"]);
    const { rows: [ds] } = await pool.query(
      "INSERT INTO dossiers (plainte_id,numero,statut,transmis_parquet,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$5) RETURNING id",
      [pl.id, numero.replace("RSP", "DOS"), etape, etapes.indexOf(etape) >= 3, created]
    );

    // Convocation
    if (etapes.indexOf(etape) >= 2) {
      await pool.query(
        "INSERT INTO convocations (dossier_id,date_convocation,lieu,statut,api_police_ref,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
        [ds.id, new Date(created.getTime() + 7 * 86400000), "Commissariat Central — " + ville,
         rnd(["notifie","present","conteste","envoyee"]), `PNC-API-${ri(100000, 999999)}`, created]
      );
    }

    // Médiation
    if (["mediation","enquete","audience","decision","cloture"].includes(etape)) {
      const res = etape === "mediation" ? "en_cours" : Math.random() < 0.55 ? "reussie" : "echouee";
      await pool.query(
        "INSERT INTO mediations (dossier_id,mediateur,date_mediation,resultat,notes,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
        [ds.id, "Médiateur " + rnd(NOMS_V).split(" ")[0], new Date(created.getTime() + 10 * 86400000), res,
         res === "reussie" ? "Excuses présentées et acceptées. Réparation convenue." : res === "echouee" ? "Aucun accord trouvé. Transmission au parquet." : "Séance de conciliation en cours.", created]
      );

      // Sanction si médiation échouée et dossier avancé
      if (res === "echouee" && ["decision","cloture"].includes(etape)) {
        const st = rnd(["amende","amende","amende","avertissement","excuses_publiques","travaux_interet_general","dommages_interets","formation_citoyennete"]);
        const montant = ["amende","dommages_interets"].includes(st) ? ri(5, 100) * 10000 : 0;
        const sanStatut = etape === "cloture" ? (montant > 0 ? "payee" : "executee") : "prononcee";
        const { rows: [sa] } = await pool.query(
          "INSERT INTO sanctions (dossier_id,type,montant_fc,statut,decidee_par,created_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
          [ds.id, st, montant, sanStatut, rnd(["Tribunal de Paix","Tribunal de Grande Instance","Parquet"]), new Date(created.getTime() + 30 * 86400000)]
        );
        if (sanStatut === "payee" && montant > 0) {
          await pool.query(
            "INSERT INTO paiements (sanction_id,methode,montant_fc,reference,numero_recu,statut,created_at) VALUES ($1,$2,$3,$4,$5,'confirme',$6)",
            [sa.id, rnd(METHODES), montant, `PAY-${ri(10000000, 99999999)}`, `RECU-${annee}-${String(seq).padStart(6, "0")}`, new Date(created.getTime() + 35 * 86400000)]
          );
        }
      }
    }
  }
  console.log("140 plaintes de démonstration insérées avec dossiers, convocations, médiations, sanctions et paiements.");
  await pool.end();
  console.log("Base de données prête ✅");
}

main().catch((e) => { console.error(e); process.exit(1); });
