<?php
/**
 * Example: User Authentication and Database Operations
 * 
 * This file demonstrates how to use the User and Database classes.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Example 1: Database Operations
echo "<h2>Database Example</h2>";

try {
    // Get database instance
    $db = Database::getInstance();
    
    // Example query
    $users = $db->fetchAll("SELECT id, name, email FROM users LIMIT 5");
    
    echo "<h3>Users in Database:</h3>";
    echo "<ul>";
    
    if (empty($users)) {
        echo "<li>No users found</li>";
    } else {
        foreach ($users as $user) {
            // Use h() helper function to prevent XSS
            echo "<li>" . h($user['name']) . " (" . h($user['email']) . ")</li>";
        }
    }
    
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<p>Error: " . h($e->getMessage()) . "</p>";
    app_log("Database example error: " . $e->getMessage(), "error");
}

// Example 2: User Authentication
echo "<h2>User Authentication Example</h2>";

// Create User instance
$userManager = new User();

// Check if user is logged in
if ($userManager->isLoggedIn()) {
    $currentUser = $userManager->getCurrentUser();
    
    echo "<p>You are logged in as: " . h($currentUser['name']) . "</p>";
    echo "<p>Email: " . h($currentUser['email']) . "</p>";
    
    // Example of logout link
    echo "<p><a href='logout.php'>Logout</a></p>";
} else {
    echo "<p>You are not logged in.</p>";
    
    // Example of login link
    echo "<p><a href='login_with_google.php'>Login with Google</a></p>";
}

// Example 3: Environment Variables
echo "<h2>Environment Configuration</h2>";

echo "<p>Application Environment: " . h(env('APP_ENV', 'not set')) . "</p>";

// Only show this in development mode
if (is_development()) {
    echo "<h3>Development Mode Information:</h3>";
    echo "<p>This section is only visible in development mode.</p>";
    echo "<p>Database Host: " . h(DB_HOST) . "</p>";
    echo "<p>Database Name: " . h(DB_NAME) . "</p>";
}

// Example 4: CSRF Protection
echo "<h2>CSRF Protection Example</h2>";

// Generate CSRF token
$csrfToken = generate_csrf_token();

echo "<form method='post' action='process_form.php'>";
echo "<input type='hidden' name='csrf_token' value='" . h($csrfToken) . "'>";
echo "<input type='text' name='example_field' placeholder='Example input'>";
echo "<button type='submit'>Submit Form</button>";
echo "</form>";

echo "<p>CSRF Token has been generated and included in the form.</p>";

// Example 5: Logging
echo "<h2>Logging Example</h2>";

app_log("User example page was viewed", "info");

echo "<p>A log entry has been created. Check the logs directory.</p>";

// Example of how to verify CSRF token (this would be in process_form.php)
echo "<h3>How to verify CSRF token:</h3>";

echo "<pre>";
echo htmlspecialchars("
// In process_form.php:
if (!isset(\$_POST['csrf_token']) || !verify_csrf_token(\$_POST['csrf_token'])) {
    die('CSRF token validation failed');
}

// Process form data here
// ...
");
echo "</pre>";