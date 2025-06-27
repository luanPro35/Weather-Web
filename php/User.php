<?php
/**
 * User Class
 * 
 * This class handles user authentication and management.
 */

class User {
    private $db;
    private $userData = null;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Get user by ID
     * 
     * @param int $userId The user ID
     * @return array|null The user data or null if not found
     */
    public function getById($userId) {
        return $this->db->fetchOne(
            "SELECT * FROM users WHERE id = ?",
            "i",
            [$userId]
        );
    }
    
    /**
     * Get user by email
     * 
     * @param string $email The user email
     * @return array|null The user data or null if not found
     */
    public function getByEmail($email) {
        return $this->db->fetchOne(
            "SELECT * FROM users WHERE email = ?",
            "s",
            [$email]
        );
    }
    
    /**
     * Create a new user
     * 
     * @param array $userData The user data
     * @return int|false The user ID or false on failure
     */
    public function create($userData) {
        // Validate required fields
        $requiredFields = ['email', 'name'];
        foreach ($requiredFields as $field) {
            if (!isset($userData[$field]) || empty($userData[$field])) {
                return false;
            }
        }
        
        // Check if user already exists
        $existingUser = $this->getByEmail($userData['email']);
        if ($existingUser) {
            return $existingUser['id']; // Return existing user ID
        }
        
        // Add created_at timestamp
        $userData['created_at'] = date('Y-m-d H:i:s');
        
        // Insert user
        return $this->db->insert('users', $userData);
    }
    
    /**
     * Update user data
     * 
     * @param int $userId The user ID
     * @param array $userData The user data to update
     * @return int|false The number of affected rows or false on failure
     */
    public function update($userId, $userData) {
        // Add updated_at timestamp
        $userData['updated_at'] = date('Y-m-d H:i:s');
        
        return $this->db->update(
            'users',
            $userData,
            'id = ?',
            'i',
            [$userId]
        );
    }
    
    /**
     * Authenticate user with Google data
     * 
     * @param array $googleData The Google user data
     * @return int|false The user ID or false on failure
     */
    public function authenticateWithGoogle($googleData) {
        if (!isset($googleData['email']) || empty($googleData['email'])) {
            return false;
        }
        
        // Check if user exists
        $user = $this->getByEmail($googleData['email']);
        
        if ($user) {
            // Update existing user with latest Google data
            $updateData = [
                'name' => $googleData['name'] ?? $user['name'],
                'avatar' => $googleData['picture'] ?? $user['avatar'],
                'last_login' => date('Y-m-d H:i:s')
            ];
            
            $this->update($user['id'], $updateData);
            return $user['id'];
        } else {
            // Create new user
            $newUser = [
                'email' => $googleData['email'],
                'name' => $googleData['name'] ?? '',
                'avatar' => $googleData['picture'] ?? '',
                'google_id' => $googleData['id'] ?? '',
                'last_login' => date('Y-m-d H:i:s')
            ];
            
            return $this->create($newUser);
        }
    }
    
    /**
     * Set user session
     * 
     * @param int $userId The user ID
     * @return bool True on success, false on failure
     */
    public function setSession($userId) {
        $user = $this->getById($userId);
        
        if (!$user) {
            return false;
        }
        
        // Remove sensitive data
        unset($user['password']);
        
        // Set session data
        $_SESSION['user'] = $user;
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['logged_in'] = true;
        
        return true;
    }
    
    /**
     * Check if user is logged in
     * 
     * @return bool True if logged in, false otherwise
     */
    public function isLoggedIn() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }
    
    /**
     * Get current user data
     * 
     * @return array|null The user data or null if not logged in
     */
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }
        
        if ($this->userData === null && isset($_SESSION['user_id'])) {
            $this->userData = $this->getById($_SESSION['user_id']);
        }
        
        return $this->userData;
    }
    
    /**
     * Logout user
     * 
     * @return void
     */
    public function logout() {
        // Unset user session variables
        unset($_SESSION['user']);
        unset($_SESSION['user_id']);
        unset($_SESSION['logged_in']);
        
        // Reset user data
        $this->userData = null;
        
        // Regenerate session ID for security
        session_regenerate_id(true);
    }
}