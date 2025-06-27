<?php
/**
 * Helper Functions
 * 
 * This file contains common helper functions used throughout the application.
 */

/**
 * Get environment variable with fallback
 * 
 * @param string $key The environment variable key
 * @param mixed $default The default value if the key doesn't exist
 * @return mixed The environment variable value or default
 */
function env($key, $default = null) {
    return isset($_ENV[$key]) ? $_ENV[$key] : $default;
}

/**
 * Check if the application is in development mode
 * 
 * @return bool True if in development mode, false otherwise
 */
function is_development() {
    return env('APP_ENV') === 'development';
}

/**
 * Check if the application is in production mode
 * 
 * @return bool True if in production mode, false otherwise
 */
function is_production() {
    return env('APP_ENV') === 'production';
}

/**
 * Generate a CSRF token and store it in the session
 * 
 * @return string The generated CSRF token
 */
function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token from request
 * 
 * @param string $token The token to verify
 * @return bool True if token is valid, false otherwise
 */
function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Safely redirect to a URL
 * 
 * @param string $url The URL to redirect to
 * @return void
 */
function safe_redirect($url) {
    // Validate URL to prevent open redirect vulnerabilities
    if (filter_var($url, FILTER_VALIDATE_URL) === false) {
        $url = '/'; // Default to home if invalid URL
    }
    
    header("Location: $url");
    exit;
}

/**
 * Sanitize output to prevent XSS
 * 
 * @param string $output The string to sanitize
 * @return string The sanitized string
 */
function h($output) {
    return htmlspecialchars($output, ENT_QUOTES, 'UTF-8');
}

/**
 * Log message to file
 * 
 * @param string $message The message to log
 * @param string $level The log level (info, warning, error)
 * @return void
 */
function app_log($message, $level = 'info') {
    $logFile = __DIR__ . '/logs/' . date('Y-m-d') . '.log';
    $logDir = dirname($logFile);
    
    // Create logs directory if it doesn't exist
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $formattedMessage = "[$timestamp] [$level] $message" . PHP_EOL;
    
    file_put_contents($logFile, $formattedMessage, FILE_APPEND);
}