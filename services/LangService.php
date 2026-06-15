<?php
declare(strict_types=1);
namespace Services;

/**
 * Language Service
 * Handles bilingual (English/Amharic) support
 */
class LangService
{
    private static ?self $instance = null;
    private array $strings = [];
    private string $lang;
    private \App\Core\Session $session;

    private function __construct()
    {
        $this->session = new \App\Core\Session();
        $this->lang = $this->session->getLang();
        $this->load();
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
     * Set language
     */
    public function setLang(string $lang): void
    {
        $this->lang = in_array($lang, ['en', 'am']) ? $lang : 'en';
        $this->session->setLang($this->lang);
        $this->load();
        self::$instance = null; // Reset singleton
    }

    /**
     * Get current language
     */
    public function getLang(): string
    {
        return $this->lang;
    }

    /**
     * Check if Amharic
     */
    public function isAmharic(): bool
    {
        return $this->lang === 'am';
    }

    /**
     * Translate key with placeholders
     */
    public function t(string $key, array $replace = []): string
    {
        $text = $this->strings[$key] ?? $key;
        foreach ($replace as $placeholder => $value) {
            $text = str_replace(':' . $placeholder, (string)$value, $text);
        }
        return $text;
    }

    /**
     * Load language file
     */
    private function load(): void
    {
        $file = LANG_PATH . '/' . $this->lang . '.php';
        if (!file_exists($file)) {
            $file = LANG_PATH . '/en.php';
        }
        $this->strings = require $file;
    }
}
