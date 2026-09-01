<?php

namespace Smod\Services;

/**
 * Paiement Orange Money via QR code marchand statique (scan direct depuis
 * l'application Orange Money), pas d'API programmatique. Comme pour Wave,
 * la validation du paiement est une action manuelle du propriétaire.
 */
class OrangeMoneyService
{
    public static function infosPaiement(float $montant, int $idCommande): array
    {
        return [
            'qr_code_image' => env('ORANGE_MONEY_QR_IMAGE', '/assets/paiement/orange-money-qr.png'),
            'montant' => $montant,
            'instructions' => "Scannez le QR code Orange Money avec votre application, payez {$montant} FCFA, puis envoyez-nous une capture d'écran de la confirmation sur WhatsApp.",
        ];
    }
}
