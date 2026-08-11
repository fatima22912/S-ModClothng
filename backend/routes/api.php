<?php

use Smod\Controllers\AdminController;
use Smod\Controllers\AuthController;
use Smod\Controllers\CategorieController;
use Smod\Controllers\CommandeController;
use Smod\Controllers\PaiementController;
use Smod\Controllers\ProduitController;
use Smod\Controllers\ProprietaireController;
use Smod\Helpers\Router;
use Smod\Middleware\AuthMiddleware;

/**
 * Déclare toutes les routes de l'API. $body = corps JSON décodé,
 * $query = paramètres de la query string.
 */
function smod_routes(Router $router, array $body, array $query): void
{
    // ---- Public : catalogue ------------------------------------------------
    $router->get('/api/produits', function () use ($query) {
        ProduitController::liste($query);
    });

    $router->get('/api/produits/{id}', function (string $id) {
        ProduitController::detail((int) $id);
    });

    $router->get('/api/categories', function () {
        CategorieController::liste();
    });

    // ---- Public : commande & paiement ---------------------------------------
    $router->post('/api/commandes', function () use ($body) {
        CommandeController::creer($body);
    });

    $router->post('/api/paiement/wave/initier', function () use ($body) {
        PaiementController::initierWave($body);
    });

    $router->post('/api/paiement/orange-money/initier', function () use ($body) {
        PaiementController::initierOrangeMoney($body);
    });

    // ---- Authentification -----------------------------------------------
    $router->post('/api/auth/login', function () use ($body) {
        AuthController::login($body);
    });

    // ---- Propriétaire (JWT rôle=proprietaire) ------------------------------
    $router->get('/api/proprietaire/commandes', function () {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProprietaireController::commandes((int) $payload['id']);
    });

    $router->patch('/api/proprietaire/commandes/{id}/statut', function (string $id) use ($body) {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProprietaireController::changerStatutCommande((int) $payload['id'], (int) $id, $body);
    });

    $router->get('/api/proprietaire/statistiques', function () {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProprietaireController::statistiques((int) $payload['id']);
    });

    $router->get('/api/proprietaire/produits', function () {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProduitController::listerProprietaire((int) $payload['id']);
    });

    $router->post('/api/proprietaire/produits', function () use ($body) {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProduitController::creerProprietaire($body, (int) $payload['id']);
    });

    $router->put('/api/proprietaire/produits/{id}', function (string $id) use ($body) {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProduitController::modifierProprietaire((int) $id, $body, (int) $payload['id']);
    });

    $router->delete('/api/proprietaire/produits/{id}', function (string $id) {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProduitController::supprimerProprietaire((int) $id, (int) $payload['id']);
    });

    $router->post('/api/proprietaire/produits/{id}/image', function (string $id) {
        $payload = AuthMiddleware::verifier('proprietaire');
        ProduitController::uploaderImageProprietaire((int) $id, (int) $payload['id']);
    });

    // ---- Administrateur (JWT rôle=administrateur) --------------------------
    $router->get('/api/admin/produits', function () {
        AuthMiddleware::verifier('administrateur');
        ProduitController::listerAdmin();
    });

    $router->post('/api/admin/produits', function () use ($body) {
        AuthMiddleware::verifier('administrateur');
        ProduitController::creerAdmin($body, 0);
    });

    $router->put('/api/admin/produits/{id}', function (string $id) use ($body) {
        AuthMiddleware::verifier('administrateur');
        ProduitController::modifierAdmin((int) $id, $body);
    });

    $router->delete('/api/admin/produits/{id}', function (string $id) {
        AuthMiddleware::verifier('administrateur');
        ProduitController::supprimerAdmin((int) $id);
    });

    $router->post('/api/admin/produits/{id}/image', function (string $id) {
        AuthMiddleware::verifier('administrateur');
        ProduitController::uploaderImageAdmin((int) $id);
    });

    $router->get('/api/admin/proprietaires', function () {
        AuthMiddleware::verifier('administrateur');
        AdminController::listerProprietaires();
    });

    $router->post('/api/admin/proprietaires', function () use ($body) {
        $payload = AuthMiddleware::verifier('administrateur');
        AdminController::creerProprietaire($body, (int) $payload['id']);
    });

    $router->delete('/api/admin/proprietaires/{id}', function (string $id) {
        AuthMiddleware::verifier('administrateur');
        AdminController::supprimerProprietaire((int) $id);
    });
}
