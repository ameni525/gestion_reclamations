-- ============================================================
-- Script de nettoyage - gestion_reclamations_sofima
-- À exécuter dans phpMyAdmin (onglet SQL) sur la base existante.
-- Relis chaque bloc avant d'exécuter si tu veux garder certaines données de test.
-- ============================================================

-- 1) Corriger la date invalide '0000-00-00' (MySQL en mode strict la rejette)
UPDATE reclamations
SET delai_souhaite = NULL
WHERE delai_souhaite = '0000-00-00';

-- 2) Supprimer les équipements de test manifestement factices
--    (nom "nnnn" / "aaaaa", déjà désactivés avec actif = 0)
DELETE FROM equipements WHERE id IN (16, 17);

-- 3) Supprimer la réclamation de test factice ("kkkk")
--    -> décommente si tu veux la retirer (elle est déjà annulée, donc sans impact visible)
-- DELETE FROM reclamations WHERE id = 12;

-- 4) Vérification : lister les réclamations dont l'équipement lié n'existe plus
--    (à faire AVANT de supprimer des équipements, pour éviter une erreur de clé étrangère)
SELECT r.id, r.numero, r.equipement_id
FROM reclamations r
LEFT JOIN equipements e ON r.equipement_id = e.id
WHERE e.id IS NULL;
