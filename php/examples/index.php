<?php
/**
 * Examples Index Page
 * 
 * This file provides navigation to all example files demonstrating the usage
 * of the Weather-Web PHP components and helpers.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Set page title
$pageTitle = 'Weather-Web PHP Examples';

// Define available examples
$examples = [
    [
        'title' => 'User Authentication Example',
        'file' => 'user_example.php',
        'description' => 'Demonstrates how to use the User class for authentication and user management.'
    ],
    [
        'title' => 'Database Operations Example',
        'file' => 'database_example.php',
        'description' => 'Shows how to use the Database class for common database operations.'
    ],
    [
        'title' => 'Helper Functions Example',
        'file' => 'helpers_example.php',
        'description' => 'Illustrates the usage of helper functions for environment variables, CSRF protection, XSS prevention, and more.'
    ],
    [
        'title' => 'Form Processing with CSRF Protection',
        'file' => 'process_form.php',
        'description' => 'Shows how to process form submissions with CSRF protection.'
    ],
    [
        'title' => 'Google OAuth Login',
        'file' => 'login_with_google.php',
        'description' => 'Demonstrates how to implement Google OAuth login functionality.'
    ],
    [
        'title' => 'User Profile',
        'file' => 'profile.php',
        'description' => 'Shows how to display user profile information after login.'
    ],
    [
        'title' => 'Logout',
        'file' => 'logout.php',
        'description' => 'Demonstrates how to implement user logout functionality.'
    ]
];

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
        .card { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .card:hover { background: #e8f4ff; }
        h1, h2, h3 { color: #333; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .back-link { margin-top: 20px; display: inline-block; }
        .env-info { background: #e8f4ff; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .warning { color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo h($pageTitle); ?></h1>
        
        <div class="env-info">
            <p><strong>Current Environment:</strong> <?php echo h(env('APP_ENV', 'not set')); ?></p>
            <?php if (!is_development()): ?>
                <div class="warning">
                    <strong>Note:</strong> Some examples may have limited functionality in production mode.
                    Set <code>APP_ENV=development</code> in your <code>.env</code> file to see all features.
                </div>
            <?php endif; ?>
        </div>
        
        <p>These examples demonstrate how to use the various components and helpers in the Weather-Web PHP application.</p>
        
        <h2>Available Examples</h2>
        
        <?php foreach ($examples as $example): ?>
            <div class="card">
                <h3><a href="<?php echo h($example['file']); ?>"><?php echo h($example['title']); ?></a></h3>
                <p><?php echo h($example['description']); ?></p>
                <a href="<?php echo h($example['file']); ?>">View Example &rarr;</a>
            </div>
        <?php endforeach; ?>
        
        <h2>Documentation</h2>
        
        <div class="card">
            <h3>PHP Best Practices</h3>
            <p>Learn about the best practices for developing with the Weather-Web PHP codebase.</p>
            <a href="../BEST_PRACTICES.md" target="_blank">View Documentation &rarr;</a>
        </div>
        
        <div class="card">
            <h3>Environment Setup</h3>
            <p>Instructions for setting up the environment variables and dependencies.</p>
            <a href="../ENV_SETUP.md" target="_blank">View Documentation &rarr;</a>
        </div>
        
        <div class="card">
            <h3>Security Guidelines</h3>
            <p>Important security guidelines for the Weather-Web application.</p>
            <a href="../SECURITY.md" target="_blank">View Documentation &rarr;</a>
        </div>
        
        <a href="../../index.php" class="back-link">&larr; Back to Main Application</a>
    </div>
</body>
</html>