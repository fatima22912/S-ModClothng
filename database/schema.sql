-- S'Mod Clothing — schéma de base de données
-- MySQL / MariaDB

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS smod_clothing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smod_clothing;

-- ---------------------------------------------------------------------------
-- administrateurs
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS administrateurs;
CREATE TABLE administrateurs (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(150) NOT NULL,
    email           VARCHAR(190) NOT NULL,
    mot_de_passe    VARCHAR(255) NOT NULL,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_administrateurs_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- proprietaires
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS proprietaires;
CREATE TABLE proprietaires (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom_boutique    VARCHAR(150) NOT NULL,
    nom             VARCHAR(150) NOT NULL,
    email           VARCHAR(190) NOT NULL,
    mot_de_passe    VARCHAR(255) NOT NULL,
    telephone       VARCHAR(30) NOT NULL,
    telephone_2     VARCHAR(30) NULL,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cree_par        INT UNSIGNED NULL,
    UNIQUE KEY uq_proprietaires_email (email),
    CONSTRAINT fk_proprietaires_admin FOREIGN KEY (cree_par) REFERENCES administrateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom     VARCHAR(100) NOT NULL,
    UNIQUE KEY uq_categories_nom (nom)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- produits
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS produits;
CREATE TABLE produits (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom                 VARCHAR(200) NOT NULL,
    description         TEXT NULL,
    prix                DECIMAL(10,2) NOT NULL,
    id_categorie        INT UNSIGNED NULL,
    id_proprietaire     INT UNSIGNED NOT NULL,
    image_principale    VARCHAR(255) NULL,
    actif               TINYINT(1) NOT NULL DEFAULT 1,
    date_creation       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produits_categorie FOREIGN KEY (id_categorie) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_produits_proprietaire FOREIGN KEY (id_proprietaire) REFERENCES proprietaires(id) ON DELETE CASCADE,
    INDEX idx_produits_categorie (id_categorie),
    INDEX idx_produits_proprietaire (id_proprietaire),
    INDEX idx_produits_actif (actif)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- produit_images (photos supplémentaires d'un produit)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS produit_images;
CREATE TABLE produit_images (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_produit  INT UNSIGNED NOT NULL,
    url_image   VARCHAR(255) NOT NULL,
    CONSTRAINT fk_produit_images_produit FOREIGN KEY (id_produit) REFERENCES produits(id) ON DELETE CASCADE,
    INDEX idx_produit_images_produit (id_produit)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- variantes (uniquement la taille — pas de choix de couleur côté client)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS variantes;
CREATE TABLE variantes (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_produit          INT UNSIGNED NOT NULL,
    taille              VARCHAR(20) NOT NULL,
    quantite_stock      INT UNSIGNED NOT NULL DEFAULT 0,
    CONSTRAINT fk_variantes_produit FOREIGN KEY (id_produit) REFERENCES produits(id) ON DELETE CASCADE,
    UNIQUE KEY uq_variante_produit_taille (id_produit, taille),
    INDEX idx_variantes_produit (id_produit)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- commandes
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS commandes;
CREATE TABLE commandes (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom_client              VARCHAR(150) NOT NULL,
    telephone_client        VARCHAR(30) NOT NULL,
    mode_livraison          ENUM('livraison', 'retrait_boutique') NOT NULL DEFAULT 'livraison',
    adresse_livraison       VARCHAR(255) NULL,
    ville                   VARCHAR(100) NULL,
    montant_total           DECIMAL(10,2) NOT NULL,
    mode_paiement           ENUM('wave', 'orange_money') NOT NULL,
    statut_paiement         ENUM('en_attente', 'valide', 'echoue') NOT NULL DEFAULT 'en_attente',
    statut_commande         ENUM('en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee') NOT NULL DEFAULT 'en_attente',
    reference_transaction   VARCHAR(100) NULL,
    date_creation           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_commandes_statut_commande (statut_commande),
    INDEX idx_commandes_statut_paiement (statut_paiement)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- lignes_commande
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS lignes_commande;
CREATE TABLE lignes_commande (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_commande     INT UNSIGNED NOT NULL,
    id_produit      INT UNSIGNED NOT NULL,
    id_variante     INT UNSIGNED NULL,
    quantite        INT UNSIGNED NOT NULL,
    prix_unitaire   DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_lignes_commande_commande FOREIGN KEY (id_commande) REFERENCES commandes(id) ON DELETE CASCADE,
    CONSTRAINT fk_lignes_commande_produit FOREIGN KEY (id_produit) REFERENCES produits(id) ON DELETE RESTRICT,
    CONSTRAINT fk_lignes_commande_variante FOREIGN KEY (id_variante) REFERENCES variantes(id) ON DELETE SET NULL,
    INDEX idx_lignes_commande_commande (id_commande),
    INDEX idx_lignes_commande_produit (id_produit)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
