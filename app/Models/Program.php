<?php
declare(strict_types=1);
namespace App\Models;
use App\Core\Model;

/**
 * Program Model
 * TVET Programs (Levels I-V)
 */
class Program extends Model
{
    protected string $table = 'programs';

    /**
     * Get all active programs
     */
    public function getActive(string $lang = 'en'): array
    {
        return $this->query(
            "SELECT *, name_{$lang} AS name, description_{$lang} AS description
             FROM programs
             WHERE is_active=1
             ORDER BY tvet_level, sort_order, name_en"
        );
    }

    /**
     * Get programs by TVET level
     */
    public function getByLevel(string $level): array
    {
        return $this->query(
            "SELECT * FROM programs
             WHERE tvet_level=? AND is_active=1
             ORDER BY name_en",
            [$level]
        );
    }

    /**
     * Get programs with course count
     */
    public function getWithCourseCount(): array
    {
        return $this->query(
            "SELECT p.*,
                    COUNT(c.id) AS course_count,
                    SUM(c.credit_hours) AS total_credits
             FROM programs p
             LEFT JOIN courses c ON c.program_id=p.id AND c.is_active=1
             WHERE p.is_active=1
             GROUP BY p.id
             ORDER BY p.tvet_level, p.sort_order"
        );
    }

    /**
     * Admin list with search & pagination
     */
    public function getAdminList(int $page, string $search = ''): array
    {
        $where = '1=1';
        $bindings = [];

        if ($search !== '') {
            $where .= " AND (p.name_en LIKE ? OR p.code LIKE ? OR p.sector LIKE ?)";
            $term = "%{$search}%";
            $bindings = [$term, $term, $term];
        }

        $perPage = ADMIN_ITEMS_PER_PAGE;
        $offset = ($page - 1) * $perPage;

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM programs p WHERE {$where}");
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT p.*,
                    (SELECT COUNT(*) FROM courses c WHERE c.program_id=p.id) AS course_count
             FROM programs p
             WHERE {$where}
             ORDER BY p.tvet_level, p.sort_order, p.name_en
             LIMIT {$perPage} OFFSET {$offset}"
        );
        $stmt->execute($bindings);

        return [
            'data'         => $stmt->fetchAll(),
            'total'        => $total,
            'per_page'     => $perPage,
            'current_page' => $page,
            'last_page'    => max(1, (int)ceil($total / $perPage)),
        ];
    }

    /**
     * Find program by code
     */
    public function findByCode(string $code): ?array
    {
        return $this->findBy('code', strtoupper($code));
    }
}
