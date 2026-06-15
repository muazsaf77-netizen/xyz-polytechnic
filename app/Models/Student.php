<?php
declare(strict_types=1);
namespace App\Models;
use App\Core\Model;

/**
 * Student Model
 * Student records synced from Moodle
 */
class Student extends Model
{
    protected string $table = 'students';

    /**
     * Find student by Moodle ID
     */
    public function findByMoodleId(int $moodleId): ?array
    {
        return $this->findBy('moodle_user_id', $moodleId);
    }

    /**
     * Get student with program details
     */
    public function getWithProgram(int $studentId): ?array
    {
        return $this->queryOne(
            "SELECT s.*,
                    p.name_en AS program_name_en,
                    p.name_am AS program_name_am,
                    p.tvet_level AS program_level,
                    p.sector AS program_sector,
                    p.code AS program_code
             FROM students s
             LEFT JOIN programs p ON p.id=s.program_id
             WHERE s.id=?",
            [$studentId]
        );
    }

    /**
     * Get student's CoC results
     */
    public function getCocResults(int $studentId): array
    {
        return $this->query(
            "SELECT cr.*,
                    p.name_en AS program_name_en,
                    p.name_am AS program_name_am
             FROM coc_results cr
             JOIN programs p ON p.id=cr.program_id
             WHERE cr.student_id=?
             ORDER BY cr.exam_date DESC",
            [$studentId]
        );
    }

    /**
     * Get student's industry attachments
     */
    public function getIndustryAttachments(int $studentId): array
    {
        return $this->query(
            "SELECT * FROM industry_attachments
             WHERE student_id=?
             ORDER BY start_date DESC",
            [$studentId]
        );
    }

    /**
     * Admin list with filters
     */
    public function getAdminList(int $page, array $filters = []): array
    {
        $where = '1=1';
        $bindings = [];

        if (!empty($filters['program_id'])) {
            $where .= ' AND s.program_id=?';
            $bindings[] = (int)$filters['program_id'];
        }

        if (!empty($filters['status'])) {
            $where .= ' AND s.status=?';
            $bindings[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where .= ' AND (s.full_name_en LIKE ? OR s.student_id LIKE ? OR s.email LIKE ?)';
            $t = '%' . $filters['search'] . '%';
            array_push($bindings, $t, $t, $t);
        }

        $perPage = ADMIN_ITEMS_PER_PAGE;
        $offset = ($page - 1) * $perPage;

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM students s WHERE {$where}");
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT s.*, p.name_en AS program_name, p.tvet_level
             FROM students s
             LEFT JOIN programs p ON p.id=s.program_id
             WHERE {$where}
             ORDER BY s.created_at DESC
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
}
