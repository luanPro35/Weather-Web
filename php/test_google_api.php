<?php
require_once 'config.php';

try {
    // Kiểm tra xem Google_Client class có tồn tại không
    if (class_exists('Google_Client')) {
        echo "Google_Client class exists!\n";
        
        // Tạo một instance của Google_Client
        $client = new Google_Client();
        echo "Successfully created Google_Client instance!\n";
        
        // Kiểm tra phiên bản
        echo "Google API Client version: " . $client->getLibraryVersion() . "\n";
        
        // Kiểm tra các cài đặt
        $client->setClientId(GOOGLE_CLIENT_ID);
        $client->setClientSecret(GOOGLE_CLIENT_SECRET);
        $client->setRedirectUri(GOOGLE_REDIRECT_URI);
        $client->addScope("email");
        $client->addScope("profile");
        
        echo "Successfully configured Google_Client!\n";
        
        // Tạo URL đăng nhập
        $authUrl = $client->createAuthUrl();
        echo "Auth URL: " . $authUrl . "\n";
    } else {
        echo "Google_Client class does not exist!\n";
        echo "Please check if Google API Client is installed correctly.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>