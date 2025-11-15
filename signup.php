<?php
include('php/db_connect.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if (empty($username) || empty($password)) {
        echo "<script>alert('Please fill all fields!'); window.history.back();</script>";
        exit();
    }

    // Check if username already exists
    $checkUser = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $checkUser->bind_param("s", $username);
    $checkUser->execute();
    $result = $checkUser->get_result();

    if ($result->num_rows > 0) {
        echo "<script>alert('Username already exists! Please choose another.'); window.history.back();</script>";
    } else {
        // Hash password for security
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $username, $hashedPassword);

        if ($stmt->execute()) {
            echo "<script>alert('Registration successful! You can now login.'); window.location='login.html';</script>";
        } else {
            echo "<script>alert('Error during registration. Try again!'); window.history.back();</script>";
        }

        $stmt->close();
    }

    $checkUser->close();
}
$conn->close();
?>
