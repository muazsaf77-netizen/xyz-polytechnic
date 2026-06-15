<?php
declare(strict_types=1);
namespace App\Models;
use App\Core\Model;

/**
 * Admission Model
 * Admission applications & processing
 */
class Admission extends Model
{
    protected string $table = 'admissions';

    /**
     * Generate unique reference number
     */
    public function generateReferenceNo(): string
    {
        do {
            $ref = 'XYZ-' . date('Y') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
            $stmt = $this->db->prepare("SELECT id FROM admissions WHERE reference_no=? LIMIT 1");
            $stmt->execute([$ref]);
        } while ($stmt->fetch());

        return $ref;
    }

    /**
     * Admin list with filters & search
     */
    public function getAdminList(int $page, array $filters = []): array
    {
        $where = '1=1';
        $bindings = [];

        if (!empty($filters['status'])) {
            $where .= ' AND a.status=?';
            $bindings[] = $filters['status'];
        }

        if (!empty($filters['program_id'])) {
            $where .= ' AND a.program_id=?';
            $bindings[] = (int)$filters['program_id'];
        }

        if (!empty($filters['search'])) {
            $where .= ' AND (a.applicant_name_en LIKE ? OR a.reference_no LIKE ? OR a.email LIKE ?)';
            $t = '%' . $filters['search'] . '%';
            array_push($bindings, $t, $t, $t);
        }

        $perPage = ADMIN_ITEMS_PER_PAGE;
        $offset = ($page - 1) * $perPage;

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM admissions a WHERE {$where}");
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT a.*, p.name_en AS program_name, p.tvet_level
             FROM admissions a
             JOIN programs p ON p.id=a.program_id
             WHERE {$where}
             ORDER BY a.created_at DESC
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
