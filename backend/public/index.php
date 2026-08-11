<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/database.php';

// ---- Autoloader PSR-4 minimal (namespace Smod\ -> backend/src/) ------------
spl_autoload_register(function (string $classe) {
    $prefixe = 'Smod\\';
    if (!str_starts_with($classe, $prefixe)) {
        return;
    }
    $cheminRelatif = str_replace('\\', '/', substr($classe, strlen($prefixe)));
    $fichier = __DIR__ . '/../src/' . $cheminRelatif . '.php';
    if (is_file($fichier)) {
        require $fichier;
    }
});

use Smod\Helpers\Response;
use Smod\Helpers\Router;

// ---- CORS -------------------------------------------------------------------
$originesAutorisees = array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:5173')));
$origine = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origine, $originesAutorisees, true)) {
    header("Access-Control-Allow-Origin: {$origine}");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- Corps de la requête -----------------------------------------------------
$corps = [];
$methode = $_SERVER['REQUEST_METHOD'];
$typeContenu = $_SERVER['CONTENT_TYPE'] ?? '';

if (in_array($methode, ['POST', 'PUT', 'PATCH'], true) && str_contains($typeContenu, 'application/json')) {
    $entree = file_get_contents('php://input');
    $decode = json_decode($entree ?: '{}', true);
    $corps = is_array($decode) ? $decode : [];
}

$query = $_GET;

// ---- Dispatch -----------------------------------------------------------------
require_once __DIR__ . '/../routes/api.php';

try {
    $router = new Router();
    smod_routes($router, $corps, $query);
    $router->dispatcher($methode, $_SERVER['REQUEST_URI']);
} catch (Throwable $e) {
    error_log('[S\'Mod API] ' . $e->getMessage());
    Response::erreur('Une erreur interne est survenue. Veuillez réessayer.', 500);
}
