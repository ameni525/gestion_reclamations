<?php
namespace App\Core;

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $config = require __DIR__ . '/../../config/config.php';
        $db = $config['db'];
        
        $dsn = "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']};charset={$db['charset']}";
        
        try {
            $this->pdo = new \PDO($dsn, $db['user'], $db['pass'], [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (\PDOException $e) {
            die("Erreur de connexion à la base de données : " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public static function getConnection() {
        return self::getInstance()->pdo;
    }

    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    public function commit() {
        return $this->pdo->commit();
    }

    public function rollBack() {
        return $this->pdo->rollBack();
    }
}