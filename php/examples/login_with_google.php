<?php
/**
 * Example: Login with Google
 * 
 * This file demonstrates how to implement Google OAuth login using the User class.
 */

// Include configuration
require_once __DIR__ . '/../config.php';

// Create User instance
$userManager = new User();

// Check if user is already logged in
if ($userManager->isLoggedIn()) {
    // Redirect to profile page
    safe_redirect('profile.php');
    exit;
}

// Check if this is a Google callback
if (isset($_GET['code'])) {
    try {
        // Handle Google callback
        $googleClient = new Google_Client();
        $googleClient->setClientId(GOOGLE_CLIENT_ID);
        $googleClient->setClientSecret(GOOGLE_CLIENT_SECRET);
        $googleClient->setRedirectUri(GOOGLE_REDIRECT_URI);
        $googleClient->addScope('email');
        $googleClient->addScope('profile');
        
        // Exchange authorization code for access token
        $token = $googleClient->fetchAccessTokenWithAuthCode($_GET['code']);
        $googleClient->setAccessToken($token);
        
        // Get user profile
        $googleService = new Google_Service_Oauth2($googleClient);
        $googleUser = $googleService->userinfo->get();
        
        // Process Google user data
        $googleId = $googleUser->getId();
        $email = $googleUser->getEmail();
        $name = $googleUser->getName();
        $avatar = $googleUser->getPicture();
        
        // Authenticate user with Google data
        $userData = [
            'google_id' => $googleId,
            'email' => $email,
            'name' => $name,
            'avatar' => $avatar
        ];
        
        $userId = $userManager->authenticateWithGoogle($userData);
        
        if ($userId) {
            // Redirect to profile page after successful login
            safe_redirect('profile.php');
            exit;
        } else {
            $error = 'Authentication failed. Please try again.';
        }
    } catch (Exception $e) {
        // Log the error
        app_log('Google authentication error: ' . $e->getMessage(), 'error');
        $error = 'An error occurred during authentication. Please try again.';
    }
}

// Set page title
$pageTitle = 'Login with Google';

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
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        .login-box { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px; }
        .google-btn { 
            display: inline-block;
            background: #4285F4; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer;
            text-decoration: none;
            margin-top: 20px;
        }
        .google-btn:hover { background: #357ae8; }
        .error { color: #721c24; background-color: #f8d7da; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
        .note { background: #e8f4ff; padding: 10px; border-radius: 4px; margin: 20px 0; text-align: left; }
        .back-link { margin-top: 20px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h1><?php echo h($pageTitle); ?></h1>
        
        <?php if (isset($error)): ?>
            <div class="error">
                <?php echo h($error); ?>
            </div>
        <?php endif; ?>
        
        <div class="login-box">
            <h2>Sign in to Weather-Web</h2>
            <p>Use your Google account to sign in to the application.</p>
            
            <?php
            // Create Google login URL
            $googleClient = new Google_Client();
            $googleClient->setClientId(GOOGLE_CLIENT_ID);
            $googleClient->setClientSecret(GOOGLE_CLIENT_SECRET);
            $googleClient->setRedirectUri(GOOGLE_REDIRECT_URI);
            $googleClient->addScope('email');
            $googleClient->addScope('profile');
            
            $authUrl = $googleClient->createAuthUrl();
            ?>
            
            <a href="<?php echo h($authUrl); ?>" class="google-btn">Sign in with Google</a>
        </div>
        
        <div class="note">
            <h3>How it works:</h3>
            <ol>
                <li>Click the "Sign in with Google" button</li>
                <li>You'll be redirected to Google's authentication page</li>
                <li>After granting permission, Google will redirect back to this application</li>
                <li>The application will verify your identity and create/update your user account</li>
                <li>You'll be logged in and redirected to your profile page</li>
            </ol>
            
            <p><strong>Note:</strong> This example requires proper configuration of Google OAuth credentials in your .env file.</p>
        </div>
        
        <a href="index.php" class="back-link">&larr; Back to Examples</a>
    </div>
</body>
</html>