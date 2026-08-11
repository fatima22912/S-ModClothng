<?php

namespace Smod\Models;

class Proprietaire
{
    public static function trouverParEmail(string $email): ?array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare("SELECT * FROM proprietaires WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $proprietaire = $stmt->fetch();
        return $proprietaire ?: null;
    }

    public static function trouverParId(int $id): ?array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare("SELECT * FROM proprietaires WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $proprietaire = $stmt->fetch();
        return $proprietaire ?: null;
    }

    public static function listerTous(): array
    {
        $pdo = smod_db();
        return $pdo->query(
            "SELECT id, nom_boutique, nom, email, telephone, telephone_2, date_creation FROM proprietaires ORDER BY date_creation DESC"
        )->fetchAll();
    }

    public static function creer(array $donnees): int
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "INSERT INTO proprietaires (nom_boutique, nom, email, mot_de_passe, telephone, telephone_2, cree_par)
             VALUES (:nom_boutique, :nom, :email, :mot_de_passe, :telephone, :telephone_2, :cree_par)"
        );
        $stmt->execute([
            'nom_boutique' => $donnees['nom_boutique'],
            'nom' => $donnees['nom'],
            'email' => $donnees['email'],
            'mot_de_passe' => password_hash($donnees['mot_de_passe'], PASSWORD_BCRYPT),
            'telephone' => $donnees['telephone'],
            'telephone_2' => $donnees['telephone_2'] ?? null,
            'cree_par' => $donnees['cree_par'] ?? null,
        ]);

        return (int) $pdo->lastInsertId();
    }

    public static function supprimer(int $id): void
    {
        $pdo = smod_db();
        $pdo->prepare("DELETE FROM proprietaires WHERE id = :id")->execute(['id' => $id]);
    }
}
