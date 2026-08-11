<?php

namespace Smod\Middleware;

use Smod\Helpers\Jwt;
use Smod\Helpers\Response;

class AuthMiddleware
{
    /**
     * Vérifie le token JWT présent dans l'en-tête Authorization et, si un
     * rôle est fourni, vérifie que le token correspond bien à ce rôle.
     * Arrête la requête (401/403) si la vérification échoue.
     *
     * @return array Le payload décodé du token (contient au minimum id et role)
     */
    public static function verifier(?string $roleRequis = null): array
    {
        $headers = self::obtenirHeaders();
        $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!$authorization || !str_starts_with($authorization, 'Bearer ')) {
            Response::erreur('Authentification requise.', 401);
        }

        $token = trim(substr($authorization, 7));
        $secret = env('JWT_SECRET', 'change-me');
        $payload = Jwt::decode($token, $secret);

        if ($payload === null) {
            Response::erreur('Session expirée ou invalide, veuillez vous reconnecter.', 401);
        }

        if ($roleRequis !== null && ($payload['role'] ?? null) !== $roleRequis) {
            Response::erreur('Accès interdit pour ce rôle.', 403);
        }

        return $payload;
    }

    private static function obtenirHeaders(): array
    {
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (is_array($headers)) {
                return $headers;
            }
        }

        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $headers[$name] = $value;
            }
        }
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        }

        return $headers;
    }
}
