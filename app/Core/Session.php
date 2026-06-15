<?php
declare(strict_types=1);
namespace App\Core;

/**
 * Session Manager — Handles user sessions, flash messages, CSRF tokens
 */
class Session
{
    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_set_cookie_params([
                'lifetime' => SESSION_LIFETIME,
                'path'     => '/',
                'secure'   => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }

    /**
     * Set session value
     */
    public function set(string $key, mixed $value): void
    {
        $_SESSION[$key] = $value;
    }

    /**
     * Get session value
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return $_SESSION[$key] ?? $default;
    }

    /**
     * Check if key exists
     */
    public function has(string $key): bool
    {
        return isset($_SESSION[$key]);
    }

    /**
     * Remove session key
     */
    public function remove(string $key): void
    {
        unset($_SESSION[$key]);
    }

    /**
     * Destroy entire session
     */
    public function destroy(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 3600,
                $p['path'],
                $p['domain'],
                $p['secure'],
                $p['httponly']
            );
        }
        session_destroy();
    }

    /**
     * Set flash message (one-time display)
     */
    public function setFlash(string $type, string $message): void
    {
        if (!isset($_SESSION['_flash'])) {
            $_SESSION['_flash'] = [];
        }
        if (!isset($_SESSION['_flash'][$type])) {
            $_SESSION['_flash'][$type] = [];
        }
        $_SESSION['_flash'][$type][] = $message;
    }

    /**
     * Get & clear flash messages
     */
    public function getFlash(string $type): array
    {
        $messages = $_SESSION['_flash'][$type] ?? [];
        unset($_SESSION['_flash'][$type]);
        return $messages;
    }

    /**
     * Check if flash messages exist
     */
    public function hasFlash(string $type): bool
    {
        return !empty($_SESSION['_flash'][$type]);
    }

    /**
     * Get CSRF token (create if not exists)
     */
    public function getCsrfToken(): string
    {
        if (empty($_SESSION['_csrf_token'])) {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf_token'];
    }

    /**
     * Verify CSRF token
     */
    public function verifyCsrfToken(string $token): bool
    {
        return isset($_SESSION['_csrf_token']) &&
               hash_equals($_SESSION['_csrf_token'], $token);
    }

    /**
     * Get current language
     */
    public function getLang(): string
    {
        return $_SESSION['lang'] ?? 'en';
    }

    /**
     * Set language
     */
    public function setLang(string $lang): void
    {
        $_SESSION['lang'] = in_array($lang, ['en', 'am']) ? $lang : 'en';
    }
}
