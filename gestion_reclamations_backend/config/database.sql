CREATE DATABASE IF NOT EXISTS gestion_reclamations_sofima 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gestion_reclamations_sofima;
DROP TABLE IF EXISTS fichiers;
DROP TABLE IF EXISTS reparations;
DROP TABLE IF EXISTS reclamations;
DROP TABLE IF EXISTS equipements;
DROP TABLE IF EXISTS utilisateurs;
DROP TABLE IF EXISTS roles;


CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    actif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE equipements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    categorie VARCHAR(100),
    reference VARCHAR(100) UNIQUE,
    atelier VARCHAR(50) COMMENT 'AIO1, AIO2, AIO3, AIO4, AIO5',
    ligne_production VARCHAR(50) COMMENT 'FPO, tôle, FME, montage, etc.',
    actif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE reclamations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) UNIQUE COMMENT 'Format: RC-YYYY-MM-XXXX',
    date_reclamation DATE NOT NULL,
    type VARCHAR(100) NOT NULL COMMENT 'panne, dysfonctionnement, insatisfaction, autre',
    description TEXT NOT NULL,
    equipement_id INT NOT NULL,
    delai_souhaite DATE,
    contact_client VARCHAR(50),
    statut VARCHAR(30) NOT NULL DEFAULT 'en_attente' COMMENT 'en_attente, en_cours, traitee, annulee',
    priorite VARCHAR(20) DEFAULT 'moyenne' COMMENT 'basse, moyenne, haute, urgente',
    created_by INT NOT NULL,
    assigned_technicien_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_technicien_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);


CREATE TABLE reparations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reclamation_id INT NOT NULL,
    date_reparation DATE NOT NULL,
    technicien_id INT NOT NULL,
    duree_intervention INT COMMENT 'en minutes',
    actions TEXT NOT NULL,
    pieces_utilisees TEXT,
    cout_estime DECIMAL(10,2),
    statut VARCHAR(30) DEFAULT 'terminee' COMMENT 'en_cours, terminee, annulee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reclamation_id) REFERENCES reclamations(id) ON DELETE CASCADE,
    FOREIGN KEY (technicien_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT
);





-- (2 rôles seulement)
INSERT INTO roles (code, libelle) VALUES 
('admin', 'Administrateur'),
('technicien', 'Technicien');

-- 2(Admin + 4 Techniciens)
-- Admin (mot de passe: Admin@123)
INSERT INTO utilisateurs (nom, prenom, email, telephone, password_hash, role_id) VALUES
('Admin', 'Système', 'admin@sofima.tn', '700000000', 
 '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 
 1);

-- Techniciens
INSERT INTO utilisateurs (nom, prenom, email, telephone, password_hash, role_id) VALUES

('Ben Ali', 'Fatima', 'technicien3@sofima.tn', '701234567', 
 '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 
 3),  

('Trabelsi', 'Mohamed', 'technicien4@sofima.tn', '702345678', 
 '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 
 3),


('Gharbi', 'Ali', 'technicien1@sofima.tn', '703456789', 
 '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 
 3),

('Masmoudi', 'Samir', 'technicien2@sofima.tn', '704567890', 
 '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 
 3);



INSERT INTO equipements (nom, categorie, reference, atelier, ligne_production) VALUES
-- AIO1 - 3 équipements
('Presse hydraulique', 'Machines', 'PRS-HYD-001', 'AIO1', 'FPO'),
('Vérin pneumatique', 'Équipement', 'VER-PNE-001', 'AIO1', 'FPO'),
('Broyeur de matière première', 'Machines', 'BRY-MAT-001', 'AIO1', 'FPO'),

-- AIO2 - 3 équipements
('Machine à découper', 'Machines', 'DEC-TOL-001', 'AIO2', 'tôle'),
('Découpeuse laser', 'Machines', 'DEC-LAS-001', 'AIO2', 'tôle'),
('Plieuse automatique', 'Machines', 'PLS-AUT-001', 'AIO2', 'tôle'),

-- AIO3 - 3 équipements
('Assembleur automatique', 'Équipement', 'ASS-AUT-001', 'AIO3', 'montage'),
('Robot d''assemblage', 'Équipement', 'ROB-ASS-001', 'AIO3', 'montage'),
('Convoyeur intelligent', 'Équipement', 'CNV-INT-001', 'AIO3', 'montage'),

-- AIO4 - 3 équipements
('Filtre à air modèle X', 'Produit', 'FLT-AIR-X001', 'AIO4', 'FME'),
('Machine à filtrer FME-200', 'Produit', 'FLT-FME-200', 'AIO4', 'FME'),
('Testeur de pression', 'Équipement', 'TST-PRS-001', 'AIO4', 'FME'),

-- AIO5 - 3 équipements
('Système de contrôle qualité', 'Équipement', 'CTL-QLT-001', 'AIO5', 'contrôle'),
('Analyseur de particules', 'Équipement', 'ANL-PRT-001', 'AIO5', 'contrôle'),
('Balance précision', 'Équipement', 'BAL-PRC-001', 'AIO5', 'contrôle');

