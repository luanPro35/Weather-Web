# Weather-Web PHP Examples

This directory contains example files that demonstrate how to use the various components and helper functions in the Weather-Web PHP application.

## Purpose

These examples serve as practical demonstrations and documentation for developers working with the Weather-Web codebase. They illustrate best practices for:

- User authentication and management
- Database operations
- Environment variable handling
- CSRF protection
- XSS prevention
- Form processing
- Logging
- Security best practices

## Available Examples

### 1. User Authentication Example (`user_example.php`)

Demonstrates how to use the User class for authentication and user management, including:
- Checking if a user is logged in
- Retrieving current user data
- Login and logout functionality

### 2. Database Operations Example (`database_example.php`)

Shows how to use the Database class for common database operations:
- Connecting to the database
- Fetching data with prepared statements
- Inserting, updating, and deleting records
- Using transactions

### 3. Helper Functions Example (`helpers_example.php`)

Illustrates the usage of helper functions for:
- Environment variables
- Environment mode checking
- CSRF protection
- XSS prevention
- Safe redirects
- Logging

### 4. Form Processing with CSRF Protection (`process_form.php`)

Shows how to process form submissions with CSRF protection:
- Generating CSRF tokens
- Validating tokens on form submission
- Sanitizing input data
- Displaying form data securely

### 5. Google OAuth Login (`login_with_google.php`)

Demonstrates how to implement Google OAuth login functionality:
- Setting up Google Client
- Creating authentication URL
- Handling OAuth callback
- Processing user data from Google

### 6. User Profile (`profile.php`)

Shows how to display user profile information after login:
- Retrieving user data
- Displaying profile information securely
- Protecting routes for authenticated users only

### 7. Logout (`logout.php`)

Demonstrates how to implement user logout functionality:
- Destroying the session
- Clearing cookies
- Redirecting after logout

## How to Use

1. Make sure you have set up your environment variables in the `.env` file
2. Install PHP dependencies with Composer
3. Navigate to the examples directory in your browser (e.g., `http://localhost/Weather-Web/php/examples/`)
4. Click on any example to see it in action

## Requirements

- PHP 7.4 or higher
- MySQL database
- Composer for dependency management
- Google API credentials (for OAuth examples)

## Notes

- These examples are for demonstration purposes and may need to be adapted for production use
- Some examples require a database connection and will show appropriate messages if tables don't exist
- The examples use the helper functions, Database class, and User class from the main application
- For security reasons, some features are only available in development mode