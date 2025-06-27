<?php
/**
 * Example: Database Operations
 * 
 * This file demonstrates how to use the Database class for common operations.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Get database instance
$db = Database::getInstance();

// Set page title
$pageTitle = 'Database Operations Example';

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
        .example { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .code { background: #eee; padding: 10px; border-left: 4px solid #007bff; font-family: monospace; overflow-x: auto; }
        .result { background: #e8f4ff; padding: 10px; margin-top: 10px; border-radius: 3px; }
        h1, h2, h3 { color: #333; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo h($pageTitle); ?></h1>
        <p>This page demonstrates how to use the Database class for common database operations.</p>
        
        <?php if (is_development()): ?>
            <div class="example">
                <h2>1. Fetching Data</h2>
                
                <h3>Example Code:</h3>
                <div class="code">
                    $users = $db->fetchAll("SELECT * FROM users LIMIT 3");
                </div>
                
                <h3>Result:</h3>
                <div class="result">
                    <?php
                    try {
                        // Check if users table exists first
                        $tableExists = $db->fetchOne("SHOW TABLES LIKE 'users'");
                        
                        if ($tableExists) {
                            $users = $db->fetchAll("SELECT * FROM users LIMIT 3");
                            
                            if (empty($users)) {
                                echo "<p>No users found in the database.</p>";
                            } else {
                                echo "<p>Found " . count($users) . " users:</p>";
                                echo "<ul>";
                                foreach ($users as $user) {
                                    echo "<li>" . h($user['name'] ?? 'Unknown') . " (" . h($user['email'] ?? 'No email') . ")</li>";
                                }
                                echo "</ul>";
                            }
                        } else {
                            echo "<p class='error'>Users table does not exist yet. You need to create it first.</p>";
                            echo "<p>Example table creation SQL:</p>";
                            echo "<div class='code'>CREATE TABLE users (\n";
                            echo "  id INT AUTO_INCREMENT PRIMARY KEY,\n";
                            echo "  name VARCHAR(255) NOT NULL,\n";
                            echo "  email VARCHAR(255) NOT NULL UNIQUE,\n";
                            echo "  avatar VARCHAR(255),\n";
                            echo "  google_id VARCHAR(255),\n";
                            echo "  last_login DATETIME,\n";
                            echo "  created_at DATETIME,\n";
                            echo "  updated_at DATETIME\n";
                            echo ");</div>";
                        }
                    } catch (Exception $e) {
                        echo "<p class='error'>Error: " . h($e->getMessage()) . "</p>";
                    }
                    ?>
                </div>
            </div>
            
            <div class="example">
                <h2>2. Inserting Data</h2>
                
                <h3>Example Code:</h3>
                <div class="code">
                    $userData = [
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                        'created_at' => date('Y-m-d H:i:s')
                    ];
                    
                    $userId = $db->insert('users', $userData);
                </div>
                
                <h3>How It Works:</h3>
                <p>The insert method:</p>
                <ol>
                    <li>Takes a table name and an associative array of data</li>
                    <li>Automatically builds the SQL query with proper placeholders</li>
                    <li>Uses prepared statements to prevent SQL injection</li>
                    <li>Returns the ID of the inserted record or false on failure</li>
                </ol>
            </div>
            
            <div class="example">
                <h2>3. Updating Data</h2>
                
                <h3>Example Code:</h3>
                <div class="code">
                    $updateData = [
                        'name' => 'John Updated',
                        'updated_at' => date('Y-m-d H:i:s')
                    ];
                    
                    $affected = $db->update('users', $updateData, 'id = ?', 'i', [1]);
                </div>
                
                <h3>How It Works:</h3>
                <p>The update method:</p>
                <ol>
                    <li>Takes a table name, data array, WHERE clause, and parameters</li>
                    <li>Automatically builds the SET part of the query</li>
                    <li>Uses prepared statements for all values</li>
                    <li>Returns the number of affected rows or false on failure</li>
                </ol>
            </div>
            
            <div class="example">
                <h2>4. Deleting Data</h2>
                
                <h3>Example Code:</h3>
                <div class="code">
                    $affected = $db->delete('users', 'id = ?', 'i', [1]);
                </div>
                
                <h3>How It Works:</h3>
                <p>The delete method:</p>
                <ol>
                    <li>Takes a table name, WHERE clause, and parameters</li>
                    <li>Uses prepared statements to prevent SQL injection</li>
                    <li>Returns the number of affected rows or false on failure</li>
                </ol>
            </div>
            
            <div class="example">
                <h2>5. Transaction Example</h2>
                
                <h3>Example Code:</h3>
                <div class="code">
                    $conn = $db->getConnection();
                    
                    try {
                        $conn->begin_transaction();
                        
                        // Multiple operations...
                        $db->insert('users', ['name' => 'User 1', 'email' => 'user1@example.com']);
                        $db->insert('users', ['name' => 'User 2', 'email' => 'user2@example.com']);
                        
                        $conn->commit();
                        echo "Transaction successful!";
                    } catch (Exception $e) {
                        $conn->rollback();
                        echo "Transaction failed: " . $e->getMessage();
                    }
                </div>
                
                <h3>When to Use Transactions:</h3>
                <ul>
                    <li>When you need to ensure multiple operations succeed or fail together</li>
                    <li>For data integrity in complex operations</li>
                    <li>When updating related tables that must stay in sync</li>
                </ul>
            </div>
        <?php else: ?>
            <div class="example">
                <h2>Production Mode</h2>
                <p class="error">Detailed database examples are only available in development mode.</p>
                <p>Set APP_ENV=development in your .env file to view the examples.</p>
            </div>
        <?php endif; ?>
        
        <div class="example">
            <h2>Best Practices</h2>
            <ul>
                <li>Always use prepared statements (the Database class handles this for you)</li>
                <li>Use transactions for operations that need to be atomic</li>
                <li>Validate and sanitize all user input before using it in queries</li>
                <li>Handle database errors gracefully</li>
                <li>Use meaningful table and column names</li>
                <li>Document your database schema</li>
            </ul>
        </div>
        
        <p><a href="../index.php">Back to Home</a></p>
    </div>
</body>
</html>