<?php

namespace Smod\Controllers;

use Smod\Helpers\Response;
use Smod\Helpers\Validator;
use Smod\Models\Commande;

class ProprietaireController
{
    public static function commandes(int $idProprietaire): void
    {
        Response::json(Commande::listerParProprietaire($idProprietaire));
    }

    public static function changerStatutCommande(int $idProprietaire, int $idCommande, array $donnees): void
    {
        if (!Commande::appartientAuProprietaire($idCommande, $idProprietaire)) {
            Response::erreur('Commande introuvable.', 404);
        }

        $validator = new Validator($donnees);
        $validator
            ->dansListe('statut_commande', ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'])
            ->dansListe('statut_paiement', ['en_attente', 'valide', 'echoue']);

        if (!$validator->estValide()) {
            Response::erreur($validator->premiereErreur(), 400);
        }

        if (empty($donnees['statut_commande']) && empty($donnees['statut_paiement'])) {
            Response::erreur('Aucun statut à mettre à jour.', 400);
        }

        Commande::changerStatut($idCommande, $donnees['statut_commande'] ?? null, $donnees['statut_paiement'] ?? null);
        Response::json(Commande::trouverParIdAvecLignes($idCommande));
    }

    public static function statistiques(int $idProprietaire): void
    {
        Response::json(Commande::statistiquesProprietaire($idProprietaire));
    }
}
