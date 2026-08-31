-- S'Mod Clothing — schéma de base de données
-- PostgreSQL

DROP TABLE IF EXISTS lignes_commande, commandes, variantes, produit_images, produits, categories, proprietaires, administrateurs CASCADE;

-- ---------------------------------------------------------------------------
-- administrateurs
-- ---------------------------------------------------------------------------
CREATE TABLE administrateurs (
    id              SERIAL PRIMARY KEY,
    nom             VARCHAR(150) NOT NULL,
    email           VARCHAR(190) NOT NULL,
    mot_de_passe    VARCHAR(255) NOT NULL,
    date_creation   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_administrateurs_email UNIQUE (email)
);

-- ---------------------------------------------------------------------------
-- proprietaires
-- ---------------------------------------------------------------------------
CREATE TABLE proprietaires (
    id              SERIAL PRIMARY KEY,
    nom_boutique    VARCHAR(150) NOT NULL,
    nom             VARCHAR(150) NOT NULL,
    email           VARCHAR(190) NOT NULL,
    mot_de_passe    VARCHAR(255) NOT NULL,
    telephone       VARCHAR(30) NOT NULL,
    telephone_2     VARCHAR(30) NULL,
    date_creation   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cree_par        INTEGER NULL,
    CONSTRAINT uq_proprietaires_email UNIQUE (email),
    CONSTRAINT fk_proprietaires_admin FOREIGN KEY (cree_par) REFERENCES administrateurs(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
    id      SERIAL PRIMARY KEY,
    nom     VARCHAR(100) NOT NULL,
    CONSTRAINT uq_categories_nom UNIQUE (nom)
);

-- ---------------------------------------------------------------------------
-- produits
-- ---------------------------------------------------------------------------
CREATE TABLE produits (
    id                  SERIAL PRIMARY KEY,
    nom                 VARCHAR(200) NOT NULL,
    description         TEXT NULL,
    prix                DECIMAL(10,2) NOT NULL,
    id_categorie        INTEGER NULL,
    id_proprietaire     INTEGER NOT NULL,
    image_principale    VARCHAR(255) NULL,
    actif               SMALLINT NOT NULL DEFAULT 1,
    date_creation       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produits_categorie FOREIGN KEY (id_categorie) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_produits_proprietaire FOREIGN KEY (id_proprietaire) REFERENCES proprietaires(id) ON DELETE CASCADE
);
CREATE INDEX idx_produits_categorie ON produits (id_categorie);
CREATE INDEX idx_produits_proprietaire ON produits (id_proprietaire);
CREATE INDEX idx_produits_actif ON produits (actif);

-- ---------------------------------------------------------------------------
-- produit_images (photos supplémentaires d'un produit)
-- ---------------------------------------------------------------------------
CREATE TABLE produit_images (
    id          SERIAL PRIMARY KEY,
    id_produit  INTEGER NOT NULL,
    url_image   VARCHAR(255) NOT NULL,
    CONSTRAINT fk_produit_images_produit FOREIGN KEY (id_produit) REFERENCES produits(id) ON DELETE CASCADE
);
CREATE INDEX idx_produit_images_produit ON produit_images (id_produit);

-- ---------------------------------------------------------------------------
-- variantes (uniquement la taille — pas de choix de couleur côté client)
-- ---------------------------------------------------------------------------
CREATE TABLE variantes (
    id                  SERIAL PRIMARY KEY,
    id_produit          INTEGER NOT NULL,
    taille              VARCHAR(20) NOT NULL,
    quantite_stock      INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_variantes_produit FOREIGN KEY (id_produit) REFERENCES produits(id) ON DELETE CASCADE,
    CONSTRAINT uq_variante_produit_taille UNIQUE (id_produit, taille)
);
CREATE INDEX idx_variantes_produit ON variantes (id_produit);

-- ---------------------------------------------------------------------------
-- commandes
-- ---------------------------------------------------------------------------
CREATE TABLE commandes (
    id                      SERIAL PRIMARY KEY,
    nom_client              VARCHAR(150) NOT NULL,
    telephone_client        VARCHAR(30) NOT NULL,
    mode_livraison          VARCHAR(20) NOT NULL DEFAULT 'livraison'
                                CHECK (mode_livraison IN ('livraison', 'retrait_boutique')),
    adresse_livraison       VARCHAR(255) NULL,
    ville                   VARCHAR(100) NULL,
    montant_total           DECIMAL(10,2) NOT NULL,
    mode_paiement           VARCHAR(20) NOT NULL
                                CHECK (mode_paiement IN ('wave', 'orange_money')),
    statut_paiement         VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                                CHECK (statut_paiement IN ('en_attente', 'valide', 'echoue')),
    statut_commande         VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                                CHECK (statut_commande IN ('en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee')),
    reference_transaction   VARCHAR(100) NULL,
    date_creation           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_commandes_statut_commande ON commandes (statut_commande);
CREATE INDEX idx_commandes_statut_paiement ON commandes (statut_paiement);

-- ---------------------------------------------------------------------------
-- lignes_commande
-- ---------------------------------------------------------------------------
CREATE TABLE lignes_commande (
    id              SERIAL PRIMARY KEY,
    id_commande     INTEGER NOT NULL,
    id_produit      INTEGER NOT NULL,
    id_variante     INTEGER NULL,
    quantite        INTEGER NOT NULL,
    prix_unitaire   DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_lignes_commande_commande FOREIGN KEY (id_commande) REFERENCES commandes(id) ON DELETE CASCADE,
    CONSTRAINT fk_lignes_commande_produit FOREIGN KEY (id_produit) REFERENCES produits(id) ON DELETE RESTRICT,
    CONSTRAINT fk_lignes_commande_variante FOREIGN KEY (id_variante) REFERENCES variantes(id) ON DELETE SET NULL
);
CREATE INDEX idx_lignes_commande_commande ON lignes_commande (id_commande);
CREATE INDEX idx_lignes_commande_produit ON lignes_commande (id_produit);
