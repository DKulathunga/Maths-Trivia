<?php
// Start the session
session_start();

// Database connection
$servername = "localhost";
$username = "root";
$password = ""; // Default for XAMPP
$dbname = "fruit_math_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// When form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Validate inputs
    if (!empty($username) && !empty($email) && !empty($password)) {
        // Check if user already exists
        $checkUser = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $checkUser->bind_param("s", $email);
        $checkUser->execute();
        $result = $checkUser->get_result();

        if ($result->num_rows > 0) {
            echo "<script>alert('Email already registered! Please log in.'); window.location.href='login.php';</script>";
        } else {
            // Hash password before saving
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Insert new user
            $insertUser = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
            $insertUser->bind_param("sss", $username, $email, $hashedPassword);

            if ($insertUser->execute()) {
                echo "<script>alert('Registration successful! You can now log in.'); window.location.href='login.php';</script>";
            } else {
                echo "Error: " . $insertUser->error;
            }
        }
    } else {
        echo "<script>alert('Please fill all fields!');</script>";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Fruit Math Trivia</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Create Your Account 🍎</h1>
        <form method="POST" action="">
            <input type="text" name="username" placeholder="Enter username" required><br>
            <input type="email" name="email" placeholder="Enter email" required><br>
            <input type="password" name="password" placeholder="Enter password" required><br>
            <button type="submit">Register</button>
        </form>
        <p>Already have an account? <a href="login.php">Login here</a></p>
    </div>
</body>
</html>
