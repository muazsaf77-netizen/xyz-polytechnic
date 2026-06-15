<?php
declare(strict_types=1);
namespace App\Core;
use PDO;

/**
 * Base Model — CRUD operations
 */
abstract class Model
{
    protected PDO $db;
    protected string $table = '';
    protected string $primaryKey = 'id';

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Find by primary key
     */
    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM `{$this->table}` WHERE `{$this->primaryKey}`=? LIMIT 1"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Find by column value
     */
    public function findBy(string $column, mixed $value): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM `{$this->table}` WHERE `{$column}`=? LIMIT 1"
        );
        $stmt->execute([$value]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Get all records
     */
    public function all(string $orderBy = 'id', string $direction = 'ASC'): array
    {
        $d = strtoupper($direction) === 'DESC' ? 'DESC' : 'ASC';
        return $this->db->query(
            "SELECT * FROM `{$this->table}` ORDER BY `{$orderBy}` {$d}"
        )->fetchAll();
    }

    /**
     * Paginate records
     */
    public function paginate(
        int $page,
        int $perPage,
        string $where = '',
        array $bindings = []
    ): array {
        $offset = ($page - 1) * $perPage;
        $whereClause = $where ? "WHERE {$where}" : '';

        // Count total
        $countStmt = $this->db->prepare(
            "SELECT COUNT(*) FROM `{$this->table}` {$whereClause}"
        );
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        // Fetch paginated data
        $stmt = $this->db->prepare(
            "SELECT * FROM `{$this->table}` {$whereClause}
             ORDER BY `{$this->primaryKey}` DESC LIMIT {$perPage} OFFSET {$offset}"
        );
        $stmt->execute($bindings);

        return [
            'data'         => $stmt->fetchAll(),
            'total'        => $total,
            'per_page'     => $perPage,
            'current_page' => $page,
            'last_page'    => (int)ceil($total / $perPage),
        ];
    }

    /**
     * Insert record
     */
    public function insert(array $data): int
    {
        $cols = implode(', ', array_map(fn($c) => "`{$c}`", array_keys($data)));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $stmt = $this->db->prepare(
            "INSERT INTO `{$this->table}` ({$cols}) VALUES ({$placeholders})"
        );
        $stmt->execute(array_values($data));
        return (int)$this->db->lastInsertId();
    }

    /**
     * Update record
     */
    public function update(int $id, array $data): bool
    {
        $sets = implode(', ', array_map(fn($c) => "`{$c}`=?", array_keys($data)));
        $stmt = $this->db->prepare(
            "UPDATE `{$this->table}` SET {$sets} WHERE `{$this->primaryKey}`=?"
        );
        return $stmt->execute([...array_values($data), $id]);
    }

    /**
     * Delete record
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare(
            "DELETE FROM `{$this->table}` WHERE `{$this->primaryKey}`=?"
        );
        return $stmt->execute([$id]);
    }

    /**
     * Soft delete (mark inactive)
     */
    public function softDelete(int $id): bool
    {
        return $this->update($id, ['is_active' => 0]);
    }

    /**
     * Custom query (multiple rows)
     */
    protected function query(string $sql, array $bindings = []): array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($bindings);
        return $stmt->fetchAll();
    }

    /**
     * Custom query (single row)
     */
    protected function queryOne(string $sql, array $bindings = []): ?array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($bindings);
        return $stmt->fetch() ?: null;
    }
}
