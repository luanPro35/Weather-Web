<?php
/**
 * Example: Logout
 * 
 * This file demonstrates how to implement user logout functionality.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Create User instance
$userManager = new User();

// Process logout
$userManager->logout();

// Set page title
$pageTitle = 'Logged Out';

// Start HTML output
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo h($pageTitle); ?></title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        .message-box { background: #d4edda; color: #155724; padding: 20px; border-radius: 5px; margin-top: 20px; }
        .btn { 
            display: inline-block;
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer;
            text-decoration: none;
            margin-top: 20px;
        }
        .btn:hover { background: #0069d9; }
        .back-link { margin-top: 20px; display: inline-block; }
    </style>
    <meta http-equiv="refresh" content="5;url=login_with_google.php">
</head>
<body>
    <div class="container">
        <h1><?php echo h($pageTitle); ?></h1>
        
        <div class="message-box">
            <h2>You have been successfully logged out</h2>
            <p>Your session has been terminated and all session data has been cleared.</p>
            <p>You will be redirected to the login page in 5 seconds...</p>
        </div>
        
        <a href="login_with_google.php" class="btn">Login Again</a>
        
        <div style="margin-top: 30px;">
            <h3>How Logout Works:</h3>
            <p>The logout process involves:</p>
            <ol style="text-align: left;">
                <li>Destroying the PHP session</li>
                <li>Clearing session cookies</li>
                <li>Removing any stored authentication tokens</li>
                <li>Redirecting the user to a non-protected page</li>
            </ol>
        </div>
        
        <a href="index.php" class="back-link">&larr; Back to Examples</a>
    </div>
</body>
</html>