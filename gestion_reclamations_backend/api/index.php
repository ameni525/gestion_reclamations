<?php

// ==================== ENVIRONNEMENT ====================
// En développement local, les erreurs PHP peuvent s'afficher à l'écran.
// En production (tout autre hôte), on les cache et on les journalise à la place,
// pour éviter de divulguer des détails techniques (chemins, requêtes SQL...) aux utilisateurs.
$isLocalDev = in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1']);
define('APP_DEBUG', $isLocalDev);

error_reporting(E_ALL);
ini_set('display_errors', APP_DEBUG ? 1 : 0);
ini_set('log_errors', 1);
if (!is_dir(dirname(__DIR__) . '/logs')) {
    @mkdir(dirname(__DIR__) . '/logs', 0755, true);
}
ini_set('error_log', dirname(__DIR__) . '/logs/php_errors.log');

// ==================== CORS ====================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:4200', 'http://localhost'];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header('Content-Type: application/json; charset=utf-8');

// Préflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==================== CONFIGURATION ====================
date_default_timezone_set('Africa/Tunis');
define('BASE_PATH', dirname(__DIR__));

// ==================== AUTOLOADER ====================
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = BASE_PATH . '/app/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// ==================== CHARGE LA CONFIG ====================
$config = require BASE_PATH . '/config/config.php';

// ==================== TOKEN SIGNÉ (HMAC-SHA256) ====================
// IMPORTANT : un simple base64_encode(json_encode(...)) N'EST PAS une protection :
// base64 se décode et se ré-encode librement, donc n'importe qui pourrait fabriquer
// un token avec "role":"admin". On utilise donc App\Models\TokenService, qui signe
// chaque token avec une clé secrète connue seulement du serveur
// (config/config.php -> security.token_secret) et vérifie cette signature
// à chaque requête avant de faire confiance au contenu du token.
function generateToken($payload) {
    $tokenService = new \App\Models\TokenService();
    return $tokenService->generate($payload);
}

function verifyToken($token) {
    $tokenService = new \App\Models\TokenService();
    return $tokenService->verify($token);
}

// ==================== FONCTIONS UTILITAIRES ====================
function requireAuth($roles = []) {
    global $pdo;
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token manquant']);
        exit();
    }
    
    $token = substr($authHeader, 7);
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token invalide ou expiré']);
        exit();
    }

    // Vérifier que l'utilisateur existe encore et que son compte est actif
    $stmt = $pdo->prepare("
        SELECT u.id, u.email, u.nom, u.prenom, u.actif, r.code as role_code
        FROM utilisateurs u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
    ");
    $stmt->execute([$tokenData['id'] ?? 0]);
    $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentUser || (int)$currentUser['actif'] !== 1) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Compte inactif ou supprimé']);
        exit();
    }

    if (!empty($roles) && !in_array($currentUser['role_code'], $roles)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Accès non autorisé pour ce rôle']);
        exit();
    }

    return [
        'id' => (int)$currentUser['id'],
        'email' => $currentUser['email'],
        'role' => $currentUser['role_code'],
        'nom' => $currentUser['nom'],
        'prenom' => $currentUser['prenom'],
        'exp' => $tokenData['exp']
    ];
}

function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'JSON invalide']);
        exit();
    }
    return $input;
}

