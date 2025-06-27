<?php
require_once 'config.php';

$client = new Google_Client();
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_CLIENT_SECRET);
$client->setRedirectUri(GOOGLE_REDIRECT_URI);
$client->addScope("email");
$client->addScope("profile");

// Bảo vệ CSRF
if (!isset($_GET['state']) || empty($_SESSION['csrf_token']) || $_GET['state'] !== $_SESSION['csrf_token']) {
    unset($_SESSION['csrf_token']);
    die('Invalid CSRF token. Please try logging in again.');
}
unset($_SESSION['csrf_token']);

if (isset($_GET['code'])) {
    try {
        // Đổi mã ủy quyền lấy access token
        $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
        if (isset($token['error'])) {
            throw new Exception('Failed to get access token: ' . htmlspecialchars($token['error_description']));
        }
        $client->setAccessToken($token);

        // Lấy thông tin người dùng
        $google_oauth = new Google_Service_Oauth2($client);
        $google_account_info = $google_oauth->userinfo->get();
        $google_id = $google_account_info->id;
        $email = $google_account_info->email;
        $name = $google_account_info->name;

        // Kết nối đến MySQL
        $conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
        if ($conn->connect_error) {
            throw new Exception("Database connection failed: " . $conn->connect_error);
        }
        $conn->set_charset("utf8mb4");

        $userNameForRedirect = '';

        // Kiểm tra người dùng đã tồn tại chưa
        $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE google_id = ?");
        if (!$stmt) {
            throw new Exception("Prepare failed (select): " . $conn->error);
        }
        $stmt->bind_param("s", $google_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Đã có user → đăng nhập
            $user = $result->fetch_assoc();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['logged_in_with_google'] = true;
            $userNameForRedirect = $user['name'];
        } else {
            // Chưa có user → đăng ký mới
            $insert_stmt = $conn->prepare("INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)");
            if (!$insert_stmt) {
                throw new Exception("Prepare failed (insert): " . $conn->error);
            }
            $insert_stmt->bind_param("sss", $google_id, $email, $name);
            if ($insert_stmt->execute()) {
                $_SESSION['user_id'] = $insert_stmt->insert_id;
                $_SESSION['user_name'] = $name;
                $_SESSION['user_email'] = $email;
                $_SESSION['logged_in_with_google'] = true;
                $userNameForRedirect = $name;
            } else {
                throw new Exception("Insert failed: " . $insert_stmt->error);
            }
            $insert_stmt->close();
        }

        $stmt->close();
        $conn->close();

        // Chuyển hướng về trang chính Node.js với tên người dùng
        $redirectUrl = 'http://localhost/weathery/loading.html?name=' . urlencode($userNameForRedirect);
        header('Location: ' . $redirectUrl);
        exit();
    } catch (Exception $e) {
        error_log("OAuth Error: " . $e->getMessage());
        die('Login error. Please try again. Details: ' . htmlspecialchars($e->getMessage()));
    }
} else {
    header('Location: login_with_google.php');
    exit();
}
?>
