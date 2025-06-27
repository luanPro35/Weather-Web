<?php
/**
 * Example: Helper Functions
 * 
 * This file demonstrates how to use the helper functions defined in helpers.php.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Set page title
$pageTitle = 'Helper Functions Example';

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
        .warning { color: orange; }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo h($pageTitle); ?></h1>
        <p>This page demonstrates how to use the helper functions defined in helpers.php.</p>
        
        <div class="example">
            <h2>1. Environment Variables (env)</h2>
            
            <h3>Example Code:</h3>
            <div class="code">
                $dbHost = env('DB_HOST', 'localhost');
                $appEnv = env('APP_ENV', 'production');
            </div>
            
            <h3>Result:</h3>
            <div class="result">
                <p>DB_HOST: <?php echo h(env('DB_HOST', 'not set')); ?></p>
                <p>APP_ENV: <?php echo h(env('APP_ENV', 'not set')); ?></p>
                <p>Custom variable with default: <?php echo h(env('CUSTOM_VAR', 'default value')); ?></p>
            </div>
        </div>
        
        <div class="example">
            <h2>2. Environment Checks</h2>
            
            <h3>Example Code:</h3>
            <div class="code">
                if (is_development()) {
                    // Show debugging information
                }
                
                if (is_production()) {
                    // Use production settings
                }
            </div>
            
            <h3>Result:</h3>
            <div class="result">
                <p>Current environment: <strong><?php echo h(env('APP_ENV', 'not set')); ?></strong></p>
                <p>is_development(): <?php echo is_development() ? '<span class="success">true</span>' : '<span class="error">false</span>'; ?></p>
                <p>is_production(): <?php echo is_production() ? '<span class="success">true</span>' : '<span class="error">false</span>'; ?></p>
                
                <?php if (is_development()): ?>
                    <div class="warning">This message only appears in development mode.</div>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="example">
            <h2>3. XSS Prevention (h)</h2>
            
            <h3>Example Code:</h3>
            <div class="code">
                $userInput = '<script>alert("XSS");</script>';
                echo h($userInput);
            </div>
            
            <h3>Result:</h3>
            <div class="result">
                <?php
                $userInput = '<script>alert("XSS");</script>';
                ?>
                <p>Original input: <code><?php echo $userInput; ?></code></p>
                <p>After h() function: <code><?php echo h($userInput); ?></code></p>
                <p>HTML source: <code>&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;</code></p>
            </div>
        </div>
        
        <div class="example">
            <h2>4. CSRF Protection</h2>
            
            <h3>Example Code:</h3>
            <div class="code">
                // Generate token
                $token = generate_csrf_token();
                
                // In form
                echo '<input type="hidden" name="csrf_token" value="' . h($token) . '">';
                
                // Verify token
                if (verify_csrf_token($_POST['csrf_token'])) {
                    // Process form
                }
            </div>
            
            <h3>Result:</h3>
            <div class="result">
                <?php
                // Check if CSRF protection is enabled
                $csrfEnabled = env('ENABLE_CSRF_PROTECTION', false);
                
                if ($csrfEnabled) {
                    $token = generate_csrf_token();
                    echo "<p>CSRF Protection is <span class='success'>enabled</span></p>";
                    echo "<p>Generated token: <code>" . h(substr($token, 0, 10) . '...') . "</code></p>";
                    
                    // Example form with CSRF token
                    echo "<form method='post' action='#'>";
                    echo "<input type='hidden' name='csrf_token' value='" . h($token) . "'>";
                    echo "<input type='text' name='example' placeholder='Example input'>";
                    echo "<button type='submit'>Submit</button>";
                    echo "</form>";
                } else {
                    echo "<p>CSRF Protection is <span class='error'>disabled</span></p>";
                    echo "<p>Set ENABLE_CSRF_PROTECTION=true in your .env file to enable it.</p>";
                }
                ?>
            </div>
        </div>
        
        <div class="example">
            <h2>5. Safe Redirect</h2>
            
            <h3>Example Code:</h3>
            <div class="code">
                // Safe redirect to internal URL
                safe_redirect('/dashboard.php');
                
                // This will fail for external URLs
                safe_redirect('https://malicious-site.com');
            </div>
            
            <h3>How It Works:</h3>
            <div class="result">
                <p>The <code>safe_redirect()</code> function:</p>
                <ul>
                    <li>Validates that the URL is safe (internal to your application)</li>
                    <li>Prevents open redirect vulnerabilities</li>
                    <li>Throws an exception for potentially malicious URLs</li>
                </ul>
                
                <p>Examples:</p>
                <ul>
                    <li><code>safe_redirect('/dashboard.php')</code> - <span class="success">Safe</span></li>
                    <li><code>safe_redirect('profile.php?id=123')</code> - <span class="success">Safe</span></li>
                    <li><code>safe_redirect('https://example.com')</code> - <span class="error">Unsafe</span></li>
                    <li><code>safe_redirect('//evil.com')</code> - <span class="error">Unsafe</span></li>
                </ul>
            </div>
        </div>
        
        <div class="example">
            <h2>6. Logging</h2>
            
            <h3>Example Code:</h3>
            <div class="code">
                // Log different types of messages
                app_log('User logged in', 'info');
                app_log('Database connection failed', 'error');
                app_log('Performance warning', 'warning');
            </div>
            
            <h3>Result:</h3>
            <div class="result">
                <?php
                // Log a test message
                $logMessage = 'Helper example page was viewed at ' . date('Y-m-d H:i:s');
                app_log($logMessage, 'info');
                
                // Get log file path
                $logDir = __DIR__ . '/../logs';
                $logFile = $logDir . '/app.log';
                
                echo "<p>Message logged: <code>" . h($logMessage) . "</code></p>";
                
                if (file_exists($logFile)) {
                    echo "<p>Log file exists at: <code>" . h($logFile) . "</code></p>";
                    
                    // Show last few lines of log file if in development
                    if (is_development()) {
                        $logContent = file_get_contents($logFile);
                        $logLines = explode("\n", $logContent);
                        $lastLines = array_slice($logLines, -5);
                        
                        echo "<p>Last 5 log entries:</p>";
                        echo "<pre>" . h(implode("\n", $lastLines)) . "</pre>";
                    }
                } else {
                    echo "<p class='error'>Log file does not exist yet.</p>";
                }
                ?>
            </div>
        </div>
        
        <p><a href="../index.php">Back to Home</a></p>
    </div>
</body>
</html>