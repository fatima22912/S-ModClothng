<?php

namespace Smod\Models;

use PDO;
use RuntimeException;

class Commande
{
    /**
     * Crée une commande avec ses lignes de façon transactionnelle.
     * $panier = [ ['id_produit' => int, 'id_variante' => ?int, 'quantite' => int], ... ]
     * Vérifie le stock, calcule le total à partir des prix en base (jamais du panier client).
     *
     * @throws RuntimeException si un produit est inactif/inexistant ou en rupture de stock
     */
    public static function creerAvecLignes(array $entete, array $panier): array
    {
        $pdo = smod_db();
        $pdo->beginTransaction();

        try {
            $montantTotal = 0;
            $lignesPreparees = [];

            foreach ($panier as $item) {
                $stmtProduit = $pdo->prepare("SELECT * FROM produits WHERE id = :id AND actif = 1 FOR UPDATE");
                $stmtProduit->execute(['id' => $item['id_produit']]);
                $produit = $stmtProduit->fetch();

                if (!$produit) {
                    throw new RuntimeException("Un des articles du panier n'est plus disponible.");
                }

                $idVariante = $item['id_variante'] ?? null;
                if ($idVariante !== null) {
                    $stmtVariante = $pdo->prepare(
                        "SELECT * FROM variantes WHERE id = :id AND id_produit = :id_produit FOR UPDATE"
                    );
                    $stmtVariante->execute(['id' => $idVariante, 'id_produit' => $item['id_produit']]);
                    $variante = $stmtVariante->fetch();

                    if (!$variante) {
                        throw new RuntimeException("La taille sélectionnée n'existe plus pour « {$produit['nom']} ».");
                    }

                    if ($variante['quantite_stock'] < $item['quantite']) {
                        throw new RuntimeException("Stock insuffisant pour « {$produit['nom']} » (taille {$variante['taille']}).");
                    }
                }

                $prixUnitaire = (float) $produit['prix'];
                $montantTotal += $prixUnitaire * $item['quantite'];

                $lignesPreparees[] = [
                    'id_produit' => $produit['id'],
                    'id_variante' => $idVariante,
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $prixUnitaire,
                    'nom_produit' => $produit['nom'],
                ];
            }

            $stmtCommande = $pdo->prepare(
                "INSERT INTO commandes
                    (nom_client, telephone_client, mode_livraison, adresse_livraison, ville, montant_total, mode_paiement, reference_transaction)
                 VALUES
                    (:nom_client, :telephone_client, :mode_livraison, :adresse_livraison, :ville, :montant_total, :mode_paiement, :reference_transaction)"
            );
            $stmtCommande->execute([
                'nom_client' => $entete['nom_client'],
                'telephone_client' => $entete['telephone_client'],
                'mode_livraison' => $entete['mode_livraison'],
                'adresse_livraison' => $entete['adresse_livraison'] ?? null,
                'ville' => $entete['ville'] ?? null,
                'montant_total' => $montantTotal,
                'mode_paiement' => $entete['mode_paiement'],
                'reference_transaction' => $entete['reference_transaction'] ?? null,
            ]);
            $idCommande = (int) $pdo->lastInsertId();

            $stmtLigne = $pdo->prepare(
                "INSERT INTO lignes_commande (id_commande, id_produit, id_variante, quantite, prix_unitaire)
                 VALUES (:id_commande, :id_produit, :id_variante, :quantite, :prix_unitaire)"
            );

            foreach ($lignesPreparees as $ligne) {
                $stmtLigne->execute([
                    'id_commande' => $idCommande,
                    'id_produit' => $ligne['id_produit'],
                    'id_variante' => $ligne['id_variante'],
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $ligne['prix_unitaire'],
                ]);

                if ($ligne['id_variante'] !== null) {
                    Variante::decrementerStock($ligne['id_variante'], $ligne['quantite']);
                }
            }

            $pdo->commit();

            return self::trouverParIdAvecLignes($idCommande);
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public static function trouverParIdAvecLignes(int $id): ?array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare("SELECT * FROM commandes WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $commande = $stmt->fetch();

        if (!$commande) {
            return null;
        }

        $stmtLignes = $pdo->prepare(
            "SELECT lc.*, p.nom AS nom_produit, v.taille
             FROM lignes_commande lc
             JOIN produits p ON p.id = lc.id_produit
             LEFT JOIN variantes v ON v.id = lc.id_variante
             WHERE lc.id_commande = :id"
        );
        $stmtLignes->execute(['id' => $id]);
        $commande['lignes'] = $stmtLignes->fetchAll();

        return $commande;
    }

    /**
     * Commandes contenant au moins un produit du propriétaire donné.
     */
    public static function listerParProprietaire(int $idProprietaire): array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "SELECT DISTINCT c.*
             FROM commandes c
             JOIN lignes_commande lc ON lc.id_commande = c.id
             JOIN produits p ON p.id = lc.id_produit
             WHERE p.id_proprietaire = :id
             ORDER BY c.date_creation DESC"
        );
        $stmt->execute(['id' => $idProprietaire]);
        $commandes = $stmt->fetchAll();

        foreach ($commandes as &$commande) {
            $commande['lignes'] = self::lignesPourProprietaire((int) $commande['id'], $idProprietaire);
        }

        return $commandes;
    }

