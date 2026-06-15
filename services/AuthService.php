<?php
declare(strict_types=1);
namespace Services;
use App\Core\{Database, Session};

/**
 * Authentication Service
 * Handles student & admin login, Moodle integration
 */
class AuthService
{
    private MoodleAPI $moodle;
    private Session $session;

    public function __construct()
    {
        $this->moodle = MoodleAPI::getInstance();
        $this->session = new Session();
    }

    /**
     * Student login via Moodle WS or fallback DB
     */
    public function studentLogin(string $username, string $password): array
    {
        $username = strtolower(trim($username));
        $userToken = $this->moodle->getUserToken($username, $password);
        $mUser = null;

        // Try REST API first
        if ($userToken) {
            $info = $this->moodle->getSiteInfo($userToken);
            if ($info) {
                $mUser = [
                    'id' => $info['userid'] ?? null,
                    'username' => $info['username'] ?? null,
                    'firstname' => $info['firstname'] ?? '',
                    'lastname' => $info['lastname'] ?? '',
                    'email' => $info['useremail'] ?? '',
                ];
            }
        }

        // Fallback: authenticate against Moodle DB
        if (!$mUser) {
            $mUser = $this->moodle->verifyCredentialsViaDB($username, $password);
            if ($mUser) {
                $userToken = null;
            }
        }

        if (!$mUser) {
            return ['success' => false, 'error' => 'invalid_credentials'];
        }

        // Sync local student record
        $student = $this->syncStudentRecord($mUser);
        if (!$student) {
            return ['success' => false, 'error' => 'student_not_found'];
        }

        // Set session
        $this->session->set('student_moodle_id', (int)$mUser['id']);
        $this->session->set('student_id', $student['id']);
        $this->session->set('student_name_en', $student['full_name_en']);
        $this->session->set('student_username', $username);
        $this->session->set('student_email', $mUser['email'] ?? '');
        if ($userToken) {
            $this->session->set('moodle_user_token', $userToken);
        }

        return ['success' => true, 'student' => $student];
    }

    /**
     * Admin login (local credentials)
     */
    public function adminLogin(string $username, string $password): array
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare(
            "SELECT * FROM admin_users
             WHERE (username=:u OR email=:u) AND is_active=1 LIMIT 1"
        );
        $stmt->execute(['u' => trim($username)]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            return ['success' => false, 'error' => 'invalid_credentials'];
        }

        // Rehash password if needed (upgrade old hashes)
        if (password_needs_rehash($admin['password_hash'], HASH_ALGO, ['cost' => HASH_COST])) {
            $pdo->prepare(
                "UPDATE admin_users SET password_hash=? WHERE id=?"
            )->execute([
                password_hash($password, HASH_ALGO, ['cost' => HASH_COST]),
                $admin['id'],
            ]);
        }

        // Update last login
        $pdo->prepare("UPDATE admin_users SET last_login=NOW() WHERE id=?")
            ->execute([$admin['id']]);

        // Set session
        $this->session->set('admin_id', (int)$admin['id']);
        $this->session->set('admin_username', $admin['username']);
        $this->session->set('admin_name', $admin['full_name_en']);
        $this->session->set('admin_role', $admin['role']);

        return ['success' => true, 'admin' => $admin];
    }

    /**
     * Admin logout
     */
    public function adminLogout(): void
    {
        foreach (['admin_id', 'admin_username', 'admin_name', 'admin_role'] as $key) {
            $this->session->remove($key);
        }
    }

    /**
     * Student logout
     */
    public function studentLogout(): void
    {
        foreach (['student_moodle_id', 'student_id', 'student_name_en', 'student_username', 'moodle_user_token'] as $key) {
            $this->session->remove($key);
        }
    }

    /**
     * Auto-create / update local student record
     */
    private function syncStudentRecord(array $moodleUser): ?array
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM students WHERE moodle_user_id=? LIMIT 1");
        $stmt->execute([(int)$moodleUser['id']]);
        $student = $stmt->fetch();

        $fullName = trim(($moodleUser['firstname'] ?? '') . ' ' . ($moodleUser['lastname'] ?? ''));

        // Update existing student
        if ($student) {
            $pdo->prepare(
                "UPDATE students SET full_name_en=?, email=?, moodle_synced_at=NOW() WHERE moodle_user_id=?"
            )->execute([
                $fullName ?: $student['full_name_en'],
                $moodleUser['email'] ?? $student['email'],
                (int)$moodleUser['id'],
            ]);
            return array_merge($student, ['full_name_en' => $fullName]);
        }

        // Create new student record
        $year = date('Y');
        $count = (int)$pdo->query(
            "SELECT COUNT(*) FROM students WHERE YEAR(created_at)={$year}"
        )->fetchColumn() + 1;
        $studentId = sprintf('XYZ/%s/%04d', $year, $count);

        $pdo->prepare(
            "INSERT INTO students(moodle_user_id, student_id, full_name_en, email, status, moodle_synced_at)
             VALUES(?, ?, ?, ?, 'active', NOW())"
        )->execute([
            (int)$moodleUser['id'],
            $studentId,
            $fullName ?: 'Unknown',
            $moodleUser['email'] ?? null,
        ]);

        // Fetch newly created record
        $stmt->execute([(int)$moodleUser['id']]);
        return $stmt->fetch() ?: null;
    }
}
