<?php

namespace Smod\Models;

class Variante
{
    public static function trouverParId(int $id): ?array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare("SELECT * FROM variantes WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $variante = $stmt->fetch();
        return $variante ?: null;
    }

    public static function decrementerStock(int $id, int $quantite): void
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare(
            "UPDATE variantes SET quantite_stock = quantite_stock - :quantite WHERE id = :id AND quantite_stock >= :quantite_min"
        );
        $stmt->execute(['id' => $id, 'quantite' => $quantite, 'quantite_min' => $quantite]);
    }
}
