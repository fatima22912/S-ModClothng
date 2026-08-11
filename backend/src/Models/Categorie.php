<?php

namespace Smod\Models;

class Categorie
{
    public static function listerToutes(): array
    {
        $pdo = smod_db();
        return $pdo->query("SELECT * FROM categories ORDER BY nom")->fetchAll();
    }
}
