<?php
declare(strict_types=1);
namespace App\Core;

/**
 * Base Controller — All controllers extend this
 */
abstract class Controller
{
    protected Session $session;
    protected Request $request;
    protected \Services\LangService $lang;

    public function __construct()
    {
        $this->session = new Session();
        $this->request = new Request();
        $this->lang = \Services\LangService::getInstance();
    }

    /**
     * Render view
     */
    protected function view(
        string $path,
        array $data = [],
        string $layout = 'main'
    ): void {
        View::render($path, $data, $layout);
    }

    /**
     * Redirect to URL
     */
    protected function redirect(string $url, int $code = 302): never
    {
        header("Location: {$url}", true, $code);
        exit;
    }

    /**
     * Return JSON response
     */
    protected function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Get CSRF field for forms
     */
    protected function csrfField(): string
    {
        $token = $this->session->getCsrfToken();
        return '<input type="hidden" name="' . CSRF_TOKEN_NAME . '"
                value="' . htmlspecialchars($token) . '">';
    }

    /**
     * Verify CSRF token
     */
    protected function verifyCsrf(): void
    {
        $token = $this->request->post(CSRF_TOKEN_NAME) ?? '';
        if (!$this->session->verifyCsrfToken($token)) {
            $this->session->setFlash('error', 'Invalid security token.');
            $this->redirect($_SERVER['HTTP_REFERER'] ?? APP_URL);
        }
    }

    /**
     * Require admin access
     */
    protected function requireAdmin(): void
    {
        if (!$this->session->get('admin_id')) {
            $this->session->setFlash('error', 'Please log in.');
            $this->redirect(APP_URL . '/admin/login');
        }
    }

    /**
     * Require student access
     */
    protected function requireStudent(): void
    {
        if (!$this->session->get('student_moodle_id')) {
            $this->session->setFlash('error', 'Please log in to your student portal.');
            $this->redirect(APP_URL . '/student/login');
        }
    }
}
