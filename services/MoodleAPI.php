<?php
declare(strict_types=1);
namespace Services;

/**
 * Moodle Web Services API Wrapper
 * REST API integration for SSO, grades, course enrollment
 */
class MoodleAPI
{
    private static ?self $instance = null;
    private array $config;
    private string $restUrl;
    private string $tokenUrl;

    private function __construct()
    {
        $this->config = require CONFIG_PATH . '/moodle.php';
        $this->restUrl = $this->config['base_url'] . $this->config['rest_endpoint'];
        $this->tokenUrl = $this->config['base_url'] . $this->config['token_endpoint'];
    }

    /**
     * Get singleton instance
     */
    public static function getInstance(): self
    {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Authenticate user → returns token on success, null on failure
     */
    public function getUserToken(string $username, string $password): ?string
    {
        $response = $this->curlPost($this->tokenUrl, [
            'username' => $username,
            'password' => $password,
            'service' => $this->config['service_name'],
        ]);

        if (!$response) {
            return null;
        }

        $data = json_decode($response, true);
        return $data['token'] ?? null;
    }

    /**
     * Get site info (verifies token, returns userid)
     */
    public function getSiteInfo(?string $userToken = null): ?array
    {
        return $this->call('core_webservice_get_site_info', [], $userToken);
    }

    /**
     * Get user record by username
     */
    public function getUserByUsername(string $username): ?array
    {
        $result = $this->call('core_user_get_users_by_field', [
            'field' => 'username',
            'values' => [$username],
        ]);
        return !empty($result[0]) ? $result[0] : null;
    }

    /**
     * Get all courses a student is enrolled in
     */
    public function getEnrolledCourses(int $moodleUserId): array
    {
        $result = $this->call('core_enrol_get_users_courses', [
            'userid' => $moodleUserId,
        ]);
        return is_array($result) ? $result : [];
    }

    /**
     * Get course sections and activities
     */
    public function getCourseContents(int $courseId): array
    {
        $result = $this->call('core_course_get_contents', [
            'courseid' => $courseId,
        ]);
        return is_array($result) ? $result : [];
    }

    /**
     * Get student grades for a course
     */
    public function getGrades(int $courseId, int $userId): ?array
    {
        return $this->call('gradereport_user_get_grades_table', [
            'courseid' => $courseId,
            'userid' => $userId,
        ]);
    }

    /**
     * Get activity completion status
     */
    public function getCompletionStatus(int $courseId, int $userId): ?array
    {
        return $this->call('core_completion_get_activities_completion_status', [
            'courseid' => $courseId,
            'userid' => $userId,
        ]);
    }

    /**
     * Core REST API dispatcher
     */
    public function call(
        string $function,
        array $params = [],
        ?string $token = null
    ): mixed {
        $token = $token ?? $this->config['token'];

        if (empty($token)) {
            error_log("MoodleAPI: No token provided for {$function}");
            return null;
        }

        $queryString = http_build_query(array_merge(
            [
                'wstoken' => $token,
                'wsfunction' => $function,
                'moodlewsrestformat' => $this->config['rest_format'],
            ],
            $this->flattenParams($params)
        ));

        $response = $this->curlGet($this->restUrl . '?' . $queryString);
        if (!$response) {
            return null;
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("MoodleAPI: JSON decode error for {$function}");
            return null;
        }

        // Check for Moodle exception
        if (isset($data['exception'])) {
            error_log("MoodleAPI [{$function}]: " . ($data['message'] ?? 'Unknown error'));
            return null;
        }

        return $data;
    }

    /**
     * Fallback: Verify credentials against Moodle DB directly
     */
    public function verifyCredentialsViaDB(string $username, string $password): ?array
    {
        try {
            $pdo = \App\Core\Database::getInstance('moodle');
            $stmt = $pdo->prepare(
                "SELECT id, username, firstname, lastname, email, password, suspended
                 FROM mdl_user
                 WHERE username=:u AND deleted=0 AND confirmed=1 LIMIT 1"
            );
            $stmt->execute(['u' => $username]);
            $user = $stmt->fetch();

            if (!$user || (int)$user['suspended'] === 1) {
                return null;
            }

            // Verify password (Moodle 4.x uses bcrypt, legacy uses md5)
            if (!password_verify($password, $user['password'])) {
                // Fallback to md5 for legacy Moodle versions
                if ($user['password'] !== md5($password)) {
                    return null;
                }
            }

            return $user;
        } catch (\Exception $e) {
            error_log("Moodle DB fallback error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * cURL GET request
     */
    private function curlGet(string $url): string|false
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->config['timeout'],
            CURLOPT_CONNECTTIMEOUT => $this->config['connect_timeout'],
            CURLOPT_SSL_VERIFYPEER => $this->config['verify_ssl'],
            CURLOPT_ENCODING => 'gzip,deflate',
        ]);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            error_log("cURL GET error: " . curl_error($ch));
            $response = false;
        }

        curl_close($ch);
        return $response;
    }

    /**
     * cURL POST request
     */
    private function curlPost(string $url, array $params): string|false
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_TIMEOUT => $this->config['timeout'],
            CURLOPT_CONNECTTIMEOUT => $this->config['connect_timeout'],
            CURLOPT_SSL_VERIFYPEER => $this->config['verify_ssl'],
        ]);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            error_log("cURL POST error: " . curl_error($ch));
            $response = false;
        }

        curl_close($ch);
        return $response;
    }

    /**
     * Flatten nested arrays for REST API (e.g., courses[0][id]=123)
     */
    private function flattenParams(array $params, string $prefix = ''): array
    {
        $result = [];

        foreach ($params as $key => $value) {
            $fullKey = $prefix ? "{$prefix}[{$key}]" : (string)$key;

            if (is_array($value)) {
                $result += $this->flattenParams($value, $fullKey);
            } else {
                $result[$fullKey] = $value;
            }
        }

        return $result;
    }
}
