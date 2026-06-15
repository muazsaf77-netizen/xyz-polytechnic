<?php
declare(strict_types=1);
namespace App\Core;

/**
 * URL Router — Maps HTTP requests to Controllers & Actions
 */
class Router
{
    private array $routes = [];

    /**
     * Register GET route
     */
    public function get(string $pattern, string $controller, string $action): void
    {
        $this->routes[] = [
            'pattern'    => $pattern,
            'controller' => $controller,
            'action'     => $action,
            'method'     => 'GET',
        ];
    }

    /**
     * Register POST route
     */
    public function post(string $pattern, string $controller, string $action): void
    {
        $this->routes[] = [
            'pattern'    => $pattern,
            'controller' => $controller,
            'action'     => $action,
            'method'     => 'POST',
        ];
    }

    /**
     * Dispatch request to matching route
     */
    public function dispatch(string $uri, string $method): void
    {
        $uri = '/' . trim(parse_url($uri, PHP_URL_PATH) ?: '/', '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== strtoupper($method)) {
                continue;
            }

            // Convert {id} to regex: (?P<id>[^/]+)
            $regex = '#^' . preg_replace(
                '/\{([a-z_]+)\}/',
                '(?P<$1>[^/]+)',
                $route['pattern']
            ) . '$#i';

            if (!preg_match($regex, $uri, $matches)) {
                continue;
            }

            // Extract named parameters
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

            // Load & instantiate controller
            $class = 'App\\Controllers\\' . $route['controller'];
            if (!class_exists($class)) {
                $this->abort(500, "Controller {$class} not found.");
                return;
            }

            $obj = new $class();
            $action = $route['action'];

            if (!method_exists($obj, $action)) {
                $this->abort(500, "Method {$action} not found in {$class}.");
                return;
            }

            // Call controller action
            $obj->$action($params);
            return;
        }

        $this->abort(404, 'Page not found.');
    }

    /**
     * Abort with HTTP error
     */
    public function abort(int $code, string $msg = ''): void
    {
        http_response_code($code);
        $titles = [
            404 => 'Page Not Found',
            403 => 'Forbidden',
            500 => 'Server Error',
        ];
        echo '<h1>' . ($titles[$code] ?? 'Error') . '</h1>';
        echo '<p>' . htmlspecialchars($msg) . '</p>';
        exit;
    }
}
