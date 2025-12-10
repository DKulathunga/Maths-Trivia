-- Schema for Maths-Trivia project
CREATE DATABASE IF NOT EXISTS `fruit_math_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fruit_math_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255),
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `scores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `fruit` VARCHAR(50),
  `score` INT DEFAULT 0,
  `questions_attempted` INT DEFAULT 0,
  `correct_answers` INT DEFAULT 0,
  `accuracy` INT DEFAULT 0,
  `played_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
