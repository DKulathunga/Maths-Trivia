<?php
session_start();

$users = [
    'admin' => '1234',
    'dulanjali' => '5678'
];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (isset($users[$username]) && $users[$username] === $password) {
        $_SESSION['username'] = $username; // stroing the username in the session
        header("Location: index.php"); // redirecting to the main page
        exit();
    } else {
        echo "<script>alert('Invalid username or password'); window.location.href='login.php';</script>";
        exit();
    }
} else {
    header("Location: login.php");
    exit();
}
?>
