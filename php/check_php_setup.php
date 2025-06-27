<?php
/**
 * Script kiểm tra cài đặt PHP cho ứng dụng Weather-Web
 * Chạy script này để xác nhận rằng môi trường PHP của bạn đã được cấu hình đúng
 */

// Hàm hiển thị kết quả kiểm tra
function displayResult($test, $result, $message, $required = true) {
    echo "<tr>";
    echo "<td>$test</td>";
    if ($result) {
        echo "<td class='success'>Thành công</td>";
        echo "<td>$message</td>";
    } else {
        if ($required) {
            echo "<td class='error'>Lỗi</td>";
        } else {
            echo "<td class='warning'>Cảnh báo</td>";
        }
        echo "<td>$message</td>";
    }
    echo "</tr>";
    
    return $result;
}

// Kiểm tra phiên bản PHP
function checkPHPVersion() {
    $required = '7.4.0';
    $current = phpversion();
    $result = version_compare($current, $required, '>=');
    $message = $result 
        ? "Phiên bản PHP hiện tại: $current" 
        : "Phiên bản PHP hiện tại: $current. Yêu cầu PHP $required trở lên.";
    
    return displayResult("Phiên bản PHP", $result, $message);
}

// Kiểm tra extension mysqli
function checkMysqli() {
    $result = extension_loaded('mysqli');
    $message = $result 
        ? "Extension mysqli đã được cài đặt" 
        : "Extension mysqli chưa được cài đặt. Hãy bật extension này trong php.ini.";
    
    return displayResult("Extension mysqli", $result, $message);
}

// Kiểm tra extension curl
function checkCurl() {
    $result = extension_loaded('curl');
    $message = $result 
        ? "Extension curl đã được cài đặt" 
        : "Extension curl chưa được cài đặt. Hãy bật extension này trong php.ini.";
    
    return displayResult("Extension curl", $result, $message);
}

// Kiểm tra file config.php
function checkConfigFile() {
    $configFile = __DIR__ . '/config.php';
    $result = file_exists($configFile);
    $message = $result 
        ? "File config.php tồn tại" 
        : "File config.php không tồn tại. Hãy tạo file này theo hướng dẫn.";
    
    return displayResult("File config.php", $result, $message);
}

// Kiểm tra thư mục vendor
function checkVendorDirectory() {
    $vendorDir = __DIR__ . '/vendor';
    $autoloadFile = $vendorDir . '/autoload.php';
    $result = file_exists($autoloadFile);
    $message = $result 
        ? "Thư mục vendor đã được cài đặt" 
        : "Thư mục vendor chưa được cài đặt hoặc không đầy đủ. Hãy chạy 'composer install'.";
    
    return displayResult("Composer dependencies", $result, $message);
}

// Kiểm tra kết nối cơ sở dữ liệu
function checkDatabaseConnection() {
    if (!file_exists(__DIR__ . '/config.php')) {
        return displayResult("Kết nối cơ sở dữ liệu", false, "Không thể kiểm tra kết nối vì file config.php không tồn tại");
    }
    
    // Tải file config
    require_once __DIR__ . '/config.php';
    
    // Kiểm tra xem các biến cấu hình có tồn tại không
    if (!isset($db_host) || !isset($db_user) || !isset($db_pass) || !isset($db_name)) {
        return displayResult("Kết nối cơ sở dữ liệu", false, "Thiếu thông tin cấu hình cơ sở dữ liệu trong file config.php");
    }
    
    // Thử kết nối
    $conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);
    $result = !$conn->connect_error;
    $message = $result 
        ? "Kết nối cơ sở dữ liệu thành công" 
        : "Không thể kết nối đến cơ sở dữ liệu: " . $conn->connect_error;
    
    if ($result) {
        $conn->close();
    }
    
    return displayResult("Kết nối cơ sở dữ liệu", $result, $message);
}

// Kiểm tra Google API config
function checkGoogleAPIConfig() {
    if (!file_exists(__DIR__ . '/config.php')) {
        return displayResult("Cấu hình Google API", false, "Không thể kiểm tra cấu hình vì file config.php không tồn tại");
    }
    
    // Tải file config
    require_once __DIR__ . '/config.php';
    
    // Kiểm tra xem các biến cấu hình có tồn tại không
    $result = isset($google_client_id) && isset($google_client_secret) && isset($google_redirect_uri);
    $message = $result 
        ? "Cấu hình Google API đã được thiết lập" 
        : "Thiếu thông tin cấu hình Google API trong file config.php";
    
    return displayResult("Cấu hình Google API", $result, $message);
}

// Kiểm tra quyền ghi file
function checkWritePermissions() {
    $testDir = __DIR__ . '/../public';
    $result = is_writable($testDir);
    $message = $result 
        ? "Thư mục public có quyền ghi" 
        : "Thư mục public không có quyền ghi. Hãy cấp quyền ghi cho thư mục này.";
    
    return displayResult("Quyền ghi file", $result, $message, false);
}

