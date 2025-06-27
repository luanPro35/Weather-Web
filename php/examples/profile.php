<?php
/**
 * Example: User Profile
 * 
 * This file demonstrates how to display user profile information after login.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Create User instance
$userManager = new User();

// Check if user is logged in
if (!$userManager->isLoggedIn()) {
    // Redirect to login page
    safe_redirect('login_with_google.php');
    exit;
}

// Get current user data
$userData = $userManager->getCurrentUser();

// Set page title
$pageTitle = 'User Profile';

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
        .container { max-width: 800px; margin: 0 auto; }
        .profile-card { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
            display: flex;
            align-items: center;
        }
        .profile-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-right: 20px;
            object-fit: cover;
        }
        .profile-info { flex: 1; }
        .profile-info h2 { margin-top: 0; }
        .profile-info p { margin: 5px 0; }
        .section { background: #fff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ddd; }
        .btn { 
            display: inline-block;
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 8px 15px; 
            border-radius: 4px; 
            cursor: pointer;
            text-decoration: none;
        }
        .btn-danger { background: #dc3545; }
        .btn:hover { opacity: 0.9; }
        .back-link { margin-top: 20px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo h($pageTitle); ?></h1>
        
        <div class="profile-card">
            <?php if (!empty($userData['avatar'])): ?>
                <img src="<?php echo h($userData['avatar']); ?>" alt="Profile Picture" class="profile-image">
            <?php else: ?>
                <div class="profile-image" style="background: #ccc; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px; color: #666;"><?php echo h(substr($userData['name'], 0, 1)); ?></span>
                </div>
            <?php endif; ?>
            
            <div class="profile-info">
                <h2><?php echo h($userData['name']); ?></h2>
                <p><strong>Email:</strong> <?php echo h($userData['email']); ?></p>
                <?php if (!empty($userData['last_login'])): ?>
                    <p><strong>Last Login:</strong> <?php echo h($userData['last_login']); ?></p>
                <?php endif; ?>
                <a href="logout.php" class="btn btn-danger">Logout</a>
            </div>
        </div>
        
        <div class="section">
            <h2>Account Information</h2>
            <p><strong>User ID:</strong> <?php echo h($userData['id']); ?></p>
            <p><strong>Account Created:</strong> <?php echo h($userData['created_at'] ?? 'Unknown'); ?></p>
            <?php if (!empty($userData['google_id'])): ?>
                <p><strong>Google Account Linked:</strong> Yes</p>
            <?php endif; ?>
        </div>
        
        <div class="section">
            <h2>How User Authentication Works</h2>
            <p>This example demonstrates how user authentication is implemented in the Weather-Web application:</p>
            <ol>
                <li>Users sign in with their Google account</li>
                <li>The application verifies their identity with Google</li>
                <li>User information is stored in the database</li>
                <li>A session is created to maintain the user's logged-in state</li>
                <li>Protected pages (like this one) check if the user is logged in</li>
                <li>If not logged in, users are redirected to the login page</li>
            </ol>
            
            <h3>Key Components:</h3>
            <ul>
                <li><strong>User Class:</strong> Handles authentication, session management, and user data</li>
                <li><strong>Database Class:</strong> Manages database operations for user data</li>
                <li><strong>Helper Functions:</strong> Provide utilities for security and environment configuration</li>
            </ul>
        </div>
        
        <a href="index.php" class="back-link">&larr; Back to Examples</a>
    </div>
</body>
</html>