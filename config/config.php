<?php
declare(strict_types=1);

// ════════════════════════════════════════════════════════════════════════════════
// XYZ POLYTECHNIC — APPLICATION CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

// Path definitions
define('SITE_NAME_EN', 'XYZ Polytechnic College');
define('SITE_NAME_AM', 'ኤክስ ዋይ ዜድ ፖሊቴክኒክ ኮሌጅ');
define('SITE_VERSION', '1.0.0');
define('BASE_PATH', dirname(__DIR__));
define('APP_PATH', BASE_PATH . '/app');
define('CONFIG_PATH', BASE_PATH . '/config');
define('SERVICES_PATH', BASE_PATH . '/services');
define('LANG_PATH', BASE_PATH . '/lang');
define('PUBLIC_PATH', BASE_PATH . '/public');
define('UPLOAD_PATH', PUBLIC_PATH . '/assets/uploads');
define('UPLOAD_URL', '/assets/uploads');

// Application settings
define('APP_URL', rtrim($_ENV['APP_URL'] ?? 'https://xyzpoly.edu.et', '/'));
define('APP_ENV', $_ENV['APP_ENV'] ?? 'production');
define('APP_DEBUG', filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN));
define('APP_KEY', $_ENV['APP_KEY'] ?? 'CHANGE_THIS_32_CHAR_SECRET_KEY!!');

// Security settings
define('HASH_ALGO', PASSWORD_BCRYPT);
define('HASH_COST', 12);
define('CSRF_TOKEN_NAME', '_csrf_token');
define('SESSION_NAME', 'XYZPOLY_SESS');
define('SESSION_LIFETIME', 7200); // 2 hours

// Upload settings
define('MAX_UPLOAD_MB', 10);
define('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx');

// Pagination
define('ITEMS_PER_PAGE', 15);
define('ADMIN_ITEMS_PER_PAGE', 20);

// Timezone
date_default_timezone_set('Africa/Addis_Ababa');

// Error reporting
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}
