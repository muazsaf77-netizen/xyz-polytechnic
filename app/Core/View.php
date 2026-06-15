<?php
declare(strict_types=1);
namespace App\Core;

/**
 * View Renderer — Handles template rendering
 */
class View
{
    /**
     * Render view with layout
     */
    public static function render(
        string $viewPath,
        array $data = [],
        string $layout = 'main'
    ): void {
        $viewFile = APP_PATH . '/Views/' . str_replace('.', DIRECTORY_SEPARATOR, $viewPath) . '.php';
        if (!file_exists($viewFile)) {
            throw new \RuntimeException("View not found: {$viewFile}");
        }

        // Extract variables into scope
        extract($data, EXTR_SKIP);

        // Render view
        ob_start();
        include $viewFile;
        $content = ob_get_clean();

        // If no layout, echo content directly
        if ($layout === 'none') {
            echo $content;
            return;
        }

        // Load layout
        $layoutFile = APP_PATH . '/Views/layouts/' . $layout . '.php';
        if (!file_exists($layoutFile)) {
            throw new \RuntimeException("Layout not found: {$layoutFile}");
        }

        include $layoutFile;
    }

    /**
     * Escape output for HTML
     */
    public static function e(mixed $value): string
    {
        return htmlspecialchars(
            (string)($value ?? ''),
            ENT_QUOTES | ENT_HTML5,
            'UTF-8'
        );
    }
}
