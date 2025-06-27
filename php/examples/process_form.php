<?php
/**
 * Example: Form Processing with CSRF Protection
 * 
 * This file demonstrates how to process form submissions with CSRF protection.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Set page title
$pageTitle = 'Form Processing Example';

// Initialize variables
$message = '';
$messageType = '';
$formData = [];

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check CSRF token
    if (!isset($_POST['csrf_token']) || !verify_csrf_token($_POST['csrf_token'])) {
        $message = 'CSRF token validation failed. Please try again.';
        $messageType = 'error';
        
        // Log the CSRF failure
        app_log('CSRF validation failed in process_form.php', 'warning');
    } else {
        // CSRF validation passed, process the form data
        $formData = $_POST;
        
        // Remove the CSRF token from the data array
        unset($formData['csrf_token']);
        
        // Sanitize all input data
        foreach ($formData as $key => $value) {
            $formData[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }
        
        // Here you would typically do something with the data
        // For example, save to database, send email, etc.
        
        // For this example, we'll just display the received data
        $message = 'Form submitted successfully!';
        $messageType = 'success';
        
        // Log the successful submission
        app_log('Form processed successfully in process_form.php', 'info');
    }
}

// Generate a new CSRF token for the form
$csrfToken = generate_csrf_token();

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
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input[type="text"], input[type="email"], textarea { 
            width: 100%; 
            padding: 8px; 
            border: 1px solid #ddd; 
            border-radius: 4px; 
            box-sizing: border-box; 
        }
        button { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 10px 15px; 
            border-radius: 4px; 
            cursor: pointer; 
        }
        button:hover { background: #0069d9; }
        .message { padding: 10px; border-radius: 4px; margin-bottom: 20px; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .data-display { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px; }
        .back-link { margin-top: 20px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo h($pageTitle); ?></h1>
        
        <?php if ($message): ?>
            <div class="message <?php echo $messageType; ?>">
                <?php echo h($message); ?>
            </div>
        <?php endif; ?>
        
        <?php if ($messageType === 'success' && !empty($formData)): ?>
            <div class="data-display">
                <h2>Received Form Data:</h2>
                <ul>
                    <?php foreach ($formData as $key => $value): ?>
                        <li><strong><?php echo h($key); ?>:</strong> <?php echo h($value); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
        
        <h2>Submit a Form</h2>
        <p>This example demonstrates form processing with CSRF protection.</p>
        
        <form method="post" action="">
            <!-- CSRF Token -->
            <input type="hidden" name="csrf_token" value="<?php echo h($csrfToken); ?>">
            
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4" required></textarea>
            </div>
            
            <button type="submit">Submit Form</button>
        </form>
        
        <h2>How CSRF Protection Works</h2>
        <p>This form is protected against Cross-Site Request Forgery (CSRF) attacks using the following steps:</p>
        <ol>
            <li>A unique token is generated using <code>generate_csrf_token()</code> and stored in the session</li>
            <li>The token is included as a hidden field in the form</li>
            <li>When the form is submitted, the token is validated using <code>verify_csrf_token()</code></li>
            <li>If validation fails, the form submission is rejected</li>
        </ol>
        
        <a href="index.php" class="back-link">&larr; Back to Examples</a>
    </div>
</body>
</html>