function jsonResponse($success, $data = null, $message = null, $status = 200) {
    $response = [
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if (!$success) {
        $response['error'] = $data;
        unset($response['data']);
    }
    
    http_response_code($status);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// ==================== CONNEXION BD ====================
try {
    $db = $config['db'];
    $pdo = new PDO(
        "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']};charset={$db['charset']}",
        $db['user'],
        $db['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    error_log('Erreur connexion BD: ' . $e->getMessage());
    jsonResponse(false, APP_DEBUG ? ('Erreur base de données: ' . $e->getMessage()) : 'Erreur de connexion au serveur. Réessayez plus tard.', null, 500);
}

// ==================== ROUTEUR ====================
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Extraire le chemin
$base_path = '/gestion_reclamations_backend/api';
if (strpos($request_uri, $base_path) === 0) {
    $path = substr($request_uri, strlen($base_path));
} else {
    $path = $request_uri;
}

$path = parse_url($path, PHP_URL_PATH);
$path = trim($path, '/');
$segments = explode('/', $path);

try {
    // ==================== ROUTE RACINE ====================
    if ($path === '' || $path === '/') {
        jsonResponse(true, [
            'app' => 'SOFIMA Gestion Réclamations',
            'version' => '1.0.0',
            'status' => 'online',
            'timestamp' => date('Y-m-d H:i:s'),
            'endpoints' => [
                'GET /' => 'Cette page',
                'POST /auth/login' => 'Connexion',
                'GET /auth/me' => 'Info utilisateur',
                'GET /equipements' => 'Liste équipements',
                'POST /equipements' => 'Créer équipement',
                'GET /equipements/:id' => 'Voir équipement',
                'PUT /equipements/:id' => 'Modifier équipement',
                'DELETE /equipements/:id' => 'Supprimer équipement',
                'GET /reclamations' => 'Liste réclamations',
                'POST /reclamations' => 'Créer réclamation',
                'GET /reclamations/:id' => 'Voir réclamation',
                'PUT /reclamations/:id' => 'Modifier réclamation',
                'DELETE /reclamations/:id' => 'Supprimer réclamation',
                'GET /reparations' => 'Liste réparations',
                'POST /reparations' => 'Créer réparation',
                'GET /utilisateurs' => 'Liste utilisateurs',
                'POST /utilisateurs' => 'Créer utilisateur',
                'GET /utilisateurs/:id' => 'Voir utilisateur',
                'PUT /utilisateurs/:id' => 'Modifier utilisateur',
                'DELETE /utilisateurs/:id' => 'Désactiver utilisateur',
                'GET /utilisateurs/roles' => 'Liste des rôles'
            ]
        ]);
    }

    // ==================== AUTHENTIFICATION ====================
    if ($path === 'auth/login' && $method === 'POST') {
        $input = getJsonInput();
        
        if (!isset($input['email']) || !isset($input['password'])) {
            jsonResponse(false, 'Email et mot de passe requis', null, 400);
        }
        
        $stmt = $pdo->prepare("
            SELECT u.*, r.code as role_code, r.libelle as role_libelle 
            FROM utilisateurs u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.email = ? AND u.actif = 1
        ");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $inactiveStmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = ? AND actif = 0");
            $inactiveStmt->execute([$input['email']]);
            if ($inactiveStmt->fetch(PDO::FETCH_ASSOC)) {
                jsonResponse(false, 'Ce compte est desactive. Contactez un administrateur.', null, 401);
            }
            jsonResponse(false, 'Email ou mot de passe incorrect', null, 401);
        }

        if (!password_verify($input['password'], $user['password_hash'])) {
            jsonResponse(false, 'Email ou mot de passe incorrect', null, 401);
        }
        
        $tokenData = [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role_code'],
            'nom' => $user['nom'],
            'prenom' => $user['prenom'],
            'exp' => time() + ($config['security']['token_exp_minutes'] * 60)
        ];
        $token = generateToken($tokenData);
        
        jsonResponse(true, [
            'token' => $token,
            'user' => [
                'id' => (int)$user['id'],
                'nom' => $user['nom'],
                'prenom' => $user['prenom'],
                'email' => $user['email'],
                'telephone' => $user['telephone'] ?? '',
                'role' => $user['role_code'],
                'role_libelle' => $user['role_libelle']
            ]
        ]);
    }
    
    if ($path === 'auth/me' && $method === 'GET') {
        $user = requireAuth();
        
        $stmt = $pdo->prepare("
            SELECT u.*, r.code as role_code, r.libelle as role_libelle 
            FROM utilisateurs u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = ? AND u.actif = 1
        ");
        $stmt->execute([$user['id']]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$userData) {
            jsonResponse(false, 'Utilisateur non trouvé', null, 404);
        }
        
        jsonResponse(true, [
            'id' => (int)$userData['id'],
            'nom' => $userData['nom'],
            'prenom' => $userData['prenom'],
            'email' => $userData['email'],
            'telephone' => $userData['telephone'] ?? '',
            'role' => $userData['role_code'],
            'role_libelle' => $userData['role_libelle'],
            'actif' => (bool)$userData['actif']
        ]);
    }
    
    if ($path === 'auth/change-password' && $method === 'POST') {
        $user = requireAuth();
        $input = getJsonInput();

        if (empty($input['current_password']) || empty($input['new_password'])) {
            jsonResponse(false, 'Mot de passe actuel et nouveau mot de passe requis', null, 400);
        }

        if (strlen($input['new_password']) < 8) {
            jsonResponse(false, 'Le nouveau mot de passe doit contenir au moins 8 caractères', null, 400);
        }

        $stmt = $pdo->prepare("SELECT password_hash FROM utilisateurs WHERE id = ?");
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row || !password_verify($input['current_password'], $row['password_hash'])) {
            jsonResponse(false, 'Mot de passe actuel incorrect', null, 400);
        }

        $newHash = password_hash($input['new_password'], PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("UPDATE utilisateurs SET password_hash = ? WHERE id = ?");
        $stmt->execute([$newHash, $user['id']]);

        jsonResponse(true, null, 'Mot de passe modifié avec succès');
    }

    // ==================== ÉQUIPEMENTS ====================
    if ($path === 'equipements' && $method === 'GET') {
        $user = requireAuth(['admin', 'technicien']);
        
        $sql = "SELECT * FROM equipements WHERE 1=1";
        $params = [];
        
        if (isset($_GET['atelier'])) {
            $sql .= " AND atelier = ?";
            $params[] = $_GET['atelier'];
        }
        
        if (isset($_GET['ligne_production'])) {
            $sql .= " AND ligne_production = ?";
            $params[] = $_GET['ligne_production'];
        }
        
        if (isset($_GET['actif'])) {
            $sql .= " AND actif = ?";
            $params[] = (int)$_GET['actif'];
        }
        
        if (isset($_GET['search'])) {
            $sql .= " AND (nom LIKE ? OR reference LIKE ? OR categorie LIKE ?)";
            $searchTerm = "%{$_GET['search']}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY nom";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $equipements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(true, $equipements);
    }
    
    if ($path === 'equipements' && $method === 'POST') {
        $user = requireAuth(['admin']); // SEUL ADMIN PEUT CRÉER
        $input = getJsonInput();
        
        if (!isset($input['nom']) || empty($input['nom'])) {
            jsonResponse(false, 'Le nom est requis', null, 400);
        }
        
        // Vérifier référence unique
        if (isset($input['reference']) && !empty($input['reference'])) {
            $stmt = $pdo->prepare("SELECT id FROM equipements WHERE reference = ?");
            $stmt->execute([$input['reference']]);
            if ($stmt->fetch()) {
                jsonResponse(false, 'Cette référence existe déjà', null, 400);
            }
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO equipements (nom, categorie, reference, atelier, ligne_production, actif)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['nom'],
            $input['categorie'] ?? null,
            $input['reference'] ?? null,
            $input['atelier'] ?? null,
            $input['ligne_production'] ?? null,
            $input['actif'] ?? 1
        ]);
        
        $id = $pdo->lastInsertId();
        jsonResponse(true, ['id' => $id], 'Équipement créé avec succès', 201);
    }
    
    if (count($segments) === 2 && $segments[0] === 'equipements' && is_numeric($segments[1])) {
        $id = (int)$segments[1];
        
        if ($method === 'GET') {
            $user = requireAuth(['admin', 'technicien']);
            
            $stmt = $pdo->prepare("SELECT * FROM equipements WHERE id = ?");
            $stmt->execute([$id]);
            $equipement = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$equipement) {
                jsonResponse(false, 'Équipement non trouvé', null, 404);
            }
            
            jsonResponse(true, $equipement);
        }
        
        if ($method === 'PUT') {
            $user = requireAuth(['admin']); // SEUL ADMIN PEUT MODIFIER
            $input = getJsonInput();
            
            $stmt = $pdo->prepare("SELECT * FROM equipements WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                jsonResponse(false, 'Équipement non trouvé', null, 404);
            }
            
            // Mise à jour
            $fields = [];
            $params = [];
            $allowed = ['nom', 'categorie', 'reference', 'atelier', 'ligne_production', 'actif'];
            
            foreach ($allowed as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                jsonResponse(false, 'Aucune donnée à mettre à jour', null, 400);
            }
            
            $params[] = $id;
            $sql = "UPDATE equipements SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute($params);
            
            if ($success) {
                jsonResponse(true, null, 'Équipement mis à jour avec succès');
            } else {
                jsonResponse(false, 'Erreur lors de la mise à jour', null, 500);
            }
        }
        
        if ($method === 'DELETE') {
            $user = requireAuth(['admin']);
            
            $stmt = $pdo->prepare("UPDATE equipements SET actif = 0 WHERE id = ?");
            $success = $stmt->execute([$id]);
            
            if ($success) {
                jsonResponse(true, null, 'Équipement désactivé avec succès');
            } else {
                jsonResponse(false, 'Erreur lors de la désactivation', null, 500);
            }
        }
    }
    
    // ==================== RÉCLAMATIONS ====================
    if ($path === 'reclamations' && $method === 'GET') {
        $user = requireAuth(['admin', 'technicien']);
        
        $sql = "
            SELECT r.*, 
                   e.nom as equipement_nom,
                   CONCAT(u.nom, ' ', u.prenom) as createur_nom
            FROM reclamations r
            LEFT JOIN equipements e ON r.equipement_id = e.id
            LEFT JOIN utilisateurs u ON r.created_by = u.id
            WHERE 1=1
        ";
        $params = [];
        
        if (isset($_GET['statut'])) {
            $sql .= " AND r.statut = ?";
            $params[] = $_GET['statut'];
        }
        
        if (isset($_GET['priorite'])) {
            $sql .= " AND r.priorite = ?";
            $params[] = $_GET['priorite'];
        }
        
        if (isset($_GET['type'])) {
            $sql .= " AND r.type = ?";
            $params[] = $_GET['type'];
        }
        
        if (isset($_GET['search'])) {
            $sql .= " AND (r.numero LIKE ? OR r.description LIKE ? OR e.nom LIKE ?)";
            $searchTerm = "%{$_GET['search']}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        // Filtre technicien
        if ($user['role'] === 'technicien') {
            $sql .= " AND (r.assigned_technicien_id = ? OR r.assigned_technicien_id IS NULL)";
            $params[] = $user['id'];
        } elseif (isset($_GET['technicien_id'])) {
            $sql .= " AND r.assigned_technicien_id = ?";
            $params[] = $_GET['technicien_id'];
        }
        
        $sql .= " ORDER BY 
            CASE r.priorite 
                WHEN 'urgente' THEN 1
                WHEN 'haute' THEN 2
                WHEN 'moyenne' THEN 3
                WHEN 'basse' THEN 4
                ELSE 5
            END,
            r.date_reclamation DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $reclamations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(true, $reclamations);
    }
    
    if ($path === 'reclamations' && $method === 'POST') {
        $user = requireAuth(['admin']); // SEUL ADMIN PEUT CRÉER RÉCLAMATION
        $input = getJsonInput();
        
        // Validation
        $required = ['date_reclamation', 'type', 'description', 'equipement_id'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                jsonResponse(false, "Le champ '$field' est requis", null, 400);
            }
        }
        
        // Vérifier équipement
        $stmt = $pdo->prepare("SELECT id FROM equipements WHERE id = ? AND actif = 1");
        $stmt->execute([$input['equipement_id']]);
        if (!$stmt->fetch()) {
            jsonResponse(false, 'Équipement non trouvé ou inactif', null, 400);
        }
        
        // Création
        $stmt = $pdo->prepare("
            INSERT INTO reclamations (date_reclamation, type, description, equipement_id, 
                                    delai_souhaite, contact_client, statut, priorite, 
                                    created_by, assigned_technicien_id, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['date_reclamation'],
            $input['type'],
            $input['description'],
            $input['equipement_id'],
            $input['delai_souhaite'] ?? null,
            $input['contact_client'] ?? null,
            $input['statut'] ?? 'en_attente',
            $input['priorite'] ?? 'moyenne',
            $user['id'],
            $input['assigned_technicien_id'] ?? null,
            $input['notes'] ?? null
        ]);
        
        $id = $pdo->lastInsertId();
        
        // Récupérer le numéro généré
        $stmt = $pdo->prepare("SELECT numero FROM reclamations WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        
        jsonResponse(true, ['id' => $id, 'numero' => $result['numero']], 'Réclamation créée avec succès', 201);
    }
    
    if (count($segments) === 2 && $segments[0] === 'reclamations' && is_numeric($segments[1])) {
        $id = (int)$segments[1];
        
        if ($method === 'GET') {
            $user = requireAuth(['admin', 'technicien']);
            
            $stmt = $pdo->prepare("
                SELECT r.*, e.nom as equipement_nom, e.reference as equipement_reference
                FROM reclamations r
                LEFT JOIN equipements e ON r.equipement_id = e.id
                WHERE r.id = ?
            ");
            $stmt->execute([$id]);
            $reclamation = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$reclamation) {
                jsonResponse(false, 'Réclamation non trouvée', null, 404);
            }
            
            // Vérifier accès technicien
            if ($user['role'] === 'technicien' && 
                $reclamation['assigned_technicien_id'] != $user['id'] &&
                $reclamation['assigned_technicien_id'] !== null) {
                jsonResponse(false, 'Accès non autorisé à cette réclamation', null, 403);
            }
            
            jsonResponse(true, $reclamation);
        }
        
        if ($method === 'PUT') {
            $user = requireAuth(['admin']); // SEUL ADMIN PEUT MODIFIER RÉCLAMATION
            $input = getJsonInput();
            
            $stmt = $pdo->prepare("SELECT * FROM reclamations WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                jsonResponse(false, 'Réclamation non trouvée', null, 404);
            }
            
            // Mise à jour
            $fields = [];
            $params = [];
            $allowed = ['type', 'description', 'equipement_id', 'delai_souhaite', 
                       'contact_client', 'statut', 'priorite', 'assigned_technicien_id', 'notes'];
            
            foreach ($allowed as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                jsonResponse(false, 'Aucune donnée à mettre à jour', null, 400);
            }
            
            $params[] = $id;
            $sql = "UPDATE reclamations SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute($params);
            
            if ($success) {
                jsonResponse(true, null, 'Réclamation mise à jour avec succès');
            } else {
                jsonResponse(false, 'Erreur lors de la mise à jour', null, 500);
            }
        }
        
        if ($method === 'DELETE') {
            $user = requireAuth(['admin']);
            
            $stmt = $pdo->prepare("UPDATE reclamations SET statut = 'annulee' WHERE id = ?");
            $success = $stmt->execute([$id]);
            
            if ($success) {
                jsonResponse(true, null, 'Réclamation annulée avec succès');
            } else {
                jsonResponse(false, 'Erreur lors de l\'annulation', null, 500);
            }
        }
    }
    
    // ==================== RÉPARATIONS ====================
    if ($path === 'reparations' && $method === 'GET') {
        $user = requireAuth(['admin', 'technicien']);
        
        $sql = "
            SELECT rep.*, r.numero as reclamation_numero, e.nom as equipement_nom
            FROM reparations rep
            JOIN reclamations r ON rep.reclamation_id = r.id
            JOIN equipements e ON r.equipement_id = e.id
            WHERE 1=1
        ";
        $params = [];
        
        if (isset($_GET['reclamation_id'])) {
            $sql .= " AND rep.reclamation_id = ?";
            $params[] = $_GET['reclamation_id'];
        }
        
        if ($user['role'] === 'technicien') {
            $sql .= " AND rep.technicien_id = ?";
            $params[] = $user['id'];
        } elseif (isset($_GET['technicien_id'])) {
            $sql .= " AND rep.technicien_id = ?";
            $params[] = $_GET['technicien_id'];
        }
        
        $sql .= " ORDER BY rep.date_reparation DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $reparations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(true, $reparations);
    }
    
    if ($path === 'reparations' && $method === 'POST') {
        $user = requireAuth(['admin', 'technicien']);
        $input = getJsonInput();
        
        // Validation
        $required = ['reclamation_id', 'date_reparation', 'actions'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                jsonResponse(false, "Le champ '$field' est requis", null, 400);
            }
        }
        
        // Vérifier réclamation
        $stmt = $pdo->prepare("SELECT id FROM reclamations WHERE id = ?");
        $stmt->execute([$input['reclamation_id']]);
        if (!$stmt->fetch()) {
            jsonResponse(false, 'Réclamation non trouvée', null, 400);
        }
        
        // Déterminer technicien
        $technicienId = $input['technicien_id'] ?? $user['id'];
        
        // Vérifier si technicien existe
        if (isset($input['technicien_id'])) {
            $stmt = $pdo->prepare("
                SELECT u.id, r.code as role_code 
                FROM utilisateurs u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = ? AND r.code = 'technicien'
            ");
            $stmt->execute([$input['technicien_id']]);
            if (!$stmt->fetch()) {
                jsonResponse(false, 'Utilisateur n\'est pas un technicien', null, 400);
            }
        }
        
        // Création
        $stmt = $pdo->prepare("
            INSERT INTO reparations (reclamation_id, date_reparation, technicien_id, 
                                    duree_intervention, actions, pieces_utilisees, 
                                    cout_estime, statut)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['reclamation_id'],
            $input['date_reparation'],
            $technicienId,
            $input['duree_intervention'] ?? null,
            $input['actions'],
            $input['pieces_utilisees'] ?? null,
            $input['cout_estime'] ?? null,
            $input['statut'] ?? 'terminee'
        ]);
        
        // Mettre à jour le statut de la réclamation
        if (($input['statut'] ?? 'terminee') === 'terminee') {
            $stmt = $pdo->prepare("UPDATE reclamations SET statut = 'traitee' WHERE id = ?");
            $stmt->execute([$input['reclamation_id']]);
        }
        
        $id = $pdo->lastInsertId();
        jsonResponse(true, ['id' => $id], 'Réparation créée avec succès', 201);
    }
    
    // ==================== UTILISATEURS ====================
    if ($path === 'utilisateurs' && $method === 'GET') {
        $user = requireAuth(['admin']); // SEUL ADMIN PEUT VOIR UTILISATEURS
        
        $sql = "
            SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.actif,
                   r.code as role_code, r.libelle as role_libelle
            FROM utilisateurs u
            JOIN roles r ON u.role_id = r.id
            WHERE 1=1
        ";
        $params = [];
        
        if (isset($_GET['role'])) {
            $sql .= " AND r.code = ?";
            $params[] = $_GET['role'];
        }
        
        if (isset($_GET['actif'])) {
            $sql .= " AND u.actif = ?";
            $params[] = (int)$_GET['actif'];
        }
        
        if (isset($_GET['search'])) {
            $sql .= " AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)";
            $searchTerm = "%{$_GET['search']}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $sql .= " ORDER BY u.nom, u.prenom";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $utilisateurs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(true, $utilisateurs);
    }

    if ($path === 'utilisateurs' && $method === 'POST') {
        $user = requireAuth(['admin']);
        $input = getJsonInput();

        $required = ['nom', 'prenom', 'email', 'password', 'role_id'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || trim((string)$input[$field]) === '') {
                jsonResponse(false, "Le champ '$field' est requis", null, 400);
            }
        }

        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            jsonResponse(false, 'Email invalide', null, 400);
        }

        if (strlen($input['password']) < 8) {
            jsonResponse(false, 'Le mot de passe doit contenir au moins 8 caractères', null, 400);
        }

        $stmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = ?");
        $stmt->execute([$input['email']]);
        if ($stmt->fetch(PDO::FETCH_ASSOC)) {
            jsonResponse(false, 'Cet email est déjà utilisé', null, 400);
        }

        $roleStmt = $pdo->prepare("SELECT id FROM roles WHERE id = ?");
        $roleStmt->execute([(int)$input['role_id']]);
        if (!$roleStmt->fetch(PDO::FETCH_ASSOC)) {
            jsonResponse(false, 'Rôle invalide', null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO utilisateurs (nom, prenom, email, telephone, password_hash, role_id, actif)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            trim($input['nom']),
            trim($input['prenom']),
            trim($input['email']),
            $input['telephone'] ?? null,
            password_hash($input['password'], PASSWORD_BCRYPT),
            (int)$input['role_id'],
            isset($input['actif']) ? (int)((bool)$input['actif']) : 1
        ]);

        jsonResponse(true, ['id' => (int)$pdo->lastInsertId()], 'Utilisateur créé avec succès', 201);
    }

    if ($path === 'utilisateurs/roles' && $method === 'GET') {
        $user = requireAuth(['admin']);
        $stmt = $pdo->query("SELECT id, code, libelle FROM roles ORDER BY id");
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, $roles);
    }
    
    if ($path === 'utilisateurs/techniciens' && $method === 'GET') {
        $user = requireAuth(['admin']); // SEUL ADMIN PEUT VOIR TECHNICIENS
        
        $stmt = $pdo->prepare("
            SELECT u.id, u.nom, u.prenom, u.email, u.telephone
            FROM utilisateurs u
            JOIN roles r ON u.role_id = r.id
            WHERE r.code = 'technicien' AND u.actif = 1
            ORDER BY u.nom, u.prenom
        ");
        $stmt->execute();
        $techniciens = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(true, $techniciens);
    }

    if (count($segments) === 2 && $segments[0] === 'utilisateurs' && is_numeric($segments[1])) {
        $id = (int)$segments[1];

        if ($method === 'GET') {
            $user = requireAuth(['admin']);

            $stmt = $pdo->prepare("
                SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.actif, u.created_at, u.updated_at,
                       r.code as role_code, r.libelle as role_libelle
                FROM utilisateurs u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?
            ");
            $stmt->execute([$id]);
            $utilisateur = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$utilisateur) {
                jsonResponse(false, 'Utilisateur non trouvé', null, 404);
            }

            jsonResponse(true, $utilisateur);
        }

        if ($method === 'PUT') {
            $currentUser = requireAuth(['admin']);
            $input = getJsonInput();

            $stmt = $pdo->prepare("SELECT id, email FROM utilisateurs WHERE id = ?");
            $stmt->execute([$id]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$existing) {
                jsonResponse(false, 'Utilisateur non trouvé', null, 404);
            }

            if (isset($input['email'])) {
                if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                    jsonResponse(false, 'Email invalide', null, 400);
                }
                $check = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = ? AND id <> ?");
                $check->execute([$input['email'], $id]);
                if ($check->fetch(PDO::FETCH_ASSOC)) {
                    jsonResponse(false, 'Cet email est déjà utilisé', null, 400);
                }
            }

            if (isset($input['role_id'])) {
                $roleStmt = $pdo->prepare("SELECT id FROM roles WHERE id = ?");
                $roleStmt->execute([(int)$input['role_id']]);
                if (!$roleStmt->fetch(PDO::FETCH_ASSOC)) {
                    jsonResponse(false, 'Rôle invalide', null, 400);
                }
            }

            if (isset($input['password']) && trim((string)$input['password']) !== '' && strlen($input['password']) < 8) {
                jsonResponse(false, 'Le mot de passe doit contenir au moins 8 caractères', null, 400);
            }

            $fields = [];
            $params = [];
            $allowed = ['nom', 'prenom', 'email', 'telephone', 'role_id', 'actif'];
            foreach ($allowed as $field) {
                if (array_key_exists($field, $input)) {
                    $fields[] = "$field = ?";
                    if ($field === 'actif') {
                        $params[] = (int)((bool)$input[$field]);
                    } elseif ($field === 'role_id') {
                        $params[] = (int)$input[$field];
                    } else {
                        $params[] = $input[$field];
                    }
                }
            }

            if (isset($input['password']) && trim((string)$input['password']) !== '') {
                $fields[] = "password_hash = ?";
                $params[] = password_hash($input['password'], PASSWORD_BCRYPT);
            }

            if (empty($fields)) {
                jsonResponse(false, 'Aucune donnée à mettre à jour', null, 400);
            }

            // Protéger contre la désactivation de son propre compte
            if ($currentUser['id'] === $id && isset($input['actif']) && (int)((bool)$input['actif']) === 0) {
                jsonResponse(false, 'Vous ne pouvez pas désactiver votre propre compte', null, 400);
            }

            $params[] = $id;
            $sql = "UPDATE utilisateurs SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            jsonResponse(true, null, 'Utilisateur mis à jour avec succès');
        }

        if ($method === 'DELETE') {
            $currentUser = requireAuth(['admin']);

            if ($currentUser['id'] === $id) {
                jsonResponse(false, 'Vous ne pouvez pas supprimer votre propre compte', null, 400);
            }

            $stmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
                jsonResponse(false, 'Utilisateur non trouvé', null, 404);
            }

            $stmt = $pdo->prepare("UPDATE utilisateurs SET actif = 0 WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse(true, null, 'Utilisateur désactivé avec succès');
        }
    }
    
    // ==================== STATISTIQUES ====================
    if ($path === 'stats/reclamations' && $method === 'GET') {
        $user = requireAuth(['admin']);
        
        // Par statut
        $stmt = $pdo->query("SELECT statut, COUNT(*) as count FROM reclamations GROUP BY statut");
        $parStatut = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Par priorité
        $stmt = $pdo->query("SELECT priorite, COUNT(*) as count FROM reclamations GROUP BY priorite");
        $parPriorite = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Par atelier
        $stmt = $pdo->query("
            SELECT e.atelier, COUNT(r.id) as count 
            FROM reclamations r
            JOIN equipements e ON r.equipement_id = e.id
            WHERE e.atelier IS NOT NULL
            GROUP BY e.atelier
        ");
        $parAtelier = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Évolution mensuelle (12 derniers mois, incluant les mois sans réclamation)
        $stmt = $pdo->query("
            SELECT DATE_FORMAT(date_reclamation, '%Y-%m') as mois_key, COUNT(*) as count
            FROM reclamations
            WHERE date_reclamation >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            GROUP BY DATE_FORMAT(date_reclamation, '%Y-%m')
            ORDER BY mois_key
        ");
        $rawEvolution = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rawMap = [];
        foreach ($rawEvolution as $row) {
            $rawMap[$row['mois_key']] = (int)$row['count'];
        }

        $evolutionMensuelle = [];
        $base = new DateTime('first day of this month');
        $base->modify('-11 months');
        for ($i = 0; $i < 12; $i++) {
            $monthDate = (clone $base)->modify("+$i months");
            $key = $monthDate->format('Y-m');
            $evolutionMensuelle[] = [
                'annee' => (int)$monthDate->format('Y'),
                'mois' => (int)$monthDate->format('m'),
                'mois_key' => $key,
                'count' => $rawMap[$key] ?? 0
            ];
        }
        
        jsonResponse(true, [
            'par_statut' => $parStatut,
            'par_priorite' => $parPriorite,
            'par_atelier' => $parAtelier,
            'evolution_mensuelle' => $evolutionMensuelle,
            'total' => array_sum(array_column($parStatut, 'count'))
        ]);
    }
    
    // ==================== ROUTE NON TROUVÉE ====================
    jsonResponse(false, "Route non trouvée: $path", null, 404);
    
} catch (PDOException $e) {
    error_log('Erreur BD: ' . $e->getMessage());
    jsonResponse(false, APP_DEBUG ? ('Erreur base de données: ' . $e->getMessage()) : 'Erreur base de données.', null, 500);
} catch (Exception $e) {
    error_log('Erreur serveur: ' . $e->getMessage());
    jsonResponse(false, APP_DEBUG ? ('Erreur serveur: ' . $e->getMessage()) : 'Erreur serveur.', null, 500);
}

