<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Google API configuration - THAY THẾ BẰNG THÔNG TIN CỦA BẠN
define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');
// Đảm bảo URI này khớp với URI bạn đã đăng ký trên Google Cloud Console
define('GOOGLE_REDIRECT_URI', 'http://localhost/weather_app_php_auth/google_oauth_callback.php'); // Ví dụ

// Database configuration - THAY THẾ BẰNG THÔNG TIN CỦA BẠN
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root'); // Hoặc user của bạn
define('DB_PASSWORD', '123456789');     // Hoặc password của bạn
define('DB_NAME', 'weather'); // Tên database bạn đã tạo

// Autoload Composer dependencies
require_once __DIR__ . '/vendor/autoload.php';
?>
