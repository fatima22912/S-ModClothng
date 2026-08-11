<?php

namespace Smod\Models;

class Administrateur
{
    public static function trouverParEmail(string $email): ?array
    {
        $pdo = smod_db();
        $stmt = $pdo->prepare("SELECT * FROM administrateurs WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $admin = $stmt->fetch();
        return $admin ?: null;
    }
}
