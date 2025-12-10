<?php
// setup_db.php
// Run this script locally (via browser or CLI) to create the database and tables

// Adjust these credentials if your MySQL root user uses a password
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fruit_math_db";

// Allow running from CLI or browser only on localhost
if (php_sapi_name() !== 'cli') {
    $addr = $_SERVER['REMOTE_ADDR'] ?? '';
    if ($addr !== '127.0.0.1' && $addr !== '::1' && $addr !== 'localhost') {
        die('This setup script must be run locally.');
    }
}

$mysqli = new mysqli($servername, $username, $password);
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$createDbSql = "CREATE DATABASE IF NOT EXISTS `" . $mysqli->real_escape_string($dbname) . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";
if (!$mysqli->query($createDbSql)) {
    die('Error creating database: ' . $mysqli->error);
}

if (!$mysqli->select_db($dbname)) {
    die('Error selecting database: ' . $mysqli->error);
}

$users = "CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255),
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$scores = "CREATE TABLE IF NOT EXISTS `scores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `fruit` VARCHAR(50),
  `score` INT DEFAULT 0,
  `questions_attempted` INT DEFAULT 0,
  `correct_answers` INT DEFAULT 0,
  `accuracy` INT DEFAULT 0,
  `played_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if (!$mysqli->query($users)) {
    die('Error creating users table: ' . $mysqli->error);
}

if (!$mysqli->query($scores)) {
    die('Error creating scores table: ' . $mysqli->error);
}

echo "Database and tables created (or already exist).\n";
$mysqli->close();

?>
