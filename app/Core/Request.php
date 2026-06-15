<?php
declare(strict_types=1);
namespace App\Core;

/**
 * HTTP Request wrapper — Sanitizes input
 */
class Request
{
    /**
     * Get query parameter
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return isset($_GET[$key]) ? $this->sanitize($_GET[$key]) : $default;
    }

    /**
     * Get POST parameter
     */
    public function post(string $key, mixed $default = null): mixed
    {
        return isset($_POST[$key]) ? $this->sanitize($_POST[$key]) : $default;
    }

    /**
     * Get POST parameter as integer
     */
    public function postInt(string $key, int $default = 0): int
    {
        return (int)filter_input(INPUT_POST, $key, FILTER_SANITIZE_NUMBER_INT) ?: $default;
    }

    /**
     * Get POST parameter as email
     */
    public function postEmail(string $key): ?string
    {
        $value = filter_input(INPUT_POST, $key, FILTER_SANITIZE_EMAIL);
        return filter_var($value, FILTER_VALIDATE_EMAIL) ? $value : null;
    }

    /**
     * Get uploaded file
     */
    public function file(string $key): ?array
    {
        return $_FILES[$key] ?? null;
    }

    /**
     * Check if request is POST
     */
    public function isPost(): bool
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
    }

    /**
     * Check if request is AJAX
     */
    public function isAjax(): bool
    {
        return strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';
    }

    /**
     * Get client IP address
     */
    public function ip(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return filter_var($ip, FILTER_VALIDATE_IP) ?: '0.0.0.0';
    }

    /**
     * Sanitize input (recursive)
     */
    private function sanitize(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map([$this, 'sanitize'], $value);
        }
        if (is_string($value)) {
            return trim(strip_tags($value));
        }
        return $value;
    }
}