// Kiểm tra các file PHP đã được tạo
function checkPHPFiles() {
    $requiredFiles = [
        '../public/php/trangchu.php',
        '../public/php/dubao.php',
        '../public/php/thanhpho.php',
        '../public/php/thongbao.php',
        '../loading_php.php'
    ];
    
    $missingFiles = [];
    foreach ($requiredFiles as $file) {
        if (!file_exists(__DIR__ . '/' . $file)) {
            $missingFiles[] = $file;
        }
    }
    
    $result = empty($missingFiles);
    $message = $result 
        ? "Tất cả các file PHP cần thiết đã tồn tại" 
        : "Thiếu các file PHP sau: " . implode(', ', $missingFiles);
    
    return displayResult("File PHP", $result, $message);
}

// Kiểm tra Apache Rewrite Module
function checkApacheRewrite() {
    $result = function_exists('apache_get_modules') && in_array('mod_rewrite', apache_get_modules());
    $message = $result 
        ? "Apache mod_rewrite đã được bật" 
        : "Apache mod_rewrite chưa được bật hoặc không thể kiểm tra. Hãy bật module này trong cấu hình Apache.";
    
    return displayResult("Apache mod_rewrite", $result, $message, false);
}

// Kiểm tra .htaccess
function checkHtaccess() {
    $htaccessFile = __DIR__ . '/.htaccess';
    $result = file_exists($htaccessFile);
    $message = $result 
        ? "File .htaccess tồn tại" 
        : "File .htaccess không tồn tại. Hãy tạo file này để hỗ trợ URL rewriting.";
    
    return displayResult("File .htaccess", $result, $message, false);
}

// Hiển thị trang HTML
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kiểm tra cài đặt PHP - Weather-Web</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: left;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
        }
        .warning {
            background-color: #fff3cd;
            color: #856404;
        }
        .summary {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
        }
        .summary.success {
            border: 1px solid #c3e6cb;
        }
        .summary.error {
            border: 1px solid #f5c6cb;
        }
        .summary.warning {
            border: 1px solid #ffeeba;
        }
        .next-steps {
            margin-top: 20px;
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
        }
        .next-steps h2 {
            margin-top: 0;
        }
        .next-steps ol {
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <h1>Kiểm tra cài đặt PHP - Weather-Web</h1>
    
    <p>Script này sẽ kiểm tra xem môi trường PHP của bạn đã được cấu hình đúng để chạy ứng dụng Weather-Web chưa.</p>
    
    <table>
        <thead>
            <tr>
                <th>Kiểm tra</th>
                <th>Kết quả</th>
                <th>Thông tin</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $phpVersion = checkPHPVersion();
            $mysqli = checkMysqli();
            $curl = checkCurl();
            $configFile = checkConfigFile();
            $vendorDir = checkVendorDirectory();
            $dbConnection = checkDatabaseConnection();
            $googleAPI = checkGoogleAPIConfig();
            $writePermissions = checkWritePermissions();
            $phpFiles = checkPHPFiles();
            $apacheRewrite = checkApacheRewrite();
            $htaccess = checkHtaccess();
            
            $requiredTests = [$phpVersion, $mysqli, $curl, $configFile, $vendorDir, $dbConnection, $googleAPI, $phpFiles];
            $allRequired = !in_array(false, $requiredTests);
            $allTests = !in_array(false, [$phpVersion, $mysqli, $curl, $configFile, $vendorDir, $dbConnection, $googleAPI, $writePermissions, $phpFiles, $apacheRewrite, $htaccess]);
            ?>
        </tbody>
    </table>
    
    <div class="summary <?php echo $allRequired ? ($allTests ? 'success' : 'warning') : 'error'; ?>">
        <?php if ($allRequired): ?>
            <?php if ($allTests): ?>
                <h2>✅ Tất cả các kiểm tra đều thành công!</h2>
                <p>Môi trường PHP của bạn đã được cấu hình đúng để chạy ứng dụng Weather-Web.</p>
            <?php else: ?>
                <h2>⚠️ Các kiểm tra bắt buộc đều thành công, nhưng có một số cảnh báo</h2>
                <p>Ứng dụng có thể chạy được, nhưng một số tính năng có thể không hoạt động đúng.</p>
            <?php endif; ?>
        <?php else: ?>
            <h2>❌ Một số kiểm tra bắt buộc không thành công</h2>
            <p>Vui lòng khắc phục các lỗi được liệt kê ở trên trước khi chạy ứng dụng.</p>
        <?php endif; ?>
    </div>
    
    <div class="next-steps">
        <h2>Các bước tiếp theo</h2>
        <?php if ($allRequired): ?>
            <ol>
                <li>Truy cập ứng dụng tại: <a href="../index.php">http://localhost/weathery/php/</a></li>
                <li>Nếu bạn gặp vấn đề, hãy kiểm tra lại các cấu hình trong file config.php</li>
                <li>Đọc tài liệu hướng dẫn tại <a href="README_HYBRID.md">README_HYBRID.md</a> để biết thêm thông tin</li>
            </ol>
        <?php else: ?>
            <ol>
                <li>Khắc phục các lỗi được liệt kê ở trên</li>
                <li>Chạy lại script này để kiểm tra lại</li>
                <li>Nếu bạn cần trợ giúp, hãy tham khảo tài liệu hướng dẫn hoặc liên hệ với người phát triển</li>
            </ol>
        <?php endif; ?>
    </div>
</body>
</html>