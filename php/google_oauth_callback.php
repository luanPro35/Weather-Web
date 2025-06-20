<?php
require_once 'config.php';

$client = new Google_Client();
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_CLIENT_SECRET);
$client->setRedirectUri(GOOGLE_REDIRECT_URI);

// Verify CSRF token
if (!isset($_GET['state']) || empty($_SESSION['csrf_token']) || $_GET['state'] !== $_SESSION['csrf_token']) {
    unset($_SESSION['csrf_token']); // Clear token on failure
    die('Invalid CSRF token. Please try logging in again.');
}
// Consume the token after successful validation
unset($_SESSION['csrf_token']);

 if (isset($_GET['code'])) {
            try {
                // ... (phần lấy thông tin Google)

                // Database connection - KẾT NỐI ĐẾN MYSQL SỬ DỤNG mysqli
                $conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
                if ($conn->connect_error) {
                    throw new Exception("Database connection failed: " . $conn->connect_error);
                }
                $conn->set_charset("utf8mb4");


                // Check if user exists - TRUY VẤN MYSQL
                $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE google_id = ?");
                if (!$stmt) {
                    throw new Exception("Prepare statement failed (select): " . $conn->error);
                }
                $stmt->bind_param("s", $google_id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    // User exists, log them in (update session)
                    $user = $result->fetch_assoc();
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['logged_in_with_google'] = true;
                } else {
                    // New user, register them - THÊM DỮ LIỆU VÀO MYSQL
                    $insert_stmt = $conn->prepare("INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)");
                    if (!$insert_stmt) {
                        throw new Exception("Prepare statement failed (insert): " . $conn->error);
                    }
                    $insert_stmt->bind_param("sss", $google_id, $email, $name);
                    if ($insert_stmt->execute()) {
                        $_SESSION['user_id'] = $insert_stmt->insert_id;
                        $_SESSION['user_name'] = $name;
                        $_SESSION['user_email'] = $email;
                        $_SESSION['logged_in_with_google'] = true;
                    } else {
                        throw new Exception("Error creating user: " . $insert_stmt->error);
                    }
                    $insert_stmt->close();
                }
                $stmt->close();
                $conn->close();

        // Redirect to your Node.js app's home page
        // Ví dụ: http://localhost:3000/trangchu
        // Trang Node.js sẽ không tự động biết về session PHP này.
        // Để hiển thị trạng thái đăng nhập trên trang Node.js, bạn cần cơ chế khác (ví dụ: token).
        header('Location: http://localhost:3000/loading');
        exit();

    } catch (Exception $e) {
        // Log the error or display a user-friendly message
        error_log("Google OAuth Error: " . $e->getMessage());
        die('An error occurred during Google login. Please try again. Details: ' . htmlspecialchars($e->getMessage()));
    }
} else {
    // No authorization code, redirect to login page
    header('Location: login_with_google.php');
    exit();
}
?>
