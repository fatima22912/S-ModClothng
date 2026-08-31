-- S'Mod Clothing — données de référence de démarrage
-- À importer après schema.sql
--
-- Aucun compte (administrateur ou propriétaire) n'est créé ici : c'est à
-- l'administrateur de créer son propre compte via le script
-- backend/scripts/creer_administrateur.php, puis de créer le compte
-- propriétaire (Ngoné Seck) depuis l'espace admin. Voir le README.

-- ---------------------------------------------------------------------------
-- Catégories (données de référence, pas de compte)
-- ---------------------------------------------------------------------------
INSERT INTO categories (nom) VALUES
('Robes'),
('Ensembles'),
('Hauts');
