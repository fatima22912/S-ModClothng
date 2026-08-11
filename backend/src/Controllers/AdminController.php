<?php

namespace Smod\Controllers;

use Smod\Helpers\Response;
use Smod\Helpers\Validator;
use Smod\Models\Proprietaire;

class AdminController
{
    public static function listerProprietaires(): void
    {
        Response::json(Proprietaire::listerTous());
    }

    public static function creerProprietaire(array $donnees, int $idAdmin): void
    {
        $validator = new Validator($donnees);
        $validator
            ->requis('nom_boutique')->longueurMax('nom_boutique', 150)
            ->requis('nom')->longueurMax('nom', 150)
            ->requis('email')->email('email')
            ->requis('mot_de_passe')
            ->requis('telephone')->longueurMax('telephone', 30);

        if (!$validator->estValide()) {
            Response::erreur($validator->premiereErreur(), 400);
        }

        if (strlen($donnees['mot_de_passe']) < 8) {
            Response::erreur('Le mot de passe doit contenir au moins 8 caractères.', 400);
        }

        if (Proprietaire::trouverParEmail($donnees['email'])) {
            Response::erreur('Un compte existe déjà avec cet email.', 409);
        }

        $id = Proprietaire::creer([
            'nom_boutique' => trim($donnees['nom_boutique']),
            'nom' => trim($donnees['nom']),
            'email' => trim($donnees['email']),
            'mot_de_passe' => $donnees['mot_de_passe'],
            'telephone' => trim($donnees['telephone']),
            'telephone_2' => isset($donnees['telephone_2']) ? trim($donnees['telephone_2']) : null,
            'cree_par' => $idAdmin,
        ]);

        $proprietaireCree = Proprietaire::trouverParId($id);
        unset($proprietaireCree['mot_de_passe']);
        Response::json($proprietaireCree, 201);
    }

    public static function supprimerProprietaire(int $id): void
    {
        if (!Proprietaire::trouverParId($id)) {
            Response::erreur('Propriétaire introuvable.', 404);
        }

        Proprietaire::supprimer($id);
        Response::json(['message' => 'Propriétaire supprimé.']);
    }
}
