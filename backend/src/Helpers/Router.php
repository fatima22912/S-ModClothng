<?php

namespace Smod\Helpers;

/**
 * Routeur minimal : associe méthode HTTP + motif d'URL (avec {paramètres})
 * à une fonction de traitement.
 */
class Router
{
    private array $routes = [];

    public function ajouter(string $methode, string $motif, callable $gestionnaire): void
    {
        $this->routes[] = ['methode' => $methode, 'motif' => $motif, 'gestionnaire' => $gestionnaire];
    }

    public function get(string $motif, callable $gestionnaire): void { $this->ajouter('GET', $motif, $gestionnaire); }
    public function post(string $motif, callable $gestionnaire): void { $this->ajouter('POST', $motif, $gestionnaire); }
    public function put(string $motif, callable $gestionnaire): void { $this->ajouter('PUT', $motif, $gestionnaire); }
    public function patch(string $motif, callable $gestionnaire): void { $this->ajouter('PATCH', $motif, $gestionnaire); }
    public function delete(string $motif, callable $gestionnaire): void { $this->ajouter('DELETE', $motif, $gestionnaire); }

    public function dispatcher(string $methode, string $uri): void
    {
        $uri = '/' . trim(parse_url($uri, PHP_URL_PATH), '/');

        foreach ($this->routes as $route) {
            if ($route['methode'] !== $methode) {
                continue;
            }

            $params = $this->correspond($route['motif'], $uri);
            if ($params !== null) {
                call_user_func_array($route['gestionnaire'], $params);
                return;
            }
        }

        Response::erreur('Route introuvable.', 404);
    }

    private function correspond(string $motif, string $uri): ?array
    {
        $motifRegex = preg_replace('/\{[a-zA-Z_]+\}/', '([^/]+)', $motif);
        $motifRegex = '#^' . $motifRegex . '$#';

        if (preg_match($motifRegex, $uri, $matches)) {
            array_shift($matches);
            return $matches;
        }

        return null;
    }
}
