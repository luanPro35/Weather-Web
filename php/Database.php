<?php
/**
 * Database Connection Class
 * 
 * This class handles database connections and provides methods for secure database operations.
 */

class Database {
    private $connection;
    private static $instance = null;
    
    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {
        $this->connect();
    }
    
    /**
     * Get database instance (Singleton pattern)
     * 
     * @return Database The database instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Connect to the database
     * 
     * @return void
     */
    private function connect() {
        try {
            $this->connection = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
            
            if ($this->connection->connect_error) {
                throw new Exception("Database connection failed: " . $this->connection->connect_error);
            }
            
            // Set character set to UTF-8
            $this->connection->set_charset("utf8mb4");
            
        } catch (Exception $e) {
            if (is_development()) {
                die("Database connection error: " . $e->getMessage());
            } else {
                app_log("Database connection error: " . $e->getMessage(), "error");
                die("Database connection error. Please try again later.");
            }
        }
    }
    
    /**
     * Get the database connection
     * 
     * @return mysqli The database connection
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Execute a query with prepared statement
     * 
     * @param string $query The SQL query with placeholders
     * @param string $types The types of parameters (s: string, i: integer, d: double, b: blob)
     * @param array $params The parameters to bind
     * @return mysqli_stmt|false The prepared statement or false on failure
     */
    public function query($query, $types = "", $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            
            if ($stmt === false) {
                throw new Exception("Query preparation failed: " . $this->connection->error);
            }
            
            // Bind parameters if provided
            if (!empty($params) && !empty($types)) {
                $stmt->bind_param($types, ...$params);
            }
            
            // Execute the statement
            if (!$stmt->execute()) {
                throw new Exception("Query execution failed: " . $stmt->error);
            }
            
            return $stmt;
            
        } catch (Exception $e) {
            if (is_development()) {
                die("Database query error: " . $e->getMessage());
            } else {
                app_log("Database query error: " . $e->getMessage(), "error");
                return false;
            }
        }
    }
    
    /**
     * Fetch a single row from a query result
     * 
     * @param string $query The SQL query with placeholders
     * @param string $types The types of parameters
     * @param array $params The parameters to bind
     * @return array|null The result row or null if not found
     */
    public function fetchOne($query, $types = "", $params = []) {
        $stmt = $this->query($query, $types, $params);
        
        if ($stmt === false) {
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        
        return $row;
    }
    
    /**
     * Fetch all rows from a query result
     * 
     * @param string $query The SQL query with placeholders
     * @param string $types The types of parameters
     * @param array $params The parameters to bind
     * @return array The result rows
     */
    public function fetchAll($query, $types = "", $params = []) {
        $stmt = $this->query($query, $types, $params);
        
        if ($stmt === false) {
            return [];
        }
        
        $result = $stmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        return $rows;
    }
    
    /**
     * Insert data into a table
     * 
     * @param string $table The table name
     * @param array $data Associative array of column => value
     * @return int|false The inserted ID or false on failure
     */
    public function insert($table, $data) {
        $columns = array_keys($data);
        $values = array_values($data);
        $placeholders = array_fill(0, count($values), '?');
        
        $query = "INSERT INTO {$table} (" . implode(', ', $columns) . ") "
               . "VALUES (" . implode(', ', $placeholders) . ")";
        
        // Determine types string
        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } elseif (is_string($value)) {
                $types .= 's';
            } else {
                $types .= 'b';
            }
        }
        
        $stmt = $this->query($query, $types, $values);
        
        if ($stmt === false) {
            return false;
        }
        
        $insertId = $this->connection->insert_id;
        $stmt->close();
        
        return $insertId;
    }
    
    /**
     * Update data in a table
     * 
     * @param string $table The table name
     * @param array $data Associative array of column => value
     * @param string $where The WHERE clause
     * @param string $whereTypes The types of WHERE parameters
     * @param array $whereParams The WHERE parameters
     * @return int|false The number of affected rows or false on failure
     */
    public function update($table, $data, $where, $whereTypes = "", $whereParams = []) {
        $columns = array_keys($data);
        $values = array_values($data);
        $set = [];
        
        foreach ($columns as $column) {
            $set[] = "{$column} = ?";
        }
        
        $query = "UPDATE {$table} SET " . implode(', ', $set) . " WHERE {$where}";
        
        // Determine types string for data values
        $dataTypes = '';
        foreach ($values as $value) {
            if (is_int($value)) {
                $dataTypes .= 'i';
            } elseif (is_float($value)) {
                $dataTypes .= 'd';
            } elseif (is_string($value)) {
                $dataTypes .= 's';
            } else {
                $dataTypes .= 'b';
            }
        }
        
        // Combine data and where parameters
        $allParams = array_merge($values, $whereParams);
        $allTypes = $dataTypes . $whereTypes;
        
        $stmt = $this->query($query, $allTypes, $allParams);
        
        if ($stmt === false) {
            return false;
        }
        
        $affectedRows = $stmt->affected_rows;
        $stmt->close();
        
        return $affectedRows;
    }
    
    /**
     * Delete data from a table
     * 
     * @param string $table The table name
     * @param string $where The WHERE clause
     * @param string $types The types of parameters
     * @param array $params The parameters to bind
     * @return int|false The number of affected rows or false on failure
     */
    public function delete($table, $where, $types = "", $params = []) {
        $query = "DELETE FROM {$table} WHERE {$where}";
        
        $stmt = $this->query($query, $types, $params);
        
        if ($stmt === false) {
            return false;
        }
        
        $affectedRows = $stmt->affected_rows;
        $stmt->close();
        
        return $affectedRows;
    }
    
    /**
     * Close the database connection
     * 
     * @return void
     */
    public function close() {
        if ($this->connection) {
            $this->connection->close();
        }
    }
    
    /**
     * Destructor to ensure connection is closed
     */
    public function __destruct() {
        $this->close();
    }
}