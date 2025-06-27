# Environment Setup Guide

## Installing Dependencies

This project now uses the `vlucas/phpdotenv` package to manage environment variables. Follow these steps to set up your environment:

1. Install the required PHP dependencies using Composer:

   ```bash
   cd php
   composer install
   ```

   This will install all dependencies defined in `composer.json`, including the new `vlucas/phpdotenv` package.

2. If you encounter any issues with Composer, make sure it's installed correctly:

   ```bash
   # Check Composer version
   composer --version
   
   # If not installed, follow the instructions at https://getcomposer.org/download/
   ```

## Setting Up Environment Variables

1. Create a `.env` file based on the provided example:

   ```bash
   # In the php directory
   cp .env.example .env
   ```

2. Edit the `.env` file to add your actual credentials:

   ```
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost/weathery/php/google_oauth_callback.php
   
   # Database Configuration
   DB_HOST=localhost
   DB_USERNAME=root
   DB_PASSWORD=your_password_here
   DB_NAME=weather
   ```

3. Make sure your `.env` file contains all the required variables as shown in the `.env.example` file.

## Verifying Your Setup

To verify that your environment is set up correctly:

1. Create a simple test file in the `php` directory (e.g., `test_env.php`):

   ```php
   <?php
   require_once __DIR__ . '/vendor/autoload.php';
   
   $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
   $dotenv->load();
   
   // Test if environment variables are loaded correctly
   echo "GOOGLE_CLIENT_ID: " . (isset($_ENV['GOOGLE_CLIENT_ID']) ? "Set" : "Not set") . "\n";
   echo "GOOGLE_CLIENT_SECRET: " . (isset($_ENV['GOOGLE_CLIENT_SECRET']) ? "Set" : "Not set") . "\n";
   echo "DB_HOST: " . (isset($_ENV['DB_HOST']) ? "Set" : "Not set") . "\n";
   ```

2. Run the test file:

   ```bash
   php test_env.php
   ```

   You should see output indicating that all environment variables are set.

## Troubleshooting

### Common Issues

1. **Class 'Dotenv\Dotenv' not found**
   - Make sure you've run `composer install`
   - Check that the autoload.php file is being included correctly

2. **Environment variables not loading**
   - Ensure your `.env` file is in the correct location (in the `php` directory)
   - Check that the file permissions allow PHP to read the file
   - Verify that the syntax in your `.env` file is correct

3. **PHP errors**
   - Make sure you're using PHP 7.4 or higher
   - Check that all required PHP extensions are enabled

### Getting Help

If you continue to experience issues, please:

1. Check the project documentation
2. Look for similar issues in the project's issue tracker
3. Reach out to the project maintainers with detailed information about your problem