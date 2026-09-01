<?php

namespace Smod\Controllers;

use RuntimeException;
use Smod\Helpers\Response;
use Smod\Helpers\Validator;
use Smod\Models\Commande;

class CommandeController
{
    public static function creer(array $donnees): void
    {
        $validator = new Validator($donnees);
        $validator
            ->requis('nom_client')->longueurMax('nom_client', 150)
            ->requis('telephone_client')->longueurMax('telephone_client', 30)->telephone('telephone_client')
            ->requis('mode_paiement')->dansListe('mode_paiement', ['wave', 'orange_money'])
            ->requis('adresse_livraison')->requis('ville');

        if (!$validator->estValide()) {
            Response::erreur($validator->premiereErreur(), 400);
        }

        $panier = $donnees['panier'] ?? null;
        if (!is_array($panier) || count($panier) === 0) {
            Response::erreur('Le panier est vide.', 400);
        }

        foreach ($panier as $item) {
            if (empty($item['id_produit']) || empty($item['quantite']) || (int) $item['quantite'] < 1) {
                Response::erreur('Panier invalide.', 400);
            }
        }

        try {
            $commande = Commande::creerAvecLignes([
                'nom_client' => trim($donnees['nom_client']),
                'telephone_client' => trim($donnees['telephone_client']),
                'mode_livraison' => 'livraison',
                'adresse_livraison' => $donnees['adresse_livraison'],
                'ville' => $donnees['ville'],
                'mode_paiement' => $donnees['mode_paiement'],
                'reference_transaction' => $donnees['reference_transaction'] ?? null,
            ], $panier);

            Response::json($commande, 201);
        } catch (RuntimeException $e) {
            Response::erreur($e->getMessage(), 409);
        }
    }
}
