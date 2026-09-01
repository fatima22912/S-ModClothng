<?php

namespace Smod\Services;

use RuntimeException;

/**
 * Upload des photos produits vers Cloudinary (stockage gratuit et
 * persistant). Nécessaire car le disque du conteneur backend est
 * réinitialisé à chaque redéploiement sur Render (stockage local perdu).
 */
class CloudinaryService
{
    public static function uploaderImage(string $cheminFichierTemp, string $extension): string
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            throw new RuntimeException("Le stockage d'images (Cloudinary) n'est pas configuré.");
        }

        $timestamp = time();
        $dossier = 'smod-clothing/produits';
        $signature = sha1("folder={$dossier}&timestamp={$timestamp}{$apiSecret}");

        $contenu = base64_encode(file_get_contents($cheminFichierTemp));
        $fichierData = "data:image/{$extension};base64,{$contenu}";

        $corps = http_build_query([
            'file' => $fichierData,
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'folder' => $dossier,
            'signature' => $signature,
        ]);

        $contexte = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => $corps,
                'timeout' => 20,
                'ignore_errors' => true,
            ],
        ]);

        $reponse = file_get_contents("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", false, $contexte);
        $donnees = json_decode($reponse ?: '', true);

        if (!isset($donnees['secure_url'])) {
            $message = $donnees['error']['message'] ?? "Échec de l'upload vers Cloudinary.";
            throw new RuntimeException($message);
        }

        return $donnees['secure_url'];
    }
}
