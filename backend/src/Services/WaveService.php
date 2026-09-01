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
        $lienBase = env('WAVE_PAYMENT_LINK', 'https://pay.wave.com/m/M_sn_nSnCGLfVeL3K/c/sn/');
        $lienAvecMontant = rtrim($lienBase, '/') . '/?amount=' . (int) round($montant);

        return [
            'lien_paiement' => $lienAvecMontant,
            'montant' => $montant,
            'instructions' => "Le montant de {$montant} FCFA est déjà renseigné dans Wave : il ne vous reste qu'à valider le paiement, puis à nous envoyer une capture d'écran de la confirmation sur WhatsApp.",
        ];
    }
}
