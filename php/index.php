<?php
// Bắt đầu session
session_start();

// Lấy đường dẫn yêu cầu
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/weathery/php';

// Xử lý đường dẫn để xác định route
$route = str_replace($base_path, '', $request_uri);
$route = strtok($route, '?'); // Loại bỏ query string

// Mặc định là trang loading
if ($route === '/' || $route === '') {
    include_once __DIR__ . '/../loading_php.php';
    exit;
}

// Xử lý các route khác
switch ($route) {
    case '/trangchu':
        include_once __DIR__ . '/../public/php/trangchu.php';
        break;
    case '/dubao':
        include_once __DIR__ . '/../public/php/dubao.php';
        break;
    case '/thongbao':
        include_once __DIR__ . '/../public/php/thongbao.php';
        break;
    case '/thanhpho':
        include_once __DIR__ . '/../public/php/thanhpho.php';
        break;
    case '/login_with_google':
        include_once __DIR__ . '/login_with_google.php';
        break;
    case '/google_oauth_callback':
        include_once __DIR__ . '/google_oauth_callback.php';
        break;
    default:
        // Nếu không tìm thấy route, kiểm tra xem có phải là file tĩnh không
        $file_path = __DIR__ . '/..' . $route;
        if (file_exists($file_path) && is_file($file_path)) {
            // Xác định Content-Type dựa trên phần mở rộng của file
            $extension = pathinfo($file_path, PATHINFO_EXTENSION);
            switch ($extension) {
                case 'css':
                    header('Content-Type: text/css');
                    break;
                case 'js':
                    header('Content-Type: application/javascript');
                    break;
                case 'jpg':
                case 'jpeg':
                    header('Content-Type: image/jpeg');
                    break;
                case 'png':
                    header('Content-Type: image/png');
                    break;
                case 'gif':
                    header('Content-Type: image/gif');
                    break;
                case 'svg':
                    header('Content-Type: image/svg+xml');
                    break;
            }
            readfile($file_path);
            exit;
        } else {
            // Trả về lỗi 404 nếu không tìm thấy file
            header('HTTP/1.0 404 Not Found');
            echo '<h1>404 Not Found</h1>';
            echo '<p>Trang bạn yêu cầu không tồn tại.</p>';
        }
}
?>