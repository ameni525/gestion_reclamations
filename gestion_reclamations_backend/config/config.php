<?php
return [
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'gestion_reclamations_sofima',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4'
    ],
    'security' => [
        'token_secret' => 'sofima_gestion_reclamations_secret_key_2025_change_this',
        'token_exp_minutes' => 480, // (8 h)
        'password_min_length' => 8
    ],
    'app' => [
        'name' => 'SOFIMA Gestion Réclamations',
        'version' => '1.0.0',
        'base_url' => 'http://localhost/gestion_reclamations_backend',
        'cors_allowed_origins' => ['http://localhost:4200']
    ],
    'reclamations' => [
        'statuts' => ['en_attente', 'en_cours', 'traitee', 'annulee'],
        'priorites' => ['basse', 'moyenne', 'haute', 'urgente'],
        'types' => ['panne_technique', 'dysfonctionnement', 'insatisfaction', 'autre']
    ]
];