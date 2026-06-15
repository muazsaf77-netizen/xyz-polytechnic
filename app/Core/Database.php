<?php
declare(strict_types=1);
namespace App\Core;
use PDO, PDOException, RuntimeException;

/**
 * Database Singleton — PDO wrapper for MySQL 8.0
 */
class Database
{
    private static array $instances = [];
    private function __construct() {}
    private function __clone() {}

    /**
     * Get or create database connection
     */
    public static function getInstance(string $connection = 'default'): PDO
    {
        if (isset(self::$instances[$connection])) {
            return self::$instances[$connection];
        }

        $configs = require CONFIG_PATH . '/database.php';
        if (!isset($configs[$connection])) {
            throw new RuntimeException("DB config '{$connection}' not found.");
        }

        $cfg = $configs[$connection];
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $cfg['host'], $cfg['port'], $cfg['dbname'], $cfg['charset']
        );

        try {
            self::$instances[$connection] = new PDO(
                $dsn,
                $cfg['username'],
                $cfg['password'],
                $cfg['options']
            );
        } catch (PDOException $e) {
            throw new RuntimeException("Database connection failed: " . $e->getMessage());
        }

        return self::$instances[$connection];
    }

    /**
     * Close all connections
     */
    public static function closeAll(): void
    {
        self::$instances = [];
    }
}
