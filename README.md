# RESPECT RDC 360 AI

**Projet National — Plateforme Nationale Intelligente de Prévention, Signalement et Sanction des Infractions Verbales**
République Démocratique du Congo · *« Le respect commence par nos paroles. »*

## Vision

Construire une société congolaise où le respect, la dignité humaine et la paix sociale deviennent des
valeurs fondamentales grâce à une plateforme numérique utilisant l'intelligence artificielle pour
prévenir, détecter, documenter et traiter les infractions verbales conformément à la loi — dans le
respect de la Constitution, des droits fondamentaux et de la liberté d'expression.

## Modules

- **Dépôt de plainte en ligne** — preuves multi-canaux : audio, vidéo, photo, capture d'écran, SMS, WhatsApp, Facebook, X, TikTok, Instagram, email
- **Intelligence Artificielle** — détection des insultes, menaces, discours haineux, appels à la violence, propos discriminatoires + rapport préliminaire (sans remplacer la décision humaine)
- **Score de gravité** — faible / moyen / élevé / très élevé (répétition, victime mineure, menace de mort, diffusion publique...)
- **Connexion API Police Nationale Congolaise** — notification automatique et convocation officielle de l'accusé, suivi du dossier
- **Processus de traitement** — plainte reçue → analyse IA → médiation → enquête → audience → décision → clôture
- **Médiation avant sanction** — convocation, excuses, réparation, conciliation ; transmission au parquet si échec
- **Paiement des amendes** — M-Pesa, Orange Money, Airtel Money, Vodacom M-Pesa, TigoCash, MTN MoMo, EcoCash, Hello Cash, Visa, Mastercard, PayPal, banque, Trésor Public — reçu numérique automatique
- **Tableau de bord national** — statistiques temps réel par province, sexe, âge, type d'infraction
- **Sensibilisation & Formation** — respect, droits humains, tolérance, citoyenneté, communication non violente, lutte contre la haine
- **Sécurité** — chiffrement, journalisation des accès, protection des données personnelles

## Principe fondamental

Aucune personne n'est automatiquement condamnée ou taxée par une intelligence artificielle.
La décision finale sur la culpabilité et toute sanction appartient toujours à l'autorité humaine
compétente, avec possibilité pour la personne mise en cause de se défendre.

## Stack technique

- **Next.js 16** (App Router, Server Actions) + **Tailwind CSS v4**
- **PostgreSQL** (Neon Cloud) — 13 tables
- Déploiement **Vercel**

## Démarrage

```bash
npm install
node scripts/setup-db.js   # crée le schéma + données initiales (lit .env)
npm run dev
```

Créer `.env` avec :

```
DATABASE_URL="postgresql://..."
```

Compte de démonstration : `admin@respect-rdc.cd` / `respect2026`

---
Laboratoire DevaryxKernel Software — Rio de Janeiro / Brésil