-- 4. Insérer les réclamations (6 réclamations initiales + 1 test)
INSERT INTO reclamations (numero, date_reclamation, type, description, equipement_id, delai_souhaite, contact_client, statut, priorite, created_by, assigned_technicien_id, notes) VALUES
-- Réclamation 1 - Créée par Admin, assignée à Technicien Gharbi (id: 3)
('RC-2024-01-0001', '2024-01-15', 'panne_technique', 'La presse hydraulique fuit de l''huile et fait un bruit anormal. Arrêt de la production.', 1, '2024-01-16', '712345678', 'en_cours', 'urgente', 1, 3, 'Client très insatisfait - Priorité maximale'),

-- Réclamation 2 - Créée par Technicien Ben Ali (id: 2), non assignée
('RC-2024-01-0002', '2024-01-16', 'dysfonctionnement', 'La découpeuse laser ne suit plus les coordonnées précises. Déviation de 2mm.', 4, '2024-01-17', '723456789', 'en_attente', 'haute', 3, NULL, 'À vérifier rapidement'),

-- Réclamation 3 - Créée par Admin, assignée à Technicien Masmoudi (id: 5)
('RC-2024-01-0003', '2024-01-10', 'panne_technique', 'Robot d''assemblage bloque au point 4 de la séquence. Redémarrage nécessaire toutes les heures.', 7, '2024-01-14', '734567890', 'en_cours', 'haute', 1, 5, 'Technicien sur place - Pièce en commande'),

-- Réclamation 4 - Créée par Admin, assignée à Technicien Gharbi (id: 3)
('RC-2024-01-0004', '2024-01-12', 'insatisfaction', 'Filtres produits avec des imperfections de surface. Client a retourné le lot.', 10, '2024-01-19', '745678901', 'traitee', 'moyenne', 1, 3, 'Problème réglé - Contrôle qualité renforcé'),

-- Réclamation 5 - Créée par Technicien Trabelsi (id: 3), assignée à Technicien Masmoudi (id: 5)
('RC-2024-01-0005', '2024-01-05', 'autre', 'Balance donne des mesures incohérentes. Calibration nécessaire.', 15, '2024-01-10', '756789012', 'traitee', 'moyenne', 3, 5, 'Calibration effectuée - Certificat fourni'),

-- Réclamation 6 - Créée par Admin, non assignée
('RC-2024-01-0006', '2024-01-17', 'insatisfaction', 'Retard de livraison d''une commande spéciale. Client mécontent.', 10, '2024-01-20', '778901234', 'en_attente', 'moyenne', 1, NULL, 'À contacter pour excuse'),

-- Réclamation 7 (celle créée avec le trigger)
('RC-2024-01-0007', '2024-01-18', 'panne_technique', 'Test du trigger automatique - équipement en panne', 2, NULL, NULL, 'en_attente', 'moyenne', 1, NULL, NULL);

-- 5. Insérer les réparations (2 réparations)
INSERT INTO reparations (reclamation_id, date_reparation, technicien_id, duree_intervention, actions, pieces_utilisees, cout_estime, statut) VALUES
-- Réparation 1 (pour réclamation 4) - faite par Technicien Gharbi (id: 3)
(4, '2024-01-13', 3, 180, 'Inspection des machines de production. Réglage des paramètres de pression. Nettoyage des buses.', 'Joint d''étanchéité x2', 450.00, 'terminee'),

-- Réparation 2 (pour réclamation 5) - faite par Technicien Masmoudi (id: 5)
(5, '2024-01-07', 5, 60, 'Calibration avec poids étalon. Réinitialisation du logiciel. Test avec échantillons connus.', NULL, 120.00, 'terminee');




-- ==================== TRIGGER POUR GÉNÉRATION AUTOMATIQUE DES NUMÉROS ====================
-- Note: Ce trigger génère automatiquement les numéros de réclamation
-- Format: RC-YYYY-MM-XXXX (ex: RC-2024-01-0008)

DELIMITER $$

CREATE TRIGGER before_reclamation_insert
BEFORE INSERT ON reclamations
FOR EACH ROW
BEGIN
    DECLARE next_num INT DEFAULT 1;
    DECLARE year_month VARCHAR(7);
    
    -- Si aucun numéro n'est fourni
    IF NEW.numero IS NULL THEN
        -- Obtenir l'année-mois (ex: 2024-01)
        SET year_month = DATE_FORMAT(NEW.date_reclamation, '%Y-%m');
        
        -- Trouver le prochain numéro pour ce mois
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero, 12) AS UNSIGNED)), 0) + 1
        INTO next_num
        FROM reclamations 
        WHERE numero LIKE CONCAT('RC-', year_month, '-%');
        
        -- Générer le nouveau numéro
        SET NEW.numero = CONCAT('RC-', year_month, '-', LPAD(next_num, 4, '0'));
    END IF;
END$$

DELIMITER ;
