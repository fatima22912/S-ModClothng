<?php

namespace Smod\Controllers;

use Smod\Helpers\Jwt;
use Smod\Helpers\Response;
use Smod\Helpers\Validator;
use Smod\Models\Administrateur;
use Smod\Models\Proprietaire;

class AuthController
{
    public static function login(array $donnees): void
    {
        $validator = new Validator($donnees);
        $validator->requis('email')->email('email')->requis('mot_de_passe');

        if (!$validator->estValide()) {
            Response::erreur($validator->premiereErreur(), 400);
        }

        $email = trim($donnees['email']);
        $motDePasse = $donnees['mot_de_passe'];

        $proprietaire = Proprietaire::trouverParEmail($email);
        if ($proprietaire && password_verify($motDePasse, $proprietaire['mot_de_passe'])) {
            self::repondreAvecToken($proprietaire['id'], 'proprietaire', [
                'nom' => $proprietaire['nom'],
                'nom_boutique' => $proprietaire['nom_boutique'],
                'email' => $proprietaire['email'],
            ]);
            return;
        }

        $admin = Administrateur::trouverParEmail($email);
        if ($admin && password_verify($motDePasse, $admin['mot_de_passe'])) {
            self::repondreAvecToken($admin['id'], 'administrateur', [
                'nom' => $admin['nom'],
                'email' => $admin['email'],
            ]);
            return;
        }

        Response::erreur('Email ou mot de passe incorrect.', 401);
    }

    private static function repondreAvecToken(int $id, string $role, array $utilisateur): void
    {
        $secret = env('JWT_SECRET', 'change-me');
        $ttl = (int) env('JWT_TTL_SECONDS', 86400);

        $token = Jwt::encode(['id' => $id, 'role' => $role], $secret, $ttl);

        Response::json([
            'token' => $token,
            'role' => $role,
            'utilisateur' => array_merge(['id' => $id], $utilisateur),
        ]);
    }
}
