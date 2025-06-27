<?php
require_once 'config.php';

try {
    // Kết nối đến MySQL
    $conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    echo "Database connection successful!\n";
    
    // Kiểm tra bảng users
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows > 0) {
        echo "Table 'users' exists!\n";
        
        // Kiểm tra cấu trúc bảng
        $result = $conn->query("DESCRIBE users");
        echo "Table structure:\n";
        while ($row = $result->fetch_assoc()) {
            echo "- {$row['Field']}: {$row['Type']}\n";
        }
    } else {
        echo "Table 'users' does not exist!\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>