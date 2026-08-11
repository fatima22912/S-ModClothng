<?php

namespace Smod\Helpers;

/**
 * Validation simple des entrées utilisateur.
 * Lève une ValidationException listant tous les champs en erreur.
 */
class Validator
{
    /** @var array<string,string> */
    private array $erreurs = [];
    private array $donnees;

    public function __construct(array $donnees)
    {
        $this->donnees = $donnees;
    }

    public function requis(string $champ, string $libelle = null): self
    {
        $valeur = $this->donnees[$champ] ?? null;
        if ($valeur === null || (is_string($valeur) && trim($valeur) === '')) {
            $this->erreurs[$champ] = ($libelle ?? $champ) . ' est obligatoire.';
        }
        return $this;
    }

    public function email(string $champ): self
    {
        $valeur = $this->donnees[$champ] ?? null;
        if ($valeur && !filter_var($valeur, FILTER_VALIDATE_EMAIL)) {
            $this->erreurs[$champ] = 'Adresse email invalide.';
        }
        return $this;
    }

    public function numerique(string $champ): self
    {
        $valeur = $this->donnees[$champ] ?? null;
        if ($valeur !== null && $valeur !== '' && !is_numeric($valeur)) {
            $this->erreurs[$champ] = ($champ) . ' doit être un nombre.';
        }
        return $this;
    }

    public function telephone(string $champ): self
    {
        $valeur = $this->donnees[$champ] ?? null;
        if ($valeur !== null && $valeur !== '' && !preg_match('/^[0-9\s]+$/', $valeur)) {
            $this->erreurs[$champ] = 'Le numéro de téléphone ne doit contenir que des chiffres.';
        }
        return $this;
    }

    public function longueurMax(string $champ, int $max): self
    {
        $valeur = $this->donnees[$champ] ?? null;
        if (is_string($valeur) && mb_strlen($valeur) > $max) {
            $this->erreurs[$champ] = "{$champ} ne doit pas dépasser {$max} caractères.";
        }
        return $this;
    }

    public function dansListe(string $champ, array $valeursAutorisees): self
    {
        $valeur = $this->donnees[$champ] ?? null;
        if ($valeur !== null && !in_array($valeur, $valeursAutorisees, true)) {
            $this->erreurs[$champ] = "{$champ} a une valeur invalide.";
        }
        return $this;
    }

    public function estValide(): bool
    {
        return empty($this->erreurs);
    }

    public function premiereErreur(): ?string
    {
        return $this->erreurs === [] ? null : array_values($this->erreurs)[0];
    }

    public function erreurs(): array
    {
        return $this->erreurs;
    }
}
