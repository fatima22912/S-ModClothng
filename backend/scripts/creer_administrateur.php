<?php

/**
 * Script à lancer une seule fois en local pour créer le premier compte
 * administrateur (aucun compte n'est pré-rempli dans la base de données).
 * Une fois connecté à l'espace admin, ce compte permet de créer les
 * comptes propriétaire depuis l'interface.
 *
 * Usage : php backend/scripts/creer_administrateur.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Ce script ne peut être exécuté que en ligne de commande.');
}

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/database.php';

function demander(string $question): string
{
    echo $question;
    return trim(fgets(STDIN));
}

echo "=== Création du compte administrateur S'Mod Clothing ===\n\n";

$nom = demander('Nom complet : ');
$email = demander('Email : ');
$motDePasse = demander('Mot de passe (8 caractères minimum) : ');

if ($nom === '' || $email === '' || $motDePasse === '') {
    fwrite(STDERR, "\nTous les champs sont obligatoires.\n");
    exit(1);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "\nAdresse email invalide.\n");
    exit(1);
}

if (strlen($motDePasse) < 8) {
    fwrite(STDERR, "\nLe mot de passe doit contenir au moins 8 caractères.\n");
    exit(1);
}

$pdo = smod_db();

$stmtExiste = $pdo->prepare('SELECT id FROM administrateurs WHERE email = :email');
$stmtExiste->execute(['email' => $email]);
if ($stmtExiste->fetch()) {
    fwrite(STDERR, "\nUn compte administrateur existe déjà avec cet email.\n");
    exit(1);
}

$stmt = $pdo->prepare(
    'INSERT INTO administrateurs (nom, email, mot_de_passe) VALUES (:nom, :email, :mot_de_passe)'
);
$stmt->execute([
    'nom' => $nom,
    'email' => $email,
    'mot_de_passe' => password_hash($motDePasse, PASSWORD_BCRYPT),
]);

echo "\nCompte administrateur créé avec succès. Connectez-vous sur /admin/connexion avec cet email et ce mot de passe.\n";
