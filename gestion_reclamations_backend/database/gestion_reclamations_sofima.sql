
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";



--
-- Base de données : `gestion_reclamations_sofima`
--

-- --------------------------------------------------------

--
-- Structure de la table `equipements`
--

CREATE TABLE `equipements` (
  `id` int(11) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `atelier` varchar(50) DEFAULT NULL COMMENT 'AIO1, AIO2, AIO3, AIO4, AIO5',
  `ligne_production` varchar(50) DEFAULT NULL COMMENT 'FPO, tôle, FME, montage, etc.',
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `equipements`
--

INSERT INTO `equipements` (`id`, `nom`, `categorie`, `reference`, `atelier`, `ligne_production`, `actif`, `created_at`, `updated_at`) VALUES
(1, 'Presse hydraulique', 'Machines', 'PRS-HYD-001', 'AIO1', 'FPO', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(2, 'Vérin pneumatique', 'Équipement', 'VER-PNE-001', 'AIO1', 'FPO', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(3, 'Broyeur de matière première', 'Machines', 'BRY-MAT-001', 'AIO1', 'FPO', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(4, 'Machine à découper', 'Machines', 'DEC-TOL-001', 'AIO2', 'tôle', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(5, 'Découpeuse laser', 'Machines', 'DEC-LAS-001', 'AIO2', 'tôle', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(6, 'Plieuse automatique', 'Machines', 'PLS-AUT-001', 'AIO2', 'tôle', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(7, 'Assembleur automatique', 'Équipement', 'ASS-AUT-001', 'AIO3', 'montage', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(8, 'Robot d\'assemblage', 'Équipement', 'ROB-ASS-001', 'AIO3', 'montage', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(9, 'Convoyeur intelligent', 'Équipement', 'CNV-INT-001', 'AIO3', 'montage', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(10, 'Filtre à air modèle X', 'Produit', 'FLT-AIR-X001', 'AIO4', 'FME', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(11, 'Machine à filtrer FME-200', 'Produit', 'FLT-FME-200', 'AIO4', 'FME', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(12, 'Testeur de pression', 'Équipement', 'TST-PRS-001', 'AIO4', 'FME', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(13, 'Système de contrôle qualité', 'Équipement', 'CTL-QLT-001', 'AIO5', 'contrôle', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(14, 'Analyseur de particules', 'Équipement', 'ANL-PRT-001', 'AIO5', 'contrôle', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(15, 'Balance précision', 'Équipement', 'BAL-PRC-001', 'AIO5', 'contrôle', 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(16, 'nnnn', 'Machines', '', 'AIO1', 'FPO', 0, '2026-01-24 14:20:34', '2026-01-24 14:21:05'),
(17, 'aaaaa', '', 'ghjjgbhj', '', '', 0, '2026-02-04 11:14:52', '2026-02-28 13:18:37');

-- --------------------------------------------------------

--
-- Structure de la table `reclamations`
--

CREATE TABLE `reclamations` (
  `id` int(11) NOT NULL,
  `numero` varchar(50) DEFAULT NULL COMMENT 'Format: RC-YYYY-MM-XXXX',
  `date_reclamation` date NOT NULL,
  `type` varchar(100) NOT NULL COMMENT 'panne, dysfonctionnement, insatisfaction, autre',
  `description` text NOT NULL,
  `equipement_id` int(11) NOT NULL,
  `delai_souhaite` date DEFAULT NULL,
  `contact_client` varchar(50) DEFAULT NULL,
  `statut` varchar(30) NOT NULL DEFAULT 'en_attente' COMMENT 'en_attente, en_cours, traitee, annulee',
  `priorite` varchar(20) DEFAULT 'moyenne' COMMENT 'basse, moyenne, haute, urgente',
  `created_by` int(11) NOT NULL,
  `assigned_technicien_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reclamations`
--

INSERT INTO `reclamations` (`id`, `numero`, `date_reclamation`, `type`, `description`, `equipement_id`, `delai_souhaite`, `contact_client`, `statut`, `priorite`, `created_by`, `assigned_technicien_id`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'RC-2024-01-0001', '2024-01-15', 'panne_technique', 'La presse hydraulique fuit de l\'huile et fait un bruit anormal. Arrêt de la production.', 1, '2024-01-16', '712345678', 'en_cours', 'urgente', 2, 4, 'Client très insatisfait - Priorité maximale', '2026-01-18 12:07:16', '2026-02-28 13:22:44'),
(2, 'RC-2024-01-0002', '2024-01-16', 'dysfonctionnement', 'La découpeuse laser ne suit plus les coordonnées précises. Déviation de 2mm.', 4, '2024-01-17', '723456781', 'en_attente', 'haute', 3, NULL, 'À vérifier rapidement', '2026-01-18 12:07:16', '2026-02-16 09:58:40'),
(3, 'RC-2024-01-0003', '2024-01-10', 'panne_technique', 'Robot d\'assemblage bloque au point 4 de la séquence. Redémarrage nécessaire toutes les heures.', 7, '2024-01-14', '734567890', 'en_cours', 'haute', 2, 5, 'Technicien sur place - Pièce en commande', '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(4, 'RC-2024-01-0004', '2024-01-12', 'insatisfaction', 'Filtres produits avec des imperfections de surface. Client a retourné le lot.', 10, '2024-01-19', '745678901', 'traitee', 'moyenne', 1, 4, 'Problème réglé - Contrôle qualité renforcé', '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(5, 'RC-2024-01-0005', '2024-01-05', 'autre', 'Balance donne des mesures incohérentes. Calibration nécessaire.', 15, '2024-01-10', '756789012', 'traitee', 'moyenne', 3, 5, 'Calibration effectuée - Certificat fourni', '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(6, 'RC-2024-01-0006', '2024-01-17', 'insatisfaction', 'Retard de livraison d\'une commande spéciale. Client mécontent.', 10, '2024-01-20', '778901234', 'en_attente', 'moyenne', 1, NULL, 'À contacter pour excuse', '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(7, 'RC-2024-01-0007', '2024-01-18', 'panne_technique', 'Test du trigger automatique - équipement en panne', 2, NULL, NULL, 'en_attente', 'moyenne', 2, NULL, NULL, '2026-01-18 12:18:31', '2026-01-18 12:18:31'),
(12, 'RC-2026-01-0001', '2026-01-16', 'panne_technique', 'kkkk', 10, '0000-00-00', '', 'annulee', 'moyenne', 1, 2, 'jj', '2026-02-12 21:57:36', '2026-02-12 21:57:56'),
(13, 'RC-2026-02-0001', '2026-02-28', 'panne_technique', 'lllllllllllllllllllllllllllllllllllll', 7, '2026-02-19', '134567890', 'en_attente', 'moyenne', 1, 5, 'jjjjjjjjjjjjjjjjjjjj', '2026-02-28 20:25:51', '2026-02-28 20:25:51');

--
-- Déclencheurs `reclamations`
--
DELIMITER $$
CREATE TRIGGER `before_reclamation_insert` BEFORE INSERT ON `reclamations` FOR EACH ROW SET NEW.numero = CONCAT('RC-', DATE_FORMAT(NEW.date_reclamation, '%Y-%m'), '-', 
  LPAD(
    (SELECT COALESCE(MAX(CAST(SUBSTRING(numero, 12) AS UNSIGNED)), 0) + 1
     FROM reclamations 
     WHERE numero LIKE CONCAT('RC-', DATE_FORMAT(NEW.date_reclamation, '%Y-%m'), '-%')
    ), 
    4, 
    '0'
  )
)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `reparations`
--

CREATE TABLE `reparations` (
  `id` int(11) NOT NULL,
  `reclamation_id` int(11) NOT NULL,
  `date_reparation` date NOT NULL,
  `technicien_id` int(11) NOT NULL,
  `duree_intervention` int(11) DEFAULT NULL COMMENT 'en minutes',
  `actions` text NOT NULL,
  `pieces_utilisees` text DEFAULT NULL,
  `cout_estime` decimal(10,2) DEFAULT NULL,
  `statut` varchar(30) DEFAULT 'terminee' COMMENT 'en_cours, terminee, annulee',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reparations`
--

INSERT INTO `reparations` (`id`, `reclamation_id`, `date_reparation`, `technicien_id`, `duree_intervention`, `actions`, `pieces_utilisees`, `cout_estime`, `statut`, `created_at`) VALUES
(1, 4, '2024-01-13', 4, 180, 'Inspection des machines de production. Réglage des paramètres de pression. Nettoyage des buses.', 'Joint d\'étanchéité x2', 450.00, 'terminee', '2026-01-18 12:07:16'),
(2, 5, '2024-01-07', 5, 60, 'Calibration avec poids étalon. Réinitialisation du logiciel. Test avec échantillons connus.', NULL, 120.00, 'terminee', '2026-01-18 12:07:16');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `libelle` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `code`, `libelle`, `created_at`) VALUES
(1, 'admin', 'Administrateur', '2026-01-18 12:07:16'),
(3, 'technicien', 'Technicien', '2026-01-18 12:07:16');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `telephone`, `password_hash`, `role_id`, `actif`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Système', 'admin@sofima.tn', '700000000', '$2y$10$M.1mITjwCqUWZwhuMMxcd.IDrmwWsariIGVAgI5A9NRRXmWkLBJMK', 1, 1, '2026-01-18 12:07:16', '2026-02-06 18:20:49'),
(2, 'Ben Ali', 'Fatima', 'technicien3@sofima.tn', '701234567', '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 3, 1, '2026-01-18 12:07:16', '2026-02-04 17:05:24'),
(3, 'Trabelsi', 'Mohamed', 'technicien4@sofima.tn', '702345678', '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 3, 1, '2026-01-18 12:07:16', '2026-02-04 17:06:40'),
(4, 'Gharbi', 'Ali', 'technicien1@sofima.tn', '703456789', '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 3, 1, '2026-01-18 12:07:16', '2026-02-28 15:04:55'),
(5, 'Masmoudi', 'Samir', 'technicien2@sofima.tn', '704567890', '$2y$10$PrrC6DLp2/Kr01c0OXCXYexCyuHF1u/9rNzb5aOJ8Uvo0xCe27Qwq', 3, 1, '2026-01-18 12:07:16', '2026-01-18 12:07:16'),
(6, 'Homri', 'Ameni', 'homriameni525@gmail.com', '56843324', '$2y$10$vvjP1Q1rpNLCDhZitvRVFOuvBm9chPoU.WRncJKQioslcWIxZDm6O', 1, 1, '2026-02-28 14:26:26', '2026-02-28 14:33:41');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `equipements`
--
ALTER TABLE `equipements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`);

--
-- Index pour la table `reclamations`
--
ALTER TABLE `reclamations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `equipement_id` (`equipement_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `assigned_technicien_id` (`assigned_technicien_id`);

--
-- Index pour la table `reparations`
--
ALTER TABLE `reparations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reclamation_id` (`reclamation_id`),
  ADD KEY `technicien_id` (`technicien_id`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `equipements`
--
ALTER TABLE `equipements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `reclamations`
--
ALTER TABLE `reclamations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `reparations`
--
ALTER TABLE `reparations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `reclamations`
--
ALTER TABLE `reclamations`
  ADD CONSTRAINT `reclamations_ibfk_1` FOREIGN KEY (`equipement_id`) REFERENCES `equipements` (`id`),
  ADD CONSTRAINT `reclamations_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `utilisateurs` (`id`),
  ADD CONSTRAINT `reclamations_ibfk_3` FOREIGN KEY (`assigned_technicien_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `reparations`
--
ALTER TABLE `reparations`
  ADD CONSTRAINT `reparations_ibfk_1` FOREIGN KEY (`reclamation_id`) REFERENCES `reclamations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reparations_ibfk_2` FOREIGN KEY (`technicien_id`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

