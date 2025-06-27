<?php
/**
 * Test Environment Variables
 * 
 * This script tests if environment variables are loaded correctly from the .env file.
 * Run this script to verify your environment setup.
 */

// Autoload Composer dependencies
require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    echo "Environment variables loaded successfully!\n\n";
} catch (Exception $e) {
    echo "Error loading environment variables: " . $e->getMessage() . "\n";
    exit(1);
}

// Test if required environment variables are set
$requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME'
];

$missingVars = [];

foreach ($requiredVars as $var) {
    if (!isset($_ENV[$var]) || empty($_ENV[$var])) {
        $missingVars[] = $var;
    }
}

if (!empty($missingVars)) {
    echo "Warning: The following environment variables are missing or empty:\n";
    foreach ($missingVars as $var) {
        echo "- $var\n";
    }
    echo "\nPlease check your .env file and make sure all required variables are set.\n";
} else {
    echo "All required environment variables are set!\n\n";
    
    // Display masked values for verification
    echo "Environment Variables (values masked for security):\n";
    foreach ($requiredVars as $var) {
        $value = $_ENV[$var];
        $maskedValue = (strlen($value) > 4) 
            ? substr($value, 0, 2) . str_repeat('*', strlen($value) - 4) . substr($value, -2) 
            : '****';
        echo "- $var: $maskedValue\n";
    }
}

echo "\nEnvironment test completed.\n";