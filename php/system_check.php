<?php
// Tắt hiển thị cảnh báo
error_reporting(E_ERROR | E_PARSE);

echo "=== SYSTEM CHECK ===\n";

// Kiểm tra phiên bản PHP
echo "PHP Version: " . phpversion() . "\n";

// Kiểm tra các extension đã được bật
echo "\nRequired Extensions:\n";
$required_extensions = ['mysqli', 'curl', 'json', 'openssl'];
foreach ($required_extensions as $ext) {
    echo "- $ext: " . (extension_loaded($ext) ? "Enabled" : "Disabled") . "\n";
}

// Kiểm tra kết nối database
echo "\nDatabase Connection:\n";
try {
    require_once 'config.php';
    $conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    echo "- MySQL Connection: Success\n";
    echo "- MySQL Version: " . $conn->server_info . "\n";
    
    // Kiểm tra bảng users
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    echo "- Table 'users': " . ($result->num_rows > 0 ? "Exists" : "Not Found") . "\n";
    
    $conn->close();
} catch (Exception $e) {
    echo "- MySQL Connection: Failed - " . $e->getMessage() . "\n";
}

// Kiểm tra Google API Client
echo "\nGoogle API Client:\n";
try {
    if (class_exists('Google_Client')) {
        $client = new Google_Client();
        echo "- Google_Client: Installed\n";
        echo "- Version: " . $client->getLibraryVersion() . "\n";
        
        // Kiểm tra cấu hình Google API
        echo "- Client ID: " . (defined('GOOGLE_CLIENT_ID') ? "Configured" : "Not Configured") . "\n";
        echo "- Client Secret: " . (defined('GOOGLE_CLIENT_SECRET') ? "Configured" : "Not Configured") . "\n";
        echo "- Redirect URI: " . (defined('GOOGLE_REDIRECT_URI') ? "Configured" : "Not Configured") . "\n";
    } else {
        echo "- Google_Client: Not Installed\n";
    }
} catch (Exception $e) {
    echo "- Google_Client: Error - " . $e->getMessage() . "\n";
}

// Kiểm tra các file PHP
echo "\nPHP Files:\n";
$dir = __DIR__;
$php_files = ['config.php', 'login_with_google.php', 'google_oauth_callback.php'];
foreach ($php_files as $file) {
    echo "- $file: " . (file_exists($dir . '/' . $file) ? "Exists" : "Not Found") . "\n";
}

echo "\n=== SYSTEM CHECK COMPLETED ===\n";
?>