    private static function lignesPourProprietaire(int $idCommande, int $idProprietaire): array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "SELECT lc.*, p.nom AS nom_produit, v.taille
             FROM lignes_commande lc
             JOIN produits p ON p.id = lc.id_produit
             LEFT JOIN variantes v ON v.id = lc.id_variante
             WHERE lc.id_commande = :id_commande AND p.id_proprietaire = :id_proprietaire"
        );
        $stmt->execute(['id_commande' => $idCommande, 'id_proprietaire' => $idProprietaire]);
        return $stmt->fetchAll();
    }

    public static function appartientAuProprietaire(int $idCommande, int $idProprietaire): bool
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "SELECT 1 FROM commandes c
             JOIN lignes_commande lc ON lc.id_commande = c.id
             JOIN produits p ON p.id = lc.id_produit
             WHERE c.id = :id_commande AND p.id_proprietaire = :id_proprietaire
             LIMIT 1"
        );
        $stmt->execute(['id_commande' => $idCommande, 'id_proprietaire' => $idProprietaire]);
        return (bool) $stmt->fetchColumn();
    }

    public static function changerStatut(int $id, ?string $statutCommande, ?string $statutPaiement): void
    {
        $pdo = smod_db();
        $champs = [];
        $params = ['id' => $id];

        if ($statutCommande !== null) {
            $champs[] = 'statut_commande = :statut_commande';
            $params['statut_commande'] = $statutCommande;
        }
        if ($statutPaiement !== null) {
            $champs[] = 'statut_paiement = :statut_paiement';
            $params['statut_paiement'] = $statutPaiement;
        }

        if ($champs === []) {
            return;
        }

        $sql = 'UPDATE commandes SET ' . implode(', ', $champs) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($params);
    }

    public static function statistiquesProprietaire(int $idProprietaire): array
    {
        $pdo = smod_db();

        $stmtGlobal = $pdo->prepare(
            "SELECT
                COUNT(DISTINCT c.id) AS nombre_commandes,
                COALESCE(SUM(lc.quantite * lc.prix_unitaire), 0) AS chiffre_affaires
             FROM commandes c
             JOIN lignes_commande lc ON lc.id_commande = c.id
             JOIN produits p ON p.id = lc.id_produit
             WHERE p.id_proprietaire = :id AND c.statut_paiement = 'valide'"
        );
        $stmtGlobal->execute(['id' => $idProprietaire]);
        $global = $stmtGlobal->fetch();

        $stmtTop = $pdo->prepare(
            "SELECT p.id, p.nom, SUM(lc.quantite) AS quantite_vendue,
                    SUM(lc.quantite * lc.prix_unitaire) AS montant_genere
             FROM lignes_commande lc
             JOIN produits p ON p.id = lc.id_produit
             JOIN commandes c ON c.id = lc.id_commande
             WHERE p.id_proprietaire = :id AND c.statut_paiement = 'valide'
             GROUP BY p.id, p.nom
             ORDER BY quantite_vendue DESC
             LIMIT 5"
        );
        $stmtTop->execute(['id' => $idProprietaire]);

        return [
            'chiffre_affaires' => (float) $global['chiffre_affaires'],
            'nombre_commandes' => (int) $global['nombre_commandes'],
            'produits_plus_vendus' => $stmtTop->fetchAll(),
        ];
    }
}
