<?php
declare(strict_types=1);
namespace App\Models;
use App\Core\Model;

/**
 * CoC Result Model
 * Certificate of Competence exam results
 */
class CocResult extends Model
{
    protected string $table = 'coc_results';

    /**
     * Admin list with filters & search
     */
    public function getAdminList(int $page, array $filters = []): array
    {
        $where = '1=1';
        $bindings = [];

        if (!empty($filters['program_id'])) {
            $where .= ' AND cr.program_id=?';
            $bindings[] = (int)$filters['program_id'];
        }

        if (!empty($filters['result'])) {
            $where .= ' AND cr.result=?';
            $bindings[] = $filters['result'];
        }

        if (!empty($filters['exam_date'])) {
            $where .= ' AND DATE(cr.exam_date)=?';
            $bindings[] = $filters['exam_date'];
        }

        if (!empty($filters['search'])) {
            $where .= ' AND (s.full_name_en LIKE ? OR s.student_id LIKE ?)';
            $t = '%' . $filters['search'] . '%';
            $bindings[] = $t;
            $bindings[] = $t;
        }

        $perPage = ADMIN_ITEMS_PER_PAGE;
        $offset = ($page - 1) * $perPage;

        $countStmt = $this->db->prepare(
            "SELECT COUNT(*) FROM coc_results cr
             JOIN students s ON s.id=cr.student_id
             WHERE {$where}"
        );
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT cr.*,
                    s.full_name_en AS student_name,
                    s.student_id AS student_no,
                    p.name_en AS program_name
             FROM coc_results cr
             JOIN students s ON s.id=cr.student_id
             JOIN programs p ON p.id=cr.program_id
             WHERE {$where}
             ORDER BY cr.exam_date DESC, s.full_name_en
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
