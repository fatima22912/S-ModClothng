<?php

namespace Smod\Models;

use PDO;

class Produit
{
    /**
     * Liste des produits actifs avec filtres optionnels.
     */
    public static function listerActifs(?int $idCategorie = null, ?string $taille = null): array
    {
        $pdo = smod_db();

        $sql = "SELECT p.*, c.nom AS categorie_nom,
                       (SELECT COALESCE(SUM(v.quantite_stock), 0) FROM variantes v WHERE v.id_produit = p.id) AS stock_total,
                       (SELECT COUNT(*) FROM variantes v WHERE v.id_produit = p.id) AS nb_variantes
                FROM produits p
                LEFT JOIN categories c ON c.id = p.id_categorie
                WHERE p.actif = 1";
        $params = [];

        if ($idCategorie !== null) {
            $sql .= " AND p.id_categorie = :id_categorie";
            $params['id_categorie'] = $idCategorie;
        }

        if ($taille !== null) {
            $sql .= " AND EXISTS (SELECT 1 FROM variantes v WHERE v.id_produit = p.id AND v.taille = :taille)";
            $params['taille'] = $taille;
        }

        $sql .= " ORDER BY p.date_creation DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public static function trouverParId(int $id): ?array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "SELECT p.*, c.nom AS categorie_nom
             FROM produits p
             LEFT JOIN categories c ON c.id = p.id_categorie
             WHERE p.id = :id"
        );
        $stmt->execute(['id' => $id]);
        $produit = $stmt->fetch();

        return $produit ?: null;
    }

    public static function avecVariantesEtImages(array $produit): array
    {
        $pdo = smod_db();

        $stmtVariantes = $pdo->prepare(
            "SELECT id, taille, couleur, quantite_stock FROM variantes WHERE id_produit = :id
             ORDER BY ARRAY_POSITION(ARRAY['XS','S','M','L','XL','XXL'], taille), taille, couleur"
        );
        $stmtVariantes->execute(['id' => $produit['id']]);
        $produit['variantes'] = $stmtVariantes->fetchAll();

        $stmtImages = $pdo->prepare("SELECT id, url_image FROM produit_images WHERE id_produit = :id");
        $stmtImages->execute(['id' => $produit['id']]);
        $produit['images'] = $stmtImages->fetchAll();

        return $produit;
    }

    public static function listerParProprietaire(int $idProprietaire): array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "SELECT p.*, c.nom AS categorie_nom
             FROM produits p
             LEFT JOIN categories c ON c.id = p.id_categorie
             WHERE p.id_proprietaire = :id
             ORDER BY p.date_creation DESC"
        );
        $stmt->execute(['id' => $idProprietaire]);
        return $stmt->fetchAll();
    }

    public static function listerTous(): array
    {
        $pdo = smod_db();
        $stmt = $pdo->query(
            "SELECT p.*, c.nom AS categorie_nom, pr.nom_boutique
             FROM produits p
             LEFT JOIN categories c ON c.id = p.id_categorie
             LEFT JOIN proprietaires pr ON pr.id = p.id_proprietaire
             ORDER BY p.date_creation DESC"
        );
        return $stmt->fetchAll();
    }

    public static function creer(array $donnees): int
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "INSERT INTO produits (nom, description, prix, prix_promo, id_categorie, id_proprietaire, image_principale, actif)
             VALUES (:nom, :description, :prix, :prix_promo, :id_categorie, :id_proprietaire, :image_principale, :actif)"
        );
        $stmt->execute([
            'nom' => $donnees['nom'],
            'description' => $donnees['description'] ?? null,
            'prix' => $donnees['prix'],
            'prix_promo' => $donnees['prix_promo'] ?? null,
            'id_categorie' => $donnees['id_categorie'] ?? null,
            'id_proprietaire' => $donnees['id_proprietaire'],
            'image_principale' => $donnees['image_principale'] ?? null,
            'actif' => $donnees['actif'] ?? 1,
        ]);

        return (int) $pdo->lastInsertId();
    }

    public static function modifier(int $id, array $donnees): void
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "UPDATE produits SET
                nom = :nom,
                description = :description,
                prix = :prix,
                prix_promo = :prix_promo,
                id_categorie = :id_categorie,
                image_principale = COALESCE(:image_principale, image_principale),
                actif = :actif
             WHERE id = :id"
        );
        $stmt->execute([
            'nom' => $donnees['nom'],
            'description' => $donnees['description'] ?? null,
            'prix' => $donnees['prix'],
            'prix_promo' => $donnees['prix_promo'] ?? null,
            'id_categorie' => $donnees['id_categorie'] ?? null,
            'image_principale' => $donnees['image_principale'] ?? null,
            'actif' => $donnees['actif'] ?? 1,
            'id' => $id,
        ]);
    }

    public static function supprimer(int $id): void
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare("DELETE FROM produits WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public static function remplacerVariantes(int $idProduit, array $variantes): void
    {
        $pdo = smod_db();
        $pdo->prepare("DELETE FROM variantes WHERE id_produit = :id")->execute(['id' => $idProduit]);

        $stmt = $pdo->prepare(
            "INSERT INTO variantes (id_produit, taille, couleur, quantite_stock) VALUES (:id_produit, :taille, :couleur, :quantite_stock)"
        );
        foreach ($variantes as $variante) {
            $stmt->execute([
                'id_produit' => $idProduit,
                'taille' => $variante['taille'],
                'couleur' => $variante['couleur'] ?: null,
                'quantite_stock' => $variante['quantite_stock'] ?? 0,
            ]);
        }
    }

    public static function appartientAuProprietaire(int $idProduit, int $idProprietaire): bool
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare("SELECT 1 FROM produits WHERE id = :id AND id_proprietaire = :prop");
        $stmt->execute(['id' => $idProduit, 'prop' => $idProprietaire]);
        return (bool) $stmt->fetchColumn();
    }
}
