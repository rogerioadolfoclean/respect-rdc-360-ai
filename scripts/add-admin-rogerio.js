// Ajoute le compte admin personnel du propriétaire (rogerioadolfoclean@gmail.com)
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const envFile = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
const url = envFile.match(/DATABASE_URL="([^"]+)"/)[1];

const EMAIL = "rogerioadolfoclean@gmail.com";
const PASSWORD = process.env.ADMIN_ROGERIO_PASSWORD;
if (!PASSWORD) { console.error("ADMIN_ROGERIO_PASSWORD manquant"); process.exit(1); }

(async () => {
  const pool = new Pool({ connectionString: url });
  const enc = Buffer.from(PASSWORD).toString("base64");
  await pool.query(
    `INSERT INTO utilisateurs (nom,email,mot_de_passe,role,actif)
     VALUES ($1,$2,$3,'admin',TRUE)
     ON CONFLICT (email) DO UPDATE SET mot_de_passe=$3, role='admin', actif=TRUE`,
    ["Rogerio Adolfo", EMAIL, enc]
  );
  const { rows } = await pool.query("SELECT id,nom,email,role,actif FROM utilisateurs WHERE email=$1", [EMAIL]);
  console.log("Compte admin OK :", rows[0]);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
