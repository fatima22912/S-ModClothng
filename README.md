# S'Mod Clothing — Plateforme e-commerce

Boutique en ligne de vêtements pour femmes (propriétaire : **Ngoné Seck**). Front-end React, back-end API PHP, base de données MySQL. Paiement par **Wave** (lien marchand) et **Orange Money** (QR code marchand), avec confirmation manuelle du paiement par la propriétaire.

## Sommaire

- [Stack](#stack)
- [Structure du projet](#structure-du-projet)
- [Installer PHP et MySQL en local (Windows)](#installer-php-et-mysql-en-local-windows)
- [Installation du projet](#installation-du-projet)
- [Créer le premier compte administrateur](#créer-le-premier-compte-administrateur)
- [Fonctionnement des paiements](#fonctionnement-des-paiements)
- [Assets à remplacer](#assets-à-remplacer-logo-et-qr-code)
- [Déploiement](#déploiement)

## Stack

- **Front-end** : React 18 + Vite, React Router, Tailwind CSS.
- **Back-end** : PHP 8+ natif (pas de framework), routeur maison, API REST en JSON.
- **Base de données** : MySQL / MariaDB, accès via PDO (requêtes préparées uniquement).
- **Authentification** : JWT (implémentation HS256 maison, sans dépendance externe) pour propriétaire et administrateur. Aucun compte requis côté visiteur.

## Structure du projet

```
smod-clothing/
├── frontend/            Application React (Vite)
├── backend/              API PHP
│   ├── config/            Connexion DB, chargement .env
│   ├── src/
│   │   ├── Controllers/    Logique des routes
│   │   ├── Models/          Accès aux données (PDO)
│   │   ├── Middleware/      Vérification JWT / rôle
│   │   ├── Services/         WaveService, OrangeMoneyService
│   │   └── Helpers/           Router, JWT, Response, Validator
│   ├── routes/api.php       Déclaration des routes
│   └── public/index.php     Point d'entrée (front controller)
├── database/
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

## Installer PHP et MySQL en local (Windows)

Le plus simple sur Windows est d'installer **XAMPP**, qui installe en une seule fois PHP, MySQL/MariaDB, Apache et phpMyAdmin (interface graphique pour la base de données) :

1. Téléchargez XAMPP (version PHP 8.x) sur `apachefriends.org` et lancez l'installeur.
2. Installez-le avec les options par défaut (généralement dans `C:\xampp`).
3. Ouvrez le **XAMPP Control Panel** et démarrez les services **Apache** et **MySQL** (bouton "Start" sur chaque ligne).
4. PHP est alors disponible dans `C:\xampp\php`. Ajoutez ce dossier à votre variable d'environnement `PATH` pour pouvoir taper `php` directement dans un terminal :
   - Recherchez "Variables d'environnement" dans le menu Démarrer → "Modifier les variables d'environnement système" → bouton "Variables d'environnement" → sélectionnez `Path` dans la liste du bas → "Modifier" → "Nouveau" → collez `C:\xampp\php` → validez, puis **redémarrez votre terminal**.
5. Vérifiez que tout fonctionne :
   ```powershell
   php -v
   mysql --version
   ```
6. Gérez votre base de données visuellement via phpMyAdmin : `http://localhost/phpmyadmin` (une fois Apache et MySQL démarrés).

> Alternative plus technique : installer PHP seul (`windows.php.net/download`, choisir la version "Thread Safe", l'ajouter au `PATH`) et MySQL/MariaDB séparément. XAMPP reste recommandé si vous n'avez pas l'habitude de configurer ces outils.

## Installation du projet

### Prérequis

- PHP 8.0+ avec l'extension `pdo_mysql` (inclus dans XAMPP)
- MySQL ou MariaDB (inclus dans XAMPP)
- Node.js 18+ et npm

### 1. Base de données

Avec le terminal MySQL fourni par XAMPP (`C:\xampp\mysql\bin\mysql.exe`, ou `mysql` si ajouté au `PATH`) :

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

(Par défaut, l'utilisateur `root` de XAMPP n'a pas de mot de passe : appuyez sur Entrée quand `mysql` le demande.) Vous pouvez aussi importer ces deux fichiers via l'interface phpMyAdmin (`http://localhost/phpmyadmin` → onglet "Importer").

`seed.sql` ne crée que les 3 catégories de départ — **aucun compte n'est pré-créé**, voir la section suivante.

### 2. Back-end

```bash
cd backend
cp .env.example .env
# Éditez .env : identifiants MySQL, JWT_SECRET (générez une valeur aléatoire longue), FRONTEND_URL

php -S localhost:8000 -t public
```

L'API est accessible sur `http://localhost:8000/api/...`.

> Aucune dépendance Composer n'est requise : l'autoload et le JWT sont implémentés en PHP natif dans `backend/src`. Si vous déployez sur Apache, pointez le `DocumentRoot` vers `backend/public` (le `.htaccess` fourni gère la réécriture d'URL).

### 3. Front-end

```bash
cd frontend
cp .env.example .env
# Éditez .env : VITE_API_URL doit pointer vers votre back-end (ex: http://localhost:8000/api)

npm install
npm run dev
```

Le site est accessible sur `http://localhost:5173`.

## Créer le premier compte administrateur

Aucun compte (administrateur ou propriétaire) n'est pré-rempli dans le projet : c'est à l'administrateur de créer son propre compte, avec son propre mot de passe.

Une fois la base de données importée et le `.env` du back-end configuré, lancez (le back-end n'a pas besoin d'être démarré pour ça, juste la base de données) :

```bash
cd backend
php scripts/creer_administrateur.php
```

Le script demande un nom, un email et un mot de passe, puis crée le compte administrateur dans la base. Connectez-vous ensuite sur `/admin/connexion` avec ces identifiants.

Depuis l'espace admin, vous pouvez alors créer le compte propriétaire de Ngoné Seck (menu "Propriétaires" → "Nouveau propriétaire") avec son propre email et mot de passe, puis ajouter les produits de la boutique.

## Fonctionnement des paiements

S'Mod Clothing ne dispose pas d'un accès API marchand Wave/Orange Money : le paiement se fait via un **lien de paiement Wave** (`pay.wave.com`) et un **QR code marchand Orange Money** (scan direct). Il n'y a donc pas d'API programmatique ni de webhook automatique possible.

Le parcours est donc :

1. La cliente passe commande (`POST /api/commandes`) → la commande est créée avec `statut_paiement = en_attente`.
2. La page de confirmation affiche le lien Wave à cliquer, ou le QR code Orange Money à scanner (`POST /api/paiement/wave/initier` ou `/api/paiement/orange-money/initier`), ainsi qu'un bouton pour envoyer la preuve de paiement par WhatsApp.
3. La propriétaire vérifie la réception du paiement sur son compte Wave/Orange Money, puis valide la commande depuis son tableau de bord (`PATCH /api/proprietaire/commandes/{id}/statut`, boutons « Marquer le paiement comme reçu » / changement de statut).

Les numéros de téléphone de contact (787346777, 786525821) et le point de retrait (Guédiawaye, Cité Gadaye) sont centralisés dans [`frontend/src/config.js`](frontend/src/config.js).

## Assets à remplacer (logo et QR code)

Deux visuels fournis par la marque n'ont pas pu être extraits automatiquement de la conversation et doivent être ajoutés manuellement :

1. **QR code Orange Money** : remplacez `frontend/public/assets/paiement/orange-money-qr.svg` par l'image réelle (gardez le même nom de fichier, ou mettez à jour `ORANGE_MONEY_QR_IMAGE` dans `backend/.env`).
2. **Logo S'Mod Clothing** (silhouette rose) : déposez le fichier dans `frontend/src/assets/logo.png`, puis importez-le dans [`frontend/src/components/Navbar.jsx`](frontend/src/components/Navbar.jsx) à la place du texte, si vous souhaitez l'afficher dans l'en-tête.

En attendant, le nom de la boutique est affiché en texte stylisé (comme sur le site de référence amiraveil.netlify.app).

## Déploiement

- Configurez `FRONTEND_URL` (back-end) et `VITE_API_URL` (front-end) avec les URL de production.
- Générez un `JWT_SECRET` fort (`openssl rand -hex 32`).
- Le dossier `backend/public/uploads/` doit être accessible en écriture par PHP (upload d'images produits).
- Servez le front-end buildé (`npm run build` → dossier `frontend/dist`) via un hébergeur statique ou le même serveur web que l'API.
