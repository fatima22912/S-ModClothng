<?php

namespace Smod\Controllers;

use Smod\Helpers\Response;
use Smod\Models\Commande;
use Smod\Services\OrangeMoneyService;
use Smod\Services\WaveService;

class PaiementController
{
    public static function initierWave(array $donnees): void
    {
        $commande = self::recupererCommande($donnees);
        Response::json(WaveService::infosPaiement((float) $commande['montant_total'], (int) $commande['id']));
    }

    public static function initierOrangeMoney(array $donnees): void
    {
        $commande = self::recupererCommande($donnees);
        Response::json(OrangeMoneyService::infosPaiement((float) $commande['montant_total'], (int) $commande['id']));
    }

    private static function recupererCommande(array $donnees): array
    {
        $idCommande = (int) ($donnees['id_commande'] ?? 0);
        if ($idCommande <= 0) {
            Response::erreur('id_commande est obligatoire.', 400);
        }

        $commande = Commande::trouverParIdAvecLignes($idCommande);
        if (!$commande) {
            Response::erreur('Commande introuvable.', 404);
        }

        return $commande;
    }
}
