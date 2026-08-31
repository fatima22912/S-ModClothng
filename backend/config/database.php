<?php

require_once __DIR__ . '/env.php';

/**
 * Retourne une connexion PDO unique (singleton) vers PostgreSQL.
 */
function smod_db(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $host = env('DB_HOST', '127.0.0.1');
    $port = env('DB_PORT', '5432');
    $name = env('DB_NAME', 'smod_clothing');
    $user = env('DB_USER', 'postgres');
    $pass = env('DB_PASSWORD', '');

    $dsn = "pgsql:host={$host};port={$port};dbname={$name}";

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
