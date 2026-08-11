<?php

namespace Smod\Services;

/**
 * S'Mod Clothing utilise un lien de paiement marchand Wave (pay.wave.com),
 * pas d'API programmatique avec webhook. Ce service expose donc simplement
 * les informations nécessaires au front pour rediriger le client vers ce
 * lien ; la confirmation du paiement reste une action manuelle du
 * propriétaire (elle vérifie la réception sur son compte Wave puis valide
 * la commande depuis son tableau de bord).
 */
class WaveService
{
    public static function infosPaiement(float $montant, int $idCommande): array
    {
        return [
            'lien_paiement' => env('WAVE_PAYMENT_LINK', 'https://pay.wave.com/m/M_sn_nSnCGLfVeL3K/c/sn/'),
            'montant' => $montant,
            'instructions' => "Payez le montant exact de {$montant} FCFA via le lien Wave, puis indiquez la référence de la transaction (visible dans votre application Wave) dans le formulaire de commande.",
        ];
    }
}
