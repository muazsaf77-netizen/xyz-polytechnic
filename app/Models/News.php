<?php
declare(strict_types=1);
namespace App\Models;
use App\Core\Model;

/**
 * News Model
 * News, announcements, events
 */
class News extends Model
{
    protected string $table = 'news';

    /**
     * Get published news with pagination
     */
    public function getPublished(int $page, string $category = ''): array
    {
        $where = 'n.is_published=1 AND n.published_at<=NOW()';
        $bindings = [];

        if ($category !== '') {
            $where .= ' AND n.category=?';
            $bindings[] = $category;
        }

        $perPage = ITEMS_PER_PAGE;
        $offset = ($page - 1) * $perPage;

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM news n WHERE {$where}");
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT n.*, a.full_name_en AS author_name
             FROM news n
             JOIN admin_users a ON a.id=n.author_id
             WHERE {$where}
             ORDER BY n.published_at DESC
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
     * Get featured articles
     */
    public function getFeatured(int $limit = 3): array
    {
        return $this->query(
            "SELECT * FROM news
             WHERE is_published=1 AND is_featured=1 AND published_at<=NOW()
             ORDER BY published_at DESC
             LIMIT ?",
            [$limit]
        );
    }

    /**
     * Find article by slug
     */
    public function findBySlug(string $slug): ?array
    {
        return $this->queryOne(
            "SELECT n.*, a.full_name_en AS author_name
             FROM news n
             JOIN admin_users a ON a.id=n.author_id
             WHERE n.slug=? AND n.is_published=1",
            [$slug]
        );
    }

    /**
     * Generate unique slug from title
     */
    public function generateSlug(string $titleEn, ?int $excludeId = null): string
    {
        $slug = trim(strtolower(preg_replace('/[^a-z0-9]+/i', '-', $titleEn)), '-');
        $base = $slug;
        $i = 1;

        while (true) {
            $query = "SELECT id FROM news WHERE slug=?";
            if ($excludeId) {
                $query .= " AND id!={$excludeId}";
            }
            $check = $this->db->prepare($query);
            $check->execute([$slug]);

            if (!$check->fetch()) {
                break;
            }

            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
