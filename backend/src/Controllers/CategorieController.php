<?php

namespace Smod\Controllers;

use Smod\Helpers\Response;
use Smod\Models\Categorie;

class CategorieController
{
    public static function liste(): void
    {
        Response::json(Categorie::listerToutes());
    }
}
