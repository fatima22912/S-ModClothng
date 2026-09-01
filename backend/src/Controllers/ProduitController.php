<?php

namespace Smod\Controllers;

use Smod\Helpers\Response;
use Smod\Helpers\Validator;
use Smod\Models\Produit;
use Smod\Services\CloudinaryService;

class ProduitController
{
    public static function liste(array $query): void
    {
        $idCategorie = isset($query['categorie']) && $query['categorie'] !== '' ? (int) $query['categorie'] : null;
        $taille = isset($query['taille']) && $query['taille'] !== '' ? $query['taille'] : null;

        $produits = Produit::listerActifs($idCategorie, $taille);
        Response::json($produits);
    }

    public static function detail(int $id): void
    {
        $produit = Produit::trouverParId($id);
        if (!$produit || !$produit['actif']) {
            Response::erreur('Produit introuvable.', 404);
        }

        Response::json(Produit::avecVariantesEtImages($produit));
    }

    // ---- Administration ----------------------------------------------------

    public static function listerAdmin(): void
    {
        Response::json(Produit::listerTous());
    }

    public static function creerAdmin(array $donnees, int $idProprietaireParDefaut): void
    {
        $validator = new Validator($donnees);
        $validator->requis('nom')->requis('prix')->numerique('prix')->numerique('prix_promo')->requis('id_proprietaire');

        if (!$validator->estValide()) {
            Response::erreur($validator->premiereErreur(), 400);
        }

        if (!empty($donnees['prix_promo']) && (float) $donnees['prix_promo'] >= (float) $donnees['prix']) {
            Response::erreur('Le prix promo doit être inférieur au prix normal.', 400);
        }

        $idProduit = Produit::creer([
            'nom' => $donnees['nom'],
            'description' => $donnees['description'] ?? null,
            'prix' => $donnees['prix'],
            'prix_promo' => $donnees['prix_promo'] ?? null,
            'id_categorie' => $donnees['id_categorie'] ?? null,
            'id_proprietaire' => $donnees['id_proprietaire'] ?? $idProprietaireParDefaut,
            'image_principale' => $donnees['image_principale'] ?? null,
            'actif' => $donnees['actif'] ?? 1,
        ]);

        if (!empty($donnees['variantes']) && is_array($donnees['variantes'])) {
            Produit::remplacerVariantes($idProduit, $donnees['variantes']);
        }

        Response::json(Produit::avecVariantesEtImages(Produit::trouverParId($idProduit)), 201);
    }

    public static function modifierAdmin(int $id, array $donnees): void
    {
        $produit = Produit::trouverParId($id);
        if (!$produit) {
            Response::erreur('Produit introuvable.', 404);
        }

        $validator = new Validator($donnees);
        $validator->requis('nom')->requis('prix')->numerique('prix')->numerique('prix_promo');
        if (!$validator->estValide()) {
            Response::erreur($validator->premiereErreur(), 400);
        }

        if (!empty($donnees['prix_promo']) && (float) $donnees['prix_promo'] >= (float) $donnees['prix']) {
            Response::erreur('Le prix promo doit être inférieur au prix normal.', 400);
        }

        Produit::modifier($id, $donnees);

        if (isset($donnees['variantes']) && is_array($donnees['variantes'])) {
            Produit::remplacerVariantes($id, $donnees['variantes']);
        }

        Response::json(Produit::avecVariantesEtImages(Produit::trouverParId($id)));
    }

    public static function supprimerAdmin(int $id): void
    {
        $produit = Produit::trouverParId($id);
        if (!$produit) {
            Response::erreur('Produit introuvable.', 404);
        }

        Produit::supprimer($id);
        Response::json(['message' => 'Produit supprimé.']);
    }

    // ---- Propriétaire (gère uniquement ses propres produits) ---------------

    public static function listerProprietaire(int $idProprietaire): void
    {
        Response::json(Produit::listerParProprietaire($idProprietaire));
    }

    public static function creerProprietaire(array $donnees, int $idProprietaire): void
    {
        $donnees['id_proprietaire'] = $idProprietaire;
        self::creerAdmin($donnees, $idProprietaire);
    }

    public static function modifierProprietaire(int $id, array $donnees, int $idProprietaire): void
    {
        if (!Produit::appartientAuProprietaire($id, $idProprietaire)) {
            Response::erreur('Accès interdit à ce produit.', 403);
        }

        self::modifierAdmin($id, $donnees);
    }

    public static function supprimerProprietaire(int $id, int $idProprietaire): void
    {
        if (!Produit::appartientAuProprietaire($id, $idProprietaire)) {
            Response::erreur('Accès interdit à ce produit.', 403);
        }

        self::supprimerAdmin($id);
    }

    public static function uploaderImageProprietaire(int $id, int $idProprietaire): void
    {
        if (!Produit::appartientAuProprietaire($id, $idProprietaire)) {
            Response::erreur('Accès interdit à ce produit.', 403);
        }

        self::uploaderImageAdmin($id);
    }

    public static function uploaderImageAdmin(int $id): void
    {
        $produit = Produit::trouverParId($id);
        if (!$produit) {
            Response::erreur('Produit introuvable.', 404);
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            Response::erreur('Aucune image valide reçue.', 400);
        }

        $fichier = $_FILES['image'];
        $extensionsAutorisees = ['jpg', 'jpeg', 'png', 'webp'];
        $extension = strtolower(pathinfo($fichier['name'], PATHINFO_EXTENSION));

        if (!in_array($extension, $extensionsAutorisees, true)) {
            Response::erreur('Format d\'image non supporté (jpg, jpeg, png, webp uniquement).', 400);
        }

        if ($fichier['size'] > 5 * 1024 * 1024) {
            Response::erreur('L\'image ne doit pas dépasser 5 Mo.', 400);
        }

        try {
            $urlImage = CloudinaryService::uploaderImage($fichier['tmp_name'], $extension);
        } catch (\Throwable $e) {
            Response::erreur('Échec de l\'enregistrement de l\'image : ' . $e->getMessage(), 500);
        }

        Produit::modifier($id, [
            'nom' => $produit['nom'],
            'description' => $produit['description'],
            'prix' => $produit['prix'],
            'id_categorie' => $produit['id_categorie'],
            'image_principale' => $urlImage,
            'actif' => $produit['actif'],
        ]);

        Response::json(['image_principale' => $urlImage]);
    }
